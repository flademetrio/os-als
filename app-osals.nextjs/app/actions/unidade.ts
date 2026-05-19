'use server'

import { revalidatePath } from 'next/cache'
import { clienteApi, ErroApi, ErroConexao } from '@/app/lib/cliente-api'
import { unidadeSchema } from '@/app/lib/esquemas/cliente'

export type EstadoUnidade = {
  erro?: string
  errosCampos?: Record<string, string>
  sucesso?: boolean
}

export async function criarUnidade(
  clienteId: number,
  _estado: EstadoUnidade,
  formData: FormData,
): Promise<EstadoUnidade> {
  const dados = Object.fromEntries(formData)
  const parse = unidadeSchema.safeParse(dados)
  if (!parse.success) {
    const errosCampos: Record<string, string> = {}
    for (const issue of parse.error.issues) {
      const campo = String(issue.path[0])
      if (campo && !errosCampos[campo]) errosCampos[campo] = issue.message
    }
    return { errosCampos }
  }

  try {
    await clienteApi(`/clientes/${clienteId}/unidades`, {
      method: 'POST',
      body: parse.data,
    })
  } catch (err) {
    if (err instanceof ErroApi) return { erro: err.body.mensagem }
    if (err instanceof ErroConexao) return { erro: 'Falha de conexao com a API.' }
    return { erro: 'Erro ao criar unidade.' }
  }

  revalidatePath(`/clientes/${clienteId}`)
  return { sucesso: true }
}

export async function atualizarUnidade(
  clienteId: number,
  unidadeId: number,
  _estado: EstadoUnidade,
  formData: FormData,
): Promise<EstadoUnidade> {
  const dados = Object.fromEntries(formData)
  const parse = unidadeSchema.safeParse(dados)
  if (!parse.success) {
    const errosCampos: Record<string, string> = {}
    for (const issue of parse.error.issues) {
      const campo = String(issue.path[0])
      if (campo && !errosCampos[campo]) errosCampos[campo] = issue.message
    }
    return { errosCampos }
  }

  try {
    await clienteApi(`/unidades/${unidadeId}`, { method: 'PUT', body: parse.data })
  } catch (err) {
    if (err instanceof ErroApi) return { erro: err.body.mensagem }
    if (err instanceof ErroConexao) return { erro: 'Falha de conexao com a API.' }
    return { erro: 'Erro ao atualizar unidade.' }
  }

  revalidatePath(`/clientes/${clienteId}`)
  return { sucesso: true }
}

export async function inativarUnidade(clienteId: number, unidadeId: number): Promise<void> {
  try {
    await clienteApi(`/unidades/${unidadeId}`, { method: 'DELETE' })
  } catch (err) {
    if (err instanceof ErroApi && err.status !== 404) throw err
  }
  revalidatePath(`/clientes/${clienteId}`)
}
