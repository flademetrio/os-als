'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { clienteApi, ErroApi, ErroConexao } from '@/app/lib/cliente-api'
import { servicoSchema, novoServicoSchema } from '@/app/lib/esquemas/servico'
import type { ServicoResposta } from '@/app/lib/definicoes'

export type EstadoServico = {
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

export async function criarServico(
  _estado: EstadoServico,
  formData: FormData,
): Promise<EstadoServico> {
  const parse = novoServicoSchema.safeParse(Object.fromEntries(formData))
  if (!parse.success) return aplicarErros(parse.error)

  let criado: ServicoResposta
  try {
    criado = await clienteApi<ServicoResposta>('/servicos', {
      method: 'POST',
      body: parse.data,
    })
  } catch (err) {
    if (err instanceof ErroApi) return { erro: err.body.mensagem }
    if (err instanceof ErroConexao) return { erro: 'Falha de conexao com a API.' }
    return { erro: 'Erro ao criar servico.' }
  }

  revalidatePath('/servicos')
  redirect(`/servicos/${criado.id}`)
}

export async function atualizarServico(
  id: number,
  _estado: EstadoServico,
  formData: FormData,
): Promise<EstadoServico> {
  const parse = servicoSchema.safeParse(Object.fromEntries(formData))
  if (!parse.success) return aplicarErros(parse.error)

  try {
    await clienteApi(`/servicos/${id}`, { method: 'PUT', body: parse.data })
  } catch (err) {
    if (err instanceof ErroApi) return { erro: err.body.mensagem }
    if (err instanceof ErroConexao) return { erro: 'Falha de conexao com a API.' }
    return { erro: 'Erro ao atualizar servico.' }
  }

  revalidatePath(`/servicos/${id}`)
  revalidatePath('/servicos')
  return { sucesso: true }
}

/** Move o Servico entre estados intermediarios (EM_ABERTO, EM_EXECUCAO, AGUARDANDO). */
export async function mudarStatusServico(id: number, status: string): Promise<void> {
  try {
    await clienteApi(`/servicos/${id}/status`, { method: 'POST', body: { status } })
  } catch (err) {
    if (err instanceof ErroApi && err.status !== 404) throw err
  }
  revalidatePath(`/servicos/${id}`)
  revalidatePath('/servicos')
}

export async function finalizarServico(id: number): Promise<void> {
  try {
    await clienteApi(`/servicos/${id}/finalizar`, { method: 'POST' })
  } catch (err) {
    if (err instanceof ErroApi && err.status !== 404) throw err
  }
  revalidatePath(`/servicos/${id}`)
  revalidatePath('/servicos')
}

export async function cancelarServico(id: number): Promise<void> {
  try {
    await clienteApi(`/servicos/${id}/cancelar`, { method: 'POST' })
  } catch (err) {
    if (err instanceof ErroApi && err.status !== 404) throw err
  }
  revalidatePath(`/servicos/${id}`)
  revalidatePath('/servicos')
}

/** Admin: exclui permanentemente o Servico (cascateia OS, anexos, lancamentos). */
export async function excluirServico(id: number): Promise<{ erro?: string }> {
  try {
    await clienteApi(`/servicos/${id}`, { method: 'DELETE' })
  } catch (err) {
    if (err instanceof ErroApi) return { erro: err.body.mensagem }
    if (err instanceof ErroConexao) return { erro: 'Falha de conexao com a API.' }
    return { erro: 'Erro ao excluir o servico.' }
  }
  revalidatePath('/servicos')
  redirect('/servicos')
}
