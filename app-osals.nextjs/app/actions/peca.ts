'use server'

import { revalidatePath } from 'next/cache'
import { clienteApi, ErroApi, ErroConexao } from '@/app/lib/cliente-api'
import { pecaSchema } from '@/app/lib/esquemas/peca'
import type { PecaResposta } from '@/app/lib/definicoes'

export type EstadoPeca = {
  erro?: string
  errosCampos?: Record<string, string>
  sucesso?: boolean
  criado?: PecaResposta
}

function aplicarErros(parseError: { issues: ReadonlyArray<{ path: ReadonlyArray<PropertyKey>; message: string }> }) {
  const errosCampos: Record<string, string> = {}
  for (const issue of parseError.issues) {
    const campo = String(issue.path[0])
    if (campo && !errosCampos[campo]) errosCampos[campo] = issue.message
  }
  return { errosCampos }
}

export async function criarPeca(
  _estado: EstadoPeca,
  formData: FormData,
): Promise<EstadoPeca> {
  const parse = pecaSchema.safeParse(Object.fromEntries(formData))
  if (!parse.success) return aplicarErros(parse.error)

  let criada: PecaResposta
  try {
    criada = await clienteApi<PecaResposta>('/pecas', { method: 'POST', body: parse.data })
  } catch (err) {
    if (err instanceof ErroApi) return { erro: err.body.mensagem }
    if (err instanceof ErroConexao) return { erro: 'Falha de conexao com a API.' }
    return { erro: 'Erro ao criar peca.' }
  }

  revalidatePath('/pecas')
  return { criado: criada }
}

export async function atualizarPeca(
  id: number,
  _estado: EstadoPeca,
  formData: FormData,
): Promise<EstadoPeca> {
  const parse = pecaSchema.safeParse(Object.fromEntries(formData))
  if (!parse.success) return aplicarErros(parse.error)

  try {
    await clienteApi(`/pecas/${id}`, { method: 'PUT', body: parse.data })
  } catch (err) {
    if (err instanceof ErroApi) return { erro: err.body.mensagem }
    if (err instanceof ErroConexao) return { erro: 'Falha de conexao com a API.' }
    return { erro: 'Erro ao atualizar peca.' }
  }

  revalidatePath(`/pecas/${id}`)
  revalidatePath('/pecas')
  return { sucesso: true }
}

export async function inativarPeca(id: number): Promise<void> {
  try {
    await clienteApi(`/pecas/${id}`, { method: 'DELETE' })
  } catch (err) {
    if (err instanceof ErroApi && err.status !== 404) throw err
  }
  revalidatePath('/pecas')
  revalidatePath(`/pecas/${id}`)
}

export async function reativarPeca(id: number): Promise<void> {
  try {
    await clienteApi(`/pecas/${id}/reativar`, { method: 'POST' })
  } catch (err) {
    if (err instanceof ErroApi && err.status !== 404) throw err
  }
  revalidatePath('/pecas')
  revalidatePath(`/pecas/${id}`)
}
