'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { clienteApi, ErroApi, ErroConexao } from '@/app/lib/cliente-api'
import { veiculoSchema } from '@/app/lib/esquemas/veiculo'
import type { VeiculoResposta } from '@/app/lib/definicoes'

export type EstadoVeiculo = {
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

export async function criarVeiculo(
  _estado: EstadoVeiculo,
  formData: FormData,
): Promise<EstadoVeiculo> {
  const parse = veiculoSchema.safeParse(Object.fromEntries(formData))
  if (!parse.success) return aplicarErros(parse.error)

  let criado: VeiculoResposta
  try {
    criado = await clienteApi<VeiculoResposta>('/veiculos', {
      method: 'POST',
      body: parse.data,
    })
  } catch (err) {
    if (err instanceof ErroApi) {
      if (err.status === 409) return { erro: 'Ja existe veiculo com esta placa.' }
      return { erro: err.body.mensagem }
    }
    if (err instanceof ErroConexao) return { erro: 'Falha de conexao com a API.' }
    return { erro: 'Erro ao criar veiculo.' }
  }

  revalidatePath('/veiculos')
  redirect(`/veiculos/${criado.id}`)
}

export async function atualizarVeiculo(
  id: number,
  _estado: EstadoVeiculo,
  formData: FormData,
): Promise<EstadoVeiculo> {
  const parse = veiculoSchema.safeParse(Object.fromEntries(formData))
  if (!parse.success) return aplicarErros(parse.error)

  try {
    await clienteApi(`/veiculos/${id}`, { method: 'PUT', body: parse.data })
  } catch (err) {
    if (err instanceof ErroApi) return { erro: err.body.mensagem }
    if (err instanceof ErroConexao) return { erro: 'Falha de conexao com a API.' }
    return { erro: 'Erro ao atualizar veiculo.' }
  }

  revalidatePath(`/veiculos/${id}`)
  revalidatePath('/veiculos')
  return { sucesso: true }
}

export async function inativarVeiculo(id: number): Promise<void> {
  try {
    await clienteApi(`/veiculos/${id}`, { method: 'DELETE' })
  } catch (err) {
    if (err instanceof ErroApi && err.status !== 404) throw err
  }
  revalidatePath('/veiculos')
  revalidatePath(`/veiculos/${id}`)
}

export async function reativarVeiculo(id: number): Promise<void> {
  try {
    await clienteApi(`/veiculos/${id}/reativar`, { method: 'POST' })
  } catch (err) {
    if (err instanceof ErroApi && err.status !== 404) throw err
  }
  revalidatePath('/veiculos')
  revalidatePath(`/veiculos/${id}`)
}
