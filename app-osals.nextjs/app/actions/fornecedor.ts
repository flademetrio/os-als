'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { clienteApi, ErroApi, ErroConexao } from '@/app/lib/cliente-api'
import { fornecedorSchema } from '@/app/lib/esquemas/fornecedor'
import type { FornecedorResposta } from '@/app/lib/definicoes'

export type EstadoFornecedor = {
  erro?: string
  errosCampos?: Record<string, string>
  sucesso?: boolean
}

function aplicarErros(parseError: { issues: { path: (string | number)[]; message: string }[] }) {
  const errosCampos: Record<string, string> = {}
  for (const issue of parseError.issues) {
    const campo = String(issue.path[0])
    if (campo && !errosCampos[campo]) errosCampos[campo] = issue.message
  }
  return { errosCampos }
}

export async function criarFornecedor(
  _estado: EstadoFornecedor,
  formData: FormData,
): Promise<EstadoFornecedor> {
  const parse = fornecedorSchema.safeParse(Object.fromEntries(formData))
  if (!parse.success) return aplicarErros(parse.error)

  let criado: FornecedorResposta
  try {
    criado = await clienteApi<FornecedorResposta>('/fornecedores', {
      method: 'POST',
      body: parse.data,
    })
  } catch (err) {
    if (err instanceof ErroApi) return { erro: err.body.mensagem }
    if (err instanceof ErroConexao) return { erro: 'Falha de conexao com a API.' }
    return { erro: 'Erro ao criar fornecedor.' }
  }

  revalidatePath('/fornecedores')
  redirect(`/fornecedores/${criado.id}`)
}

export async function atualizarFornecedor(
  id: number,
  _estado: EstadoFornecedor,
  formData: FormData,
): Promise<EstadoFornecedor> {
  const parse = fornecedorSchema.safeParse(Object.fromEntries(formData))
  if (!parse.success) return aplicarErros(parse.error)

  try {
    await clienteApi(`/fornecedores/${id}`, { method: 'PUT', body: parse.data })
  } catch (err) {
    if (err instanceof ErroApi) return { erro: err.body.mensagem }
    if (err instanceof ErroConexao) return { erro: 'Falha de conexao com a API.' }
    return { erro: 'Erro ao atualizar fornecedor.' }
  }

  revalidatePath(`/fornecedores/${id}`)
  revalidatePath('/fornecedores')
  return { sucesso: true }
}

export async function inativarFornecedor(id: number): Promise<void> {
  try {
    await clienteApi(`/fornecedores/${id}`, { method: 'DELETE' })
  } catch (err) {
    if (err instanceof ErroApi && err.status !== 404) throw err
  }
  revalidatePath('/fornecedores')
  revalidatePath(`/fornecedores/${id}`)
}

export async function reativarFornecedor(id: number): Promise<void> {
  try {
    await clienteApi(`/fornecedores/${id}/reativar`, { method: 'POST' })
  } catch (err) {
    if (err instanceof ErroApi && err.status !== 404) throw err
  }
  revalidatePath('/fornecedores')
  revalidatePath(`/fornecedores/${id}`)
}
