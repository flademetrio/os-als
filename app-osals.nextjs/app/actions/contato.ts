'use server'

import { revalidatePath } from 'next/cache'
import { clienteApi, ErroApi, ErroConexao } from '@/app/lib/cliente-api'
import { contatoSchema } from '@/app/lib/esquemas/cliente'

export type EstadoContato = {
  erro?: string
  errosCampos?: Record<string, string>
  sucesso?: boolean
}

export async function criarContato(
  clienteId: number,
  _estado: EstadoContato,
  formData: FormData,
): Promise<EstadoContato> {
  const dados = Object.fromEntries(formData)
  const parse = contatoSchema.safeParse(dados)
  if (!parse.success) {
    const errosCampos: Record<string, string> = {}
    for (const issue of parse.error.issues) {
      const campo = String(issue.path[0])
      if (campo && !errosCampos[campo]) errosCampos[campo] = issue.message
    }
    return { errosCampos }
  }

  try {
    await clienteApi(`/clientes/${clienteId}/contatos`, {
      method: 'POST',
      body: parse.data,
    })
  } catch (err) {
    if (err instanceof ErroApi) return { erro: err.body.mensagem }
    if (err instanceof ErroConexao) return { erro: 'Falha de conexao com a API.' }
    return { erro: 'Erro ao criar contato.' }
  }

  revalidatePath(`/clientes/${clienteId}`)
  return { sucesso: true }
}

export async function atualizarContato(
  clienteId: number,
  contatoId: number,
  _estado: EstadoContato,
  formData: FormData,
): Promise<EstadoContato> {
  const dados = Object.fromEntries(formData)
  const parse = contatoSchema.safeParse(dados)
  if (!parse.success) {
    const errosCampos: Record<string, string> = {}
    for (const issue of parse.error.issues) {
      const campo = String(issue.path[0])
      if (campo && !errosCampos[campo]) errosCampos[campo] = issue.message
    }
    return { errosCampos }
  }

  try {
    await clienteApi(`/contatos/${contatoId}`, { method: 'PUT', body: parse.data })
  } catch (err) {
    if (err instanceof ErroApi) return { erro: err.body.mensagem }
    if (err instanceof ErroConexao) return { erro: 'Falha de conexao com a API.' }
    return { erro: 'Erro ao atualizar contato.' }
  }

  revalidatePath(`/clientes/${clienteId}`)
  return { sucesso: true }
}

export async function removerContato(clienteId: number, contatoId: number): Promise<void> {
  try {
    await clienteApi(`/contatos/${contatoId}`, { method: 'DELETE' })
  } catch (err) {
    if (err instanceof ErroApi && err.status !== 404) throw err
  }
  revalidatePath(`/clientes/${clienteId}`)
}
