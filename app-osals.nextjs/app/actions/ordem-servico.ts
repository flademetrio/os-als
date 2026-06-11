'use server'

import { revalidatePath } from 'next/cache'
import { clienteApi, ErroApi, ErroConexao } from '@/app/lib/cliente-api'
import {
  aberturaOsSchema,
  digitacaoExecucaoSchema,
} from '@/app/lib/esquemas/ordem-servico'
import type { OrdemServicoResposta } from '@/app/lib/definicoes'

export type EstadoOrdemServico = {
  erro?: string
  errosCampos?: Record<string, string>
  sucesso?: boolean
}

function aplicarErros(parseError: {
  issues: ReadonlyArray<{ path: ReadonlyArray<PropertyKey>; message: string }>
}) {
  const errosCampos: Record<string, string> = {}
  for (const issue of parseError.issues) {
    const campo = String(issue.path[0])
    if (campo && !errosCampos[campo]) errosCampos[campo] = issue.message
  }
  return { errosCampos }
}

function idsDe(formData: FormData, campo: string): number[] {
  return formData
    .getAll(campo)
    .map((v) => Number(v))
    .filter((n) => Number.isFinite(n))
}

/** Converte um valor de input datetime-local (hora local, sem fuso) para ISO com fuso. */
function paraIso(valor: string | undefined): string | undefined {
  if (!valor) return undefined
  const d = new Date(valor)
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString()
}

export async function abrirOrdemServico(
  servicoId: number,
  _estado: EstadoOrdemServico,
  formData: FormData,
): Promise<EstadoOrdemServico> {
  const parse = aberturaOsSchema.safeParse({
    descricaoAtividade: formData.get('descricaoAtividade') ?? '',
    empresa: formData.get('empresa') ?? '',
    dataAgendada: formData.get('dataAgendada') ?? '',
    tecnicoIds: idsDe(formData, 'tecnicoIds'),
    equipamentoIds: idsDe(formData, 'equipamentoIds'),
    veiculoIds: idsDe(formData, 'veiculoIds'),
    contatoIds: idsDe(formData, 'contatoIds'),
  })
  if (!parse.success) return aplicarErros(parse.error)

  try {
    await clienteApi<OrdemServicoResposta>(`/servicos/${servicoId}/ordens-servico`, {
      method: 'POST',
      body: parse.data,
    })
  } catch (err) {
    if (err instanceof ErroApi) return { erro: err.body.mensagem }
    if (err instanceof ErroConexao) return { erro: 'Falha de conexao com a API.' }
    return { erro: 'Erro ao abrir ordem de servico.' }
  }

  revalidatePath(`/servicos/${servicoId}`)
  revalidatePath('/ordens-servico')
  return { sucesso: true }
}

export async function editarOrdemServico(
  osId: number,
  servicoId: number,
  _estado: EstadoOrdemServico,
  formData: FormData,
): Promise<EstadoOrdemServico> {
  const parse = aberturaOsSchema.safeParse({
    descricaoAtividade: formData.get('descricaoAtividade') ?? '',
    empresa: formData.get('empresa') ?? '',
    dataAgendada: formData.get('dataAgendada') ?? '',
    tecnicoIds: idsDe(formData, 'tecnicoIds'),
    equipamentoIds: idsDe(formData, 'equipamentoIds'),
    veiculoIds: idsDe(formData, 'veiculoIds'),
    contatoIds: idsDe(formData, 'contatoIds'),
  })
  if (!parse.success) return aplicarErros(parse.error)

  try {
    await clienteApi<OrdemServicoResposta>(`/ordens-servico/${osId}`, {
      method: 'PUT',
      body: parse.data,
    })
  } catch (err) {
    if (err instanceof ErroApi) return { erro: err.body.mensagem }
    if (err instanceof ErroConexao) return { erro: 'Falha de conexao com a API.' }
    return { erro: 'Erro ao editar ordem de servico.' }
  }

  revalidatePath(`/servicos/${servicoId}`)
  revalidatePath(`/ordens-servico/${osId}`)
  revalidatePath('/ordens-servico')
  return { sucesso: true }
}

export async function digitarExecucaoOs(
  osId: number,
  _estado: EstadoOrdemServico,
  formData: FormData,
): Promise<EstadoOrdemServico> {
  const parse = digitacaoExecucaoSchema.safeParse(Object.fromEntries(formData))
  if (!parse.success) return aplicarErros(parse.error)

  const corpo = {
    horaInicioExecucao: paraIso(parse.data.horaInicioExecucao),
    horaFimExecucao: paraIso(parse.data.horaFimExecucao),
    oQueFoiFeito: parse.data.oQueFoiFeito,
    observacoes: parse.data.observacoes,
    impedimentos: parse.data.impedimentos,
  }

  try {
    await clienteApi(`/ordens-servico/${osId}/digitar-execucao`, {
      method: 'POST',
      body: corpo,
    })
  } catch (err) {
    if (err instanceof ErroApi) return { erro: err.body.mensagem }
    if (err instanceof ErroConexao) return { erro: 'Falha de conexao com a API.' }
    return { erro: 'Erro ao digitar a execucao.' }
  }

  revalidatePath(`/ordens-servico/${osId}`)
  revalidatePath('/ordens-servico')
  return { sucesso: true }
}

export async function marcarDevolvidaOs(osId: number): Promise<void> {
  try {
    await clienteApi(`/ordens-servico/${osId}/marcar-devolvida`, { method: 'POST' })
  } catch (err) {
    if (err instanceof ErroApi && err.status !== 404) throw err
  }
  revalidatePath(`/ordens-servico/${osId}`)
  revalidatePath('/ordens-servico')
}

export async function cancelarOrdemServico(osId: number): Promise<void> {
  try {
    await clienteApi(`/ordens-servico/${osId}/cancelar`, { method: 'POST' })
  } catch (err) {
    if (err instanceof ErroApi && err.status !== 404) throw err
  }
  revalidatePath(`/ordens-servico/${osId}`)
  revalidatePath('/ordens-servico')
}

/** Admin: reabre uma OS cancelada (status volta a ABERTA). */
export async function reabrirOrdemServicoCancelada(osId: number): Promise<{ erro?: string }> {
  try {
    await clienteApi(`/ordens-servico/${osId}/reabrir`, { method: 'POST' })
  } catch (err) {
    if (err instanceof ErroApi) return { erro: err.body.mensagem }
    if (err instanceof ErroConexao) return { erro: 'Falha de conexao com a API.' }
    return { erro: 'Erro ao reabrir a OS.' }
  }
  revalidatePath(`/ordens-servico/${osId}`)
  revalidatePath('/ordens-servico')
  return {}
}

/** Admin: exclui permanentemente uma OS (anexo + relacoes). Retorna servicoId para
 *  o caller redirecionar para a tela do Servico se desejar. */
export async function excluirOrdemServico(
  osId: number,
  servicoId: number,
): Promise<{ erro?: string }> {
  try {
    await clienteApi(`/ordens-servico/${osId}`, { method: 'DELETE' })
  } catch (err) {
    if (err instanceof ErroApi) return { erro: err.body.mensagem }
    if (err instanceof ErroConexao) return { erro: 'Falha de conexao com a API.' }
    return { erro: 'Erro ao excluir a OS.' }
  }
  revalidatePath(`/servicos/${servicoId}`)
  revalidatePath('/ordens-servico')
  return {}
}
