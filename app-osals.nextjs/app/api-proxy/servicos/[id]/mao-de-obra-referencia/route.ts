/**
 * Route handler proxy: GET /api-proxy/servicos/{id}/mao-de-obra-referencia?data=YYYY-MM-DD
 *
 * Referencia para lancar mao de obra (tecnicos das OS do dia + suas OS no dia).
 * Proxy para nao expor o cookie JWT httpOnly ao Client Component.
 */

import { NextResponse } from 'next/server'
import { clienteApi, ErroApi, ErroConexao } from '@/app/lib/cliente-api'
import type { MaoDeObraReferencia } from '@/app/lib/definicoes'

type Params = { params: Promise<{ id: string }> }

export async function GET(req: Request, { params }: Params) {
  const { id } = await params
  const data = new URL(req.url).searchParams.get('data') ?? ''

  try {
    const ref = await clienteApi<MaoDeObraReferencia>(
      `/servicos/${id}/mao-de-obra/referencia?data=${encodeURIComponent(data)}`,
    )
    return NextResponse.json(ref)
  } catch (err) {
    if (err instanceof ErroApi) {
      return NextResponse.json({ erro: err.body.mensagem }, { status: err.status })
    }
    if (err instanceof ErroConexao) {
      return NextResponse.json({ erro: 'Falha de conexao com a API.' }, { status: 502 })
    }
    return NextResponse.json({ erro: 'Falha ao carregar a referencia.' }, { status: 500 })
  }
}
