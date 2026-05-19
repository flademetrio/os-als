'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { clienteApi, ErroApi, ErroConexao } from '@/app/lib/cliente-api'
import {
  criacaoClienteSchema,
  atualizacaoClienteSchema,
} from '@/app/lib/esquemas/cliente'
import type { ClienteResposta } from '@/app/lib/definicoes'

export type EstadoCriacaoCliente = {
  erro?: string
  errosCampos?: Record<string, string>
}

export async function criarCliente(
  _estado: EstadoCriacaoCliente,
  formData: FormData,
): Promise<EstadoCriacaoCliente> {
  const dados = Object.fromEntries(formData)
  const parse = criacaoClienteSchema.safeParse(dados)
  if (!parse.success) {
    const errosCampos: Record<string, string> = {}
    for (const issue of parse.error.issues) {
      const campo = String(issue.path[0])
      if (campo && !errosCampos[campo]) errosCampos[campo] = issue.message
    }
    return { errosCampos }
  }

  let criado: ClienteResposta
  try {
    criado = await clienteApi<ClienteResposta>('/clientes', {
      method: 'POST',
      body: parse.data,
    })
  } catch (err) {
    if (err instanceof ErroApi) {
      if (err.status === 409) return { erro: 'Ja existe cliente com este documento.' }
      if (err.status === 422) return { erro: err.body.mensagem }
      if (err.status === 400) return { erro: err.body.mensagem }
    }
    if (err instanceof ErroConexao) return { erro: 'Falha de conexao com a API.' }
    return { erro: 'Erro ao criar cliente.' }
  }

  revalidatePath('/clientes')
  redirect(`/clientes/${criado.id}`)
}

export type EstadoAtualizacaoCliente = {
  erro?: string
  errosCampos?: Record<string, string>
  sucesso?: boolean
}

export async function atualizarCliente(
  id: number,
  _estado: EstadoAtualizacaoCliente,
  formData: FormData,
): Promise<EstadoAtualizacaoCliente> {
  const dados = Object.fromEntries(formData)
  const parse = atualizacaoClienteSchema.safeParse(dados)
  if (!parse.success) {
    const errosCampos: Record<string, string> = {}
    for (const issue of parse.error.issues) {
      const campo = String(issue.path[0])
      if (campo && !errosCampos[campo]) errosCampos[campo] = issue.message
    }
    return { errosCampos }
  }

  try {
    await clienteApi(`/clientes/${id}`, { method: 'PUT', body: parse.data })
  } catch (err) {
    if (err instanceof ErroApi) return { erro: err.body.mensagem }
    if (err instanceof ErroConexao) return { erro: 'Falha de conexao com a API.' }
    return { erro: 'Erro ao atualizar cliente.' }
  }

  revalidatePath(`/clientes/${id}`)
  revalidatePath('/clientes')
  return { sucesso: true }
}

export async function inativarCliente(id: number): Promise<void> {
  try {
    await clienteApi(`/clientes/${id}`, { method: 'DELETE' })
  } catch (err) {
    // Erros silenciosos aqui — UI exibe via reload
    if (err instanceof ErroApi && err.status !== 404) throw err
  }
  revalidatePath('/clientes')
  revalidatePath(`/clientes/${id}`)
}

export async function reativarCliente(id: number): Promise<void> {
  try {
    await clienteApi(`/clientes/${id}/reativar`, { method: 'POST' })
  } catch (err) {
    if (err instanceof ErroApi && err.status !== 404) throw err
  }
  revalidatePath('/clientes')
  revalidatePath(`/clientes/${id}`)
}
