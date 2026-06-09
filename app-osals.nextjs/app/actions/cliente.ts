'use server'

import { revalidatePath } from 'next/cache'
import { clienteApi, ErroApi, ErroConexao } from '@/app/lib/cliente-api'
import {
  criacaoClienteSchema,
  atualizacaoClienteSchema,
  unidadeSchema,
} from '@/app/lib/esquemas/cliente'
import type { ClienteResposta } from '@/app/lib/definicoes'

export type EstadoNovoClienteModal = {
  erro?: string
  errosCampos?: Record<string, string>
  cliente?: ClienteResposta
}

/**
 * Cria um cliente e devolve o registro criado, sem redirecionar — usado
 * pelos formularios de cadastro de cliente (em drawer ou em pagina propria).
 */
export async function criarClienteRetornando(
  _estado: EstadoNovoClienteModal,
  formData: FormData,
): Promise<EstadoNovoClienteModal> {
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

  // Endereco opcional: se algum campo veio preenchido, validamos ANTES de criar
  // o cliente e, no sucesso, criamos a unidade "Matriz" junto.
  const CAMPOS_ENDERECO = ['cep', 'logradouro', 'numero', 'complemento', 'bairro', 'cidade', 'estado'] as const
  const temEndereco = CAMPOS_ENDERECO.some((c) => String(dados[c] ?? '').trim() !== '')

  let unidadeBody: ReturnType<typeof unidadeSchema.parse> | null = null
  if (temEndereco) {
    const parseUnidade = unidadeSchema.safeParse({
      identificacaoInterna: 'Matriz',
      cep: dados.cep,
      logradouro: dados.logradouro,
      numero: dados.numero,
      complemento: dados.complemento,
      bairro: dados.bairro,
      cidade: dados.cidade,
      estado: dados.estado,
    })
    if (!parseUnidade.success) {
      const errosCampos: Record<string, string> = {}
      for (const issue of parseUnidade.error.issues) {
        const campo = String(issue.path[0])
        if (campo && !errosCampos[campo]) errosCampos[campo] = issue.message
      }
      return { errosCampos }
    }
    unidadeBody = parseUnidade.data
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
      if (err.status === 422 || err.status === 400) return { erro: err.body.mensagem }
    }
    if (err instanceof ErroConexao) return { erro: 'Falha de conexao com a API.' }
    return { erro: 'Erro ao criar cliente.' }
  }

  // Cliente criado. Se houver endereco, cria a unidade "Matriz".
  if (unidadeBody) {
    try {
      await clienteApi(`/clientes/${criado.id}/unidades`, {
        method: 'POST',
        body: unidadeBody,
      })
    } catch {
      revalidatePath('/clientes')
      return {
        cliente: criado,
        erro: 'Cliente criado, mas o endereco nao foi salvo. Adicione-o na aba Unidades do cliente.',
      }
    }
  }

  revalidatePath('/clientes')
  return { cliente: criado }
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
