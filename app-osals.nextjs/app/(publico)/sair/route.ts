/**
 * Handler /sair — limpa cookies de sessao no servidor e redireciona ao login.
 *
 * Usado pela camada 2 (verificarSessao) quando detecta token invalido:
 *   layout (privado) → catch → redirect('/sair') → limpa cookies → redirect('/login')
 *
 * Tambem pode ser invocado direto via GET /sair (link "Sair" simples).
 */

import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const COOKIES_A_LIMPAR = ['osals_at', 'osals_rt']

export async function GET(req: Request) {
  const store = await cookies()
  for (const nome of COOKIES_A_LIMPAR) {
    store.delete(nome)
  }
  const url = new URL('/login', req.url)
  return NextResponse.redirect(url)
}

export async function POST(req: Request) {
  return GET(req)
}
