'use server'

import { revalidatePath } from 'next/cache'
import { clienteApi, ErroApi, ErroConexao } from '@/app/lib/cliente-api'
import { reaisParaCentavos } from '@/app/lib/moeda'
import type { TipoCobranca } from '@/app/lib/definicoes'

export type EstadoFaturamento = {
  erro?: string
  errosCampos?: Record<string, string>
  sucesso?: boolean
}

function inteiroOpcional(formData: FormData, campo: string): number | undefined {
  const bruto = String(formData.get(campo) ?? '').trim()
  if (!bruto) return undefined
  const n = Number(bruto)
  return Number.isFinite(n) ? n : undefined
}

// --- Cobranca (1:1) ---

export async function salvarCobranca(
  servicoId: number,
  _estado: EstadoFaturamento,
  formData: FormData,
): Promise<EstadoFaturamento> {
  const tipo = String(formData.get('tipo') ?? '') as TipoCobranca

  let valorCentavos: number | undefined
  if (tipo === 'COBRADO') {
    const valorReais = String(formData.get('valorReais') ?? '').trim()
    if (!valorReais) {
      return { errosCampos: { valorReais: 'Informe o valor cobrado' } }
    }
    try {
      valorCentavos = reaisParaCentavos(valorReais)
      if (!Number.isFinite(valorCentavos) || valorCentavos < 0) {
        return { errosCampos: { valorReais: 'Valor invalido' } }
      }
    } catch {
      return { errosCampos: { valorReais: 'Valor invalido' } }
    }
  }

  const corpo = {
    tipo,
    valorCentavos,
    diasPrevistos: inteiroOpcional(formData, 'diasPrevistos'),
    qtdePessoas: inteiroOpcional(formData, 'qtdePessoas'),
    obs: String(formData.get('obs') ?? '').trim() || undefined,
  }

  try {
    await clienteApi(`/servicos/${servicoId}/cobranca`, { method: 'PUT', body: corpo })
  } catch (err) {
    if (err instanceof ErroApi) return { erro: err.body.mensagem }
    if (err instanceof ErroConexao) return { erro: 'Falha de conexao com a API.' }
    return { erro: 'Erro ao salvar a cobranca.' }
  }

  revalidatePath(`/servicos/${servicoId}`)
  return { sucesso: true }
}

// --- Notas fiscais (1:N) ---

function corpoNota(formData: FormData): { numero: string; dataEmissao: string; valorCentavos: number } | { erroCampo: [string, string] } {
  const numero = String(formData.get('numero') ?? '').trim()
  if (!numero) return { erroCampo: ['numero', 'Informe o numero da NF'] }

  const dataEmissao = String(formData.get('dataEmissao') ?? '').trim()
  if (!dataEmissao) return { erroCampo: ['dataEmissao', 'Informe a data de emissao'] }

  const valorReais = String(formData.get('valorReais') ?? '').trim()
  if (!valorReais) return { erroCampo: ['valorReais', 'Informe o valor'] }
  let valorCentavos: number
  try {
    valorCentavos = reaisParaCentavos(valorReais)
    if (!Number.isFinite(valorCentavos) || valorCentavos < 0) {
      return { erroCampo: ['valorReais', 'Valor invalido'] }
    }
  } catch {
    return { erroCampo: ['valorReais', 'Valor invalido'] }
  }

  return { numero, dataEmissao, valorCentavos }
}

export async function adicionarNota(
  servicoId: number,
  _estado: EstadoFaturamento,
  formData: FormData,
): Promise<EstadoFaturamento> {
  const corpo = corpoNota(formData)
  if ('erroCampo' in corpo) return { errosCampos: { [corpo.erroCampo[0]]: corpo.erroCampo[1] } }

  try {
    await clienteApi(`/servicos/${servicoId}/notas-fiscais`, { method: 'POST', body: corpo })
  } catch (err) {
    if (err instanceof ErroApi) return { erro: err.body.mensagem }
    if (err instanceof ErroConexao) return { erro: 'Falha de conexao com a API.' }
    return { erro: 'Erro ao adicionar a nota fiscal.' }
  }

  revalidatePath(`/servicos/${servicoId}`)
  return { sucesso: true }
}

export async function editarNota(
  servicoId: number,
  nfId: number,
  _estado: EstadoFaturamento,
  formData: FormData,
): Promise<EstadoFaturamento> {
  const corpo = corpoNota(formData)
  if ('erroCampo' in corpo) return { errosCampos: { [corpo.erroCampo[0]]: corpo.erroCampo[1] } }

  try {
    await clienteApi(`/servicos/${servicoId}/notas-fiscais/${nfId}`, { method: 'PUT', body: corpo })
  } catch (err) {
    if (err instanceof ErroApi) return { erro: err.body.mensagem }
    if (err instanceof ErroConexao) return { erro: 'Falha de conexao com a API.' }
    return { erro: 'Erro ao editar a nota fiscal.' }
  }

  revalidatePath(`/servicos/${servicoId}`)
  return { sucesso: true }
}

export async function excluirNota(servicoId: number, nfId: number): Promise<void> {
  try {
    await clienteApi(`/servicos/${servicoId}/notas-fiscais/${nfId}`, { method: 'DELETE' })
  } catch (err) {
    if (err instanceof ErroApi && err.status !== 404) throw err
  }
  revalidatePath(`/servicos/${servicoId}`)
}

// --- Fechar / reabrir ---

export async function fecharFaturamento(servicoId: number): Promise<{ erro?: string }> {
  try {
    await clienteApi(`/servicos/${servicoId}/faturamento/fechar`, { method: 'POST' })
  } catch (err) {
    if (err instanceof ErroApi) return { erro: err.body.mensagem }
    if (err instanceof ErroConexao) return { erro: 'Falha de conexao com a API.' }
    return { erro: 'Erro ao fechar o faturamento.' }
  }
  revalidatePath(`/servicos/${servicoId}`)
  return {}
}

export async function reabrirFaturamento(servicoId: number): Promise<{ erro?: string }> {
  try {
    await clienteApi(`/servicos/${servicoId}/faturamento/reabrir`, { method: 'POST' })
  } catch (err) {
    if (err instanceof ErroApi) return { erro: err.body.mensagem }
    if (err instanceof ErroConexao) return { erro: 'Falha de conexao com a API.' }
    return { erro: 'Erro ao reabrir o faturamento.' }
  }
  revalidatePath(`/servicos/${servicoId}`)
  return {}
}
