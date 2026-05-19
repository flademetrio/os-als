/**
 * Route handler proxy: /api-proxy/clientes/{clienteId}/unidades
 *
 * Permite que Client Components consultem o back sem expor o cookie JWT
 * httpOnly direto ao bundle do navegador. O Next chama o back server-side
 * usando o cookie atual.
 */

import { NextResponse } from 'next/server'
import { clienteApi, ErroApi } from '@/app/lib/cliente-api'
import type { UnidadeResposta } from '@/app/lib/definicoes'

type Params = { params: Promise<{ clienteId: string }> }

export async function GET(req: Request, { params }: Params) {
  const { clienteId } = await params
  const { searchParams } = new URL(req.url)
  const apenasAtivas = searchParams.get('apenasAtivas') !== 'false'

  try {
    const dados = await clienteApi<UnidadeResposta[]>(
      `/clientes/${clienteId}/unidades?apenasAtivas=${apenasAtivas}`,
    )
    return NextResponse.json(dados)
  } catch (err) {
    if (err instanceof ErroApi) {
      return NextResponse.json({ erro: err.body.mensagem }, { status: err.status })
    }
    return NextResponse.json({ erro: 'Falha ao buscar unidades.' }, { status: 500 })
  }
}
