'use server'

import { revalidatePath } from 'next/cache'
import { clienteApi, ErroApi, ErroConexao } from '@/app/lib/cliente-api'
import {
  atualizacaoTecnicoSchema,
  criacaoTecnicoSchema,
  redefinicaoSenhaSchema,
} from '@/app/lib/esquemas/tecnico'
import type { TecnicoResposta } from '@/app/lib/definicoes'

export type EstadoTecnico = {
  erro?: string
  errosCampos?: Record<string, string>
  sucesso?: boolean
  criado?: TecnicoResposta
}

function aplicarErros(parseError: { issues: ReadonlyArray<{ path: ReadonlyArray<PropertyKey>; message: string }> }) {
  const errosCampos: Record<string, string> = {}
  for (const issue of parseError.issues) {
    const campo = String(issue.path[0])
    if (campo && !errosCampos[campo]) errosCampos[campo] = issue.message
  }
  return { errosCampos }
}

export async function criarTecnico(
  _estado: EstadoTecnico,
  formData: FormData,
): Promise<EstadoTecnico> {
  const parse = criacaoTecnicoSchema.safeParse(Object.fromEntries(formData))
  if (!parse.success) return aplicarErros(parse.error)

  // Renomeia campo: valorHoraReais (form) -> valorHoraCentavos (API)
  const { valorHoraReais, ...resto } = parse.data
  const body = { ...resto, valorHoraCentavos: valorHoraReais }

  let criado: TecnicoResposta
  try {
    criado = await clienteApi<TecnicoResposta>('/tecnicos', { method: 'POST', body })
  } catch (err) {
    if (err instanceof ErroApi) {
      if (err.status === 409) return { erro: 'Ja existe usuario com este e-mail.' }
      return { erro: err.body.mensagem }
    }
    if (err instanceof ErroConexao) return { erro: 'Falha de conexao com a API.' }
    return { erro: 'Erro ao criar tecnico.' }
  }

  revalidatePath('/tecnicos')
  return { criado }
}

export async function atualizarTecnico(
  id: number,
  _estado: EstadoTecnico,
  formData: FormData,
): Promise<EstadoTecnico> {
  const parse = atualizacaoTecnicoSchema.safeParse(Object.fromEntries(formData))
  if (!parse.success) return aplicarErros(parse.error)

  const { valorHoraReais, ...resto } = parse.data
  const body = { ...resto, valorHoraCentavos: valorHoraReais }

  try {
    await clienteApi(`/tecnicos/${id}`, { method: 'PUT', body })
  } catch (err) {
    if (err instanceof ErroApi) return { erro: err.body.mensagem }
    if (err instanceof ErroConexao) return { erro: 'Falha de conexao com a API.' }
    return { erro: 'Erro ao atualizar tecnico.' }
  }

  revalidatePath(`/tecnicos/${id}`)
  revalidatePath('/tecnicos')
  return { sucesso: true }
}

export async function redefinirSenhaTecnico(
  id: number,
  _estado: EstadoTecnico,
  formData: FormData,
): Promise<EstadoTecnico> {
  const parse = redefinicaoSenhaSchema.safeParse(Object.fromEntries(formData))
  if (!parse.success) return aplicarErros(parse.error)

  try {
    await clienteApi(`/tecnicos/${id}/senha`, { method: 'PUT', body: parse.data })
  } catch (err) {
    if (err instanceof ErroApi) return { erro: err.body.mensagem }
    if (err instanceof ErroConexao) return { erro: 'Falha de conexao com a API.' }
    return { erro: 'Erro ao redefinir senha.' }
  }

  return { sucesso: true }
}

export async function inativarTecnico(id: number): Promise<void> {
  try {
    await clienteApi(`/tecnicos/${id}`, { method: 'DELETE' })
  } catch (err) {
    if (err instanceof ErroApi && err.status !== 404) throw err
  }
  revalidatePath('/tecnicos')
  revalidatePath(`/tecnicos/${id}`)
}

export async function reativarTecnico(id: number): Promise<void> {
  try {
    await clienteApi(`/tecnicos/${id}/reativar`, { method: 'POST' })
  } catch (err) {
    if (err instanceof ErroApi && err.status !== 404) throw err
  }
  revalidatePath('/tecnicos')
  revalidatePath(`/tecnicos/${id}`)
}
