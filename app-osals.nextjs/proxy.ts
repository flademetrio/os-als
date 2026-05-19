/**
 * proxy.ts (Next 16) — substituiu o antigo middleware.ts.
 *
 * Camada 1 de autenticacao: decodeJwt otimista (so verifica exp + aud).
 * Redireciona rotas privadas para /login quando token ausente/expirado.
 *
 * Camada 2 (verificacao real RS256) acontece em app/(privado)/layout.tsx.
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decodeJwt } from 'jose'

const COOKIE_ACCESS = 'osals_at'

// Rotas publicas — nao precisam de token
const ROTAS_PUBLICAS = ['/login', '/recuperar-senha', '/_next', '/favicon', '/api/health']

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Rota publica ou asset interno
  if (ROTAS_PUBLICAS.some((rota) => pathname.startsWith(rota))) {
    return NextResponse.next()
  }

  const token = req.cookies.get(COOKIE_ACCESS)?.value

  if (!token) {
    return redirecionarParaLogin(req)
  }

  // Validacao otimista: so verifica claims sem assinatura
  try {
    const claims = decodeJwt(token)
    const agora = Math.floor(Date.now() / 1000)
    if (!claims.exp || claims.exp < agora) {
      return redirecionarParaLogin(req)
    }
    const aud = claims.aud
    const audEsperada = process.env.JWT_AUDIENCE ?? 'tenant'
    if (aud !== audEsperada && !(Array.isArray(aud) && aud.includes(audEsperada))) {
      return redirecionarParaLogin(req)
    }
  } catch {
    return redirecionarParaLogin(req)
  }

  return NextResponse.next()
}

function redirecionarParaLogin(req: NextRequest) {
  const url = req.nextUrl.clone()
  url.pathname = '/login'
  url.search = ''
  return NextResponse.redirect(url)
}

export const config = {
  // Aplica em todas as rotas exceto assets estaticos
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
