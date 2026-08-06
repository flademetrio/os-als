/**
 * Route handler proxy: GET /api-proxy/relatorios/servico/{id}/pdf
 *
 * Gera/serve o PDF do dossie do servico (inline, para abrir em outra guia).
 * Proxy para nao expor o cookie JWT httpOnly ao navegador.
 */

import { NextResponse } from 'next/server'
import { clienteApiBruto, ErroConexao } from '@/app/lib/cliente-api'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params

  try {
    const resposta = await clienteApiBruto(`/relatorios/servico/${id}/pdf`)
    if (!resposta.ok) {
      const erro = await resposta.json().catch(() => ({ mensagem: 'Falha ao gerar o PDF.' }))
      return NextResponse.json(erro, { status: resposta.status })
    }
    return new NextResponse(await resposta.arrayBuffer(), {
      status: 200,
      headers: {
        'Content-Type': resposta.headers.get('Content-Type') ?? 'application/pdf',
        'Content-Disposition':
          resposta.headers.get('Content-Disposition') ?? `inline; filename="dossie-servico-${id}.pdf"`,
      },
    })
  } catch (err) {
    if (err instanceof ErroConexao) {
      return NextResponse.json({ mensagem: 'Falha de conexao com a API.' }, { status: 502 })
    }
    return NextResponse.json({ mensagem: 'Erro ao gerar o PDF.' }, { status: 500 })
  }
}
