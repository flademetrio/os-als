'use server'

import { revalidatePath } from 'next/cache'
import { clienteApi, ErroApi, ErroConexao } from '@/app/lib/cliente-api'
import type { Papel, Permissao, UsuarioAdminResposta } from '@/app/lib/definicoes'

export type ResultadoUsuario = { erro?: string; sucesso?: boolean }

function tratar(err: unknown, padrao: string): ResultadoUsuario {
  if (err instanceof ErroApi) return { erro: err.body.mensagem }
  if (err instanceof ErroConexao) return { erro: 'Falha de conexao com a API.' }
  return { erro: padrao }
}

export async function criarUsuario(input: {
  nome: string
  email: string
  senha: string
  papel: Papel
}): Promise<ResultadoUsuario> {
  try {
    await clienteApi('/usuarios', { method: 'POST', body: input })
  } catch (err) {
    return tratar(err, 'Erro ao criar usuario.')
  }
  revalidatePath('/usuarios')
  return { sucesso: true }
}

export async function atualizarUsuario(
  id: number,
  input: { nome: string; papel: Papel },
): Promise<ResultadoUsuario> {
  try {
    await clienteApi(`/usuarios/${id}`, { method: 'PUT', body: input })
  } catch (err) {
    return tratar(err, 'Erro ao atualizar usuario.')
  }
  revalidatePath('/usuarios')
  return { sucesso: true }
}

export async function definirPermissoes(
  id: number,
  permissoes: Permissao[],
): Promise<ResultadoUsuario> {
  try {
    await clienteApi(`/usuarios/${id}/permissoes`, { method: 'PUT', body: { permissoes } })
  } catch (err) {
    return tratar(err, 'Erro ao salvar permissoes.')
  }
  revalidatePath('/usuarios')
  return { sucesso: true }
}

export async function gerarLinkRedefinicaoSenha(
  id: number,
): Promise<{ token?: string; expiraEm?: string; erro?: string }> {
  try {
    const r = await clienteApi<{ token: string; expiraEm: string }>(
      `/usuarios/${id}/link-redefinicao-senha`,
      { method: 'POST' },
    )
    return { token: r.token, expiraEm: r.expiraEm }
  } catch (err) {
    return tratar(err, 'Erro ao gerar o link de redefinicao.')
  }
}

export async function ativarUsuario(id: number): Promise<ResultadoUsuario> {
  try {
    await clienteApi(`/usuarios/${id}/ativar`, { method: 'POST' })
  } catch (err) {
    return tratar(err, 'Erro ao ativar usuario.')
  }
  revalidatePath('/usuarios')
  return { sucesso: true }
}

export async function inativarUsuario(id: number): Promise<ResultadoUsuario> {
  try {
    await clienteApi(`/usuarios/${id}`, { method: 'DELETE' })
  } catch (err) {
    return tratar(err, 'Erro ao inativar usuario.')
  }
  revalidatePath('/usuarios')
  return { sucesso: true }
}

/** Busca o detalhe (com permissoes concedidas) para abrir o editor de permissoes. */
export async function buscarUsuario(
  id: number,
): Promise<{ usuario?: UsuarioAdminResposta; erro?: string }> {
  try {
    const usuario = await clienteApi<UsuarioAdminResposta>(`/usuarios/${id}`)
    return { usuario }
  } catch (err) {
    return tratar(err, 'Erro ao carregar usuario.')
  }
}
