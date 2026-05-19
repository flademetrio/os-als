'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { clienteApi, ErroApi, ErroConexao } from '@/app/lib/cliente-api'
import { equipamentoSchema, novoEquipamentoSchema } from '@/app/lib/esquemas/equipamento'
import type { EquipamentoResposta } from '@/app/lib/definicoes'

export type EstadoEquipamento = {
  erro?: string
  errosCampos?: Record<string, string>
  sucesso?: boolean
}

function aplicarErros(parseError: { issues: ReadonlyArray<{ path: ReadonlyArray<PropertyKey>; message: string }> }) {
  const errosCampos: Record<string, string> = {}
  for (const issue of parseError.issues) {
    const campo = String(issue.path[0])
    if (campo && !errosCampos[campo]) errosCampos[campo] = issue.message
  }
  return { errosCampos }
}

export async function criarEquipamento(
  _estado: EstadoEquipamento,
  formData: FormData,
): Promise<EstadoEquipamento> {
  const parse = novoEquipamentoSchema.safeParse(Object.fromEntries(formData))
  if (!parse.success) return aplicarErros(parse.error)

  const { clienteId: _cli, unidadeId, ...resto } = parse.data

  let criado: EquipamentoResposta
  try {
    criado = await clienteApi<EquipamentoResposta>(
      `/unidades/${unidadeId}/equipamentos`,
      { method: 'POST', body: resto },
    )
  } catch (err) {
    if (err instanceof ErroApi) return { erro: err.body.mensagem }
    if (err instanceof ErroConexao) return { erro: 'Falha de conexao com a API.' }
    return { erro: 'Erro ao criar equipamento.' }
  }

  revalidatePath('/equipamentos')
  redirect(`/equipamentos/${criado.id}`)
}

export async function atualizarEquipamento(
  id: number,
  _estado: EstadoEquipamento,
  formData: FormData,
): Promise<EstadoEquipamento> {
  const parse = equipamentoSchema.safeParse(Object.fromEntries(formData))
  if (!parse.success) return aplicarErros(parse.error)

  try {
    await clienteApi(`/equipamentos/${id}`, { method: 'PUT', body: parse.data })
  } catch (err) {
    if (err instanceof ErroApi) return { erro: err.body.mensagem }
    if (err instanceof ErroConexao) return { erro: 'Falha de conexao com a API.' }
    return { erro: 'Erro ao atualizar equipamento.' }
  }

  revalidatePath(`/equipamentos/${id}`)
  revalidatePath('/equipamentos')
  return { sucesso: true }
}

export async function inativarEquipamento(id: number): Promise<void> {
  try {
    await clienteApi(`/equipamentos/${id}`, { method: 'DELETE' })
  } catch (err) {
    if (err instanceof ErroApi && err.status !== 404) throw err
  }
  revalidatePath('/equipamentos')
  revalidatePath(`/equipamentos/${id}`)
}

export async function reativarEquipamento(id: number): Promise<void> {
  try {
    await clienteApi(`/equipamentos/${id}/reativar`, { method: 'POST' })
  } catch (err) {
    if (err instanceof ErroApi && err.status !== 404) throw err
  }
  revalidatePath('/equipamentos')
  revalidatePath(`/equipamentos/${id}`)
}
