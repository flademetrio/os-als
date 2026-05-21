/**
 * Route handler proxy: GET /api-proxy/ordens-servico/{id}/anexo/conteudo
 *
 * Baixa o PDF do anexo unico de uma OS (o scan do papel preenchido).
 * Proxy para nao expor o cookie JWT httpOnly ao navegador.
 */

import { NextResponse } from 'next/server'
import { clienteApiBruto, ErroConexao } from '@/app/lib/cliente-api'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params

  try {
    const resposta = await clienteApiBruto(`/ordens-servico/${id}/anexo/conteudo`)
    if (!resposta.ok) {
      const erro = await resposta.json().catch(() => ({ mensagem: 'Anexo nao encontrado.' }))
      return NextResponse.json(erro, { status: resposta.status })
    }
    return new NextResponse(await resposta.arrayBuffer(), {
      status: 200,
      headers: {
        'Content-Type': resposta.headers.get('Content-Type') ?? 'application/pdf',
        'Content-Disposition':
          resposta.headers.get('Content-Disposition') ?? `inline; filename="os-${id}-anexo.pdf"`,
      },
    })
  } catch (err) {
    if (err instanceof ErroConexao) {
      return NextResponse.json({ mensagem: 'Falha de conexao com a API.' }, { status: 502 })
    }
    return NextResponse.json({ mensagem: 'Erro ao baixar o anexo.' }, { status: 500 })
  }
}
