'use server'

import { revalidatePath } from 'next/cache'
import {
  clienteApi,
  clienteApiUpload,
  ErroApi,
  ErroConexao,
} from '@/app/lib/cliente-api'

export type EstadoAnexo = {
  erro?: string
  sucesso?: boolean
}

async function lerErro(resposta: Response): Promise<string> {
  const corpo = await resposta.json().catch(() => null)
  return corpo?.mensagem ?? `Falha no upload (HTTP ${resposta.status}).`
}

/** Anexa um PDF ao Servico (multiplos por servico). */
export async function anexarAoServico(
  servicoId: number,
  _estado: EstadoAnexo,
  formData: FormData,
): Promise<EstadoAnexo> {
  const arquivo = formData.get('arquivo')
  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return { erro: 'Selecione um arquivo PDF.' }
  }

  const corpo = new FormData()
  corpo.append('arquivo', arquivo)
  const descricao = String(formData.get('descricao') ?? '').trim()
  if (descricao) corpo.append('descricao', descricao)

  try {
    const resposta = await clienteApiUpload(`/servicos/${servicoId}/anexos`, corpo)
    if (!resposta.ok) return { erro: await lerErro(resposta) }
  } catch (err) {
    if (err instanceof ErroConexao) return { erro: 'Falha de conexao com a API.' }
    return { erro: 'Erro ao enviar o anexo.' }
  }

  revalidatePath(`/servicos/${servicoId}`)
  return { sucesso: true }
}

export async function removerAnexoServico(servicoId: number, anexoId: number): Promise<void> {
  try {
    await clienteApi(`/servicos/${servicoId}/anexos/${anexoId}`, { method: 'DELETE' })
  } catch (err) {
    if (err instanceof ErroApi && err.status !== 404) throw err
  }
  revalidatePath(`/servicos/${servicoId}`)
}

/** Anexa (ou substitui) o PDF unico de uma OS — o scan do papel preenchido. */
export async function anexarNaOs(
  osId: number,
  _estado: EstadoAnexo,
  formData: FormData,
): Promise<EstadoAnexo> {
  const arquivo = formData.get('arquivo')
  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return { erro: 'Selecione um arquivo PDF.' }
  }

  const corpo = new FormData()
  corpo.append('arquivo', arquivo)

  try {
    const resposta = await clienteApiUpload(`/ordens-servico/${osId}/anexo`, corpo)
    if (!resposta.ok) return { erro: await lerErro(resposta) }
  } catch (err) {
    if (err instanceof ErroConexao) return { erro: 'Falha de conexao com a API.' }
    return { erro: 'Erro ao enviar o anexo.' }
  }

  revalidatePath(`/ordens-servico/${osId}`)
  return { sucesso: true }
}

export async function removerAnexoOs(osId: number): Promise<void> {
  try {
    await clienteApi(`/ordens-servico/${osId}/anexo`, { method: 'DELETE' })
  } catch (err) {
    if (err instanceof ErroApi && err.status !== 404) throw err
  }
  revalidatePath(`/ordens-servico/${osId}`)
}
