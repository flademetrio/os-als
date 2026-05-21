/**
 * Route handler proxy: POST /api-proxy/ordens-servico/{id}/imprimir
 *
 * Marca a OS como impressa e devolve o PDF gerado pelo backend. Existe como
 * proxy para que o Client Component possa baixar o PDF sem expor o cookie
 * JWT httpOnly — o Next chama o back server-side com o cookie atual.
 */

import { NextResponse } from 'next/server'
import { clienteApiBruto, ErroConexao } from '@/app/lib/cliente-api'

type Params = { params: Promise<{ id: string }> }

export async function POST(_req: Request, { params }: Params) {
  const { id } = await params

  try {
    const resposta = await clienteApiBruto(`/ordens-servico/${id}/imprimir`, {
      method: 'POST',
    })

    if (!resposta.ok) {
      const erro = await resposta.json().catch(() => ({ mensagem: 'Falha ao gerar o PDF.' }))
      return NextResponse.json(erro, { status: resposta.status })
    }

    const pdf = await resposta.arrayBuffer()
    return new NextResponse(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="os-${id}.pdf"`,
      },
    })
  } catch (err) {
    if (err instanceof ErroConexao) {
      return NextResponse.json({ mensagem: 'Falha de conexao com a API.' }, { status: 502 })
    }
    return NextResponse.json({ mensagem: 'Erro ao gerar o PDF.' }, { status: 500 })
  }
}
