'use server'

import { revalidatePath } from 'next/cache'
import { clienteApi, ErroApi, ErroConexao } from '@/app/lib/cliente-api'
import { reaisParaCentavos } from '@/app/lib/moeda'

export type EstadoCusto = {
  erro?: string
  errosCampos?: Record<string, string>
  sucesso?: boolean
}

type CorpoLancamento = {
  categoriaCustoId: number
  dataCusto: string
  descricao?: string
  valorTotalCentavos?: number
  tecnicoId?: number
  horas?: number
  km?: number
}

/**
 * Monta o corpo da requisicao a partir do FormData. Os campos relevantes
 * variam por categoria; o backend valida o que cada categoria exige.
 */
function montarCorpo(formData: FormData): CorpoLancamento | { erroCampo: [string, string] } {
  const categoriaCustoId = Number(formData.get('categoriaCustoId'))
  if (!Number.isFinite(categoriaCustoId) || categoriaCustoId <= 0) {
    return { erroCampo: ['categoriaCustoId', 'Selecione a categoria'] }
  }

  const dataCusto = String(formData.get('dataCusto') ?? '').trim()
  if (!dataCusto) {
    return { erroCampo: ['dataCusto', 'Informe a data do custo'] }
  }

  const descricao = String(formData.get('descricao') ?? '').trim() || undefined

  const tecnicoBruto = String(formData.get('tecnicoId') ?? '').trim()
  const tecnicoId = tecnicoBruto ? Number(tecnicoBruto) : undefined

  const horasBruto = String(formData.get('horas') ?? '').trim()
  const horas = horasBruto ? Number(horasBruto.replace(',', '.')) : undefined

  const kmBruto = String(formData.get('km') ?? '').trim()
  const km = kmBruto ? Number(kmBruto.replace(',', '.')) : undefined

  const valorReais = String(formData.get('valorReais') ?? '').trim()
  let valorTotalCentavos: number | undefined
  if (valorReais) {
    try {
      valorTotalCentavos = reaisParaCentavos(valorReais)
      if (!Number.isFinite(valorTotalCentavos) || valorTotalCentavos < 0) {
        return { erroCampo: ['valorReais', 'Valor invalido'] }
      }
    } catch {
      return { erroCampo: ['valorReais', 'Valor invalido'] }
    }
  }

  return { categoriaCustoId, dataCusto, descricao, valorTotalCentavos, tecnicoId, horas, km }
}

export async function lancarCusto(
  servicoId: number,
  _estado: EstadoCusto,
  formData: FormData,
): Promise<EstadoCusto> {
  const corpo = montarCorpo(formData)
  if ('erroCampo' in corpo) {
    return { errosCampos: { [corpo.erroCampo[0]]: corpo.erroCampo[1] } }
  }

  try {
    await clienteApi(`/servicos/${servicoId}/custos`, { method: 'POST', body: corpo })
  } catch (err) {
    if (err instanceof ErroApi) return { erro: err.body.mensagem }
    if (err instanceof ErroConexao) return { erro: 'Falha de conexao com a API.' }
    return { erro: 'Erro ao lancar o custo.' }
  }

  revalidatePath(`/servicos/${servicoId}`)
  return { sucesso: true }
}

export async function editarCusto(
  servicoId: number,
  custoId: number,
  _estado: EstadoCusto,
  formData: FormData,
): Promise<EstadoCusto> {
  const corpo = montarCorpo(formData)
  if ('erroCampo' in corpo) {
    return { errosCampos: { [corpo.erroCampo[0]]: corpo.erroCampo[1] } }
  }

  try {
    await clienteApi(`/servicos/${servicoId}/custos/${custoId}`, {
      method: 'PUT',
      body: corpo,
    })
  } catch (err) {
    if (err instanceof ErroApi) return { erro: err.body.mensagem }
    if (err instanceof ErroConexao) return { erro: 'Falha de conexao com a API.' }
    return { erro: 'Erro ao editar o custo.' }
  }

  revalidatePath(`/servicos/${servicoId}`)
  return { sucesso: true }
}

export async function excluirCusto(servicoId: number, custoId: number): Promise<void> {
  try {
    await clienteApi(`/servicos/${servicoId}/custos/${custoId}`, { method: 'DELETE' })
  } catch (err) {
    if (err instanceof ErroApi && err.status !== 404) throw err
  }
  revalidatePath(`/servicos/${servicoId}`)
}
