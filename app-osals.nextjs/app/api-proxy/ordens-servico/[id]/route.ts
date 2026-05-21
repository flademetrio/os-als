/**
 * Route handler proxy: GET /api-proxy/ordens-servico/{id}
 *
 * Devolve o detalhe completo da OS + os metadados do anexo, para o modal
 * de detalhe da OS exibido a partir da tela do Servico. Existe como proxy
 * para nao expor o cookie JWT httpOnly ao Client Component.
 */

import { NextResponse } from 'next/server'
import { clienteApi, ErroApi, ErroConexao } from '@/app/lib/cliente-api'
import type { AnexoOsResposta, OrdemServicoResposta } from '@/app/lib/definicoes'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params

  try {
    const os = await clienteApi<OrdemServicoResposta>(`/ordens-servico/${id}`)

    let anexo: AnexoOsResposta | null = null
    try {
      anexo = await clienteApi<AnexoOsResposta>(`/ordens-servico/${id}/anexo`)
    } catch (err) {
      if (!(err instanceof ErroApi && err.status === 404)) throw err
    }

    return NextResponse.json({ os, anexo })
  } catch (err) {
    if (err instanceof ErroApi) {
      return NextResponse.json({ erro: err.body.mensagem }, { status: err.status })
    }
    if (err instanceof ErroConexao) {
      return NextResponse.json({ erro: 'Falha de conexao com a API.' }, { status: 502 })
    }
    return NextResponse.json({ erro: 'Falha ao carregar a OS.' }, { status: 500 })
  }
}
