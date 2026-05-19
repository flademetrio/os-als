/**
 * Gerenciamento de sessao (cookies httpOnly + verificacao JWT).
 *
 * Duas camadas:
 *  - Camada 1 (rapida): proxy.ts faz decodeJwt otimista (so verifica exp + aud).
 *  - Camada 2 (segura): verificarSessao() em layouts privados faz jwtVerify RS256.
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { cookies } from 'next/headers'
import { decodeJwt, jwtVerify, importSPKI } from 'jose'
import type { Papel, SessaoUsuario } from './definicoes'

const COOKIE_ACCESS = 'osals_at'

/**
 * Le a sessao do cookie sem verificar a assinatura (decodeJwt). Uso somente em
 * camadas onde a verificacao real ja aconteceu (apos verificarSessao no layout).
 */
export async function lerSessao(): Promise<SessaoUsuario | null> {
  const store = await cookies()
  const token = store.get(COOKIE_ACCESS)?.value
  if (!token) return null

  try {
    const claims = decodeJwt(token)
    if (!claims.sub || !claims.exp) return null

    return {
      id: Number(claims.sub),
      nome: (claims.nome as string) ?? '',
      email: (claims.email as string) ?? '',
      papel: (claims.papel as Papel) ?? 'OPERADOR',
      versaoToken: (claims.versaoToken as number) ?? 0,
      expiraEm: claims.exp * 1000,
    }
  } catch {
    return null
  }
}

// Cache da chave publica em memoria (carrega 1x por processo).
type ChavePublica = Awaited<ReturnType<typeof importSPKI>>
let chavePublicaCache: ChavePublica | null = null

async function carregarChavePublica(): Promise<ChavePublica> {
  if (chavePublicaCache) return chavePublicaCache

  const caminho = process.env.JWT_CHAVE_PUBLICA_CAMINHO ?? './keys/chave-publica.pem'
  const caminhoAbsoluto = resolve(process.cwd(), caminho)
  const pem = readFileSync(caminhoAbsoluto, 'utf-8')
  chavePublicaCache = await importSPKI(pem, 'RS256')
  return chavePublicaCache
}

/**
 * Verifica criptograficamente o JWT (RS256) usando a chave publica do back.
 * Lanca se invalido/expirado. Chamar no layout (privado)/layout.tsx.
 */
export async function verificarSessao(): Promise<SessaoUsuario> {
  const store = await cookies()
  const token = store.get(COOKIE_ACCESS)?.value
  if (!token) {
    throw new Error('Sem token de acesso')
  }

  const chave = await carregarChavePublica()
  const { payload } = await jwtVerify(token, chave, {
    issuer: process.env.JWT_EMISSOR ?? 'os-als',
    audience: process.env.JWT_AUDIENCE ?? 'tenant',
  })

  return {
    id: Number(payload.sub),
    nome: (payload.nome as string) ?? '',
    email: (payload.email as string) ?? '',
    papel: (payload.papel as Papel) ?? 'OPERADOR',
    versaoToken: (payload.versaoToken as number) ?? 0,
    expiraEm: (payload.exp ?? 0) * 1000,
  }
}

/**
 * Repassa os cookies Set-Cookie de uma resposta da API (login/refresh/logout)
 * para o navegador via cookies() store do Next.
 */
export async function repassarCookiesDeApi(resposta: Response): Promise<void> {
  const setCookieHeaders = resposta.headers.getSetCookie?.() ?? []
  if (setCookieHeaders.length === 0) return

  const store = await cookies()
  for (const raw of setCookieHeaders) {
    const cookie = parseCookieHeader(raw)
    if (!cookie) continue
    if (cookie.maxAge !== undefined && cookie.maxAge <= 0) {
      store.delete(cookie.name)
      continue
    }
    store.set({
      name: cookie.name,
      value: cookie.value,
      httpOnly: cookie.httpOnly,
      path: cookie.path ?? '/',
      maxAge: cookie.maxAge,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })
  }
}

type CookieParseado = {
  name: string
  value: string
  httpOnly: boolean
  path?: string
  maxAge?: number
}

function parseCookieHeader(raw: string): CookieParseado | null {
  const partes = raw.split(';').map((p) => p.trim())
  const [nv, ...attrs] = partes
  if (!nv) return null
  const idx = nv.indexOf('=')
  if (idx === -1) return null

  const result: CookieParseado = {
    name: nv.slice(0, idx).trim(),
    value: nv.slice(idx + 1).trim(),
    httpOnly: false,
  }

  for (const attr of attrs) {
    const [k, v] = attr.split('=').map((s) => s.trim())
    const kLower = k.toLowerCase()
    if (kLower === 'httponly') result.httpOnly = true
    else if (kLower === 'path') result.path = v
    else if (kLower === 'max-age') result.maxAge = Number(v)
    else if (kLower === 'expires') {
      if (result.maxAge === undefined && v) {
        const ms = new Date(v).getTime() - Date.now()
        result.maxAge = Math.max(0, Math.round(ms / 1000))
      }
    }
  }

  return result
}
