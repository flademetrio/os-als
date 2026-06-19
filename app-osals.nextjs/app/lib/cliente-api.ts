/**
 * Cliente HTTP centralizado para falar com a API backend.
 *
 * Uso EXCLUSIVO em Server Components e Server Actions — nunca direto no client
 * (cookies httpOnly so existem do lado servidor).
 *
 * Caracteristicas:
 *  - Timeout 30s
 *  - Injeta cookies de sessao automaticamente
 *  - Erros padronizados: ErroApi (HTTP 4xx/5xx) e ErroConexao (timeout/rede)
 *  - Sem cache do Next por padrao (no-store) — usar wrappers para cache opcional
 */

import { cookies } from 'next/headers'
import type { ErroRespostaBackend } from './definicoes'

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:8080'
const TIMEOUT_MS = 30_000

export class ErroApi extends Error {
  constructor(
    public readonly status: number,
    public readonly body: ErroRespostaBackend,
  ) {
    super(body.mensagem)
    this.name = 'ErroApi'
  }
}

export class ErroConexao extends Error {
  constructor(mensagem: string) {
    super(mensagem)
    this.name = 'ErroConexao'
  }
}

type OpcoesClienteApi = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  /** Headers extras. Cookies de sessao sao injetados automaticamente. */
  headers?: Record<string, string>
  /** Cookies adicionais a propagar (raros — login retorna Set-Cookie pelo response, nao via aqui). */
  cookiesExtras?: string
}

/**
 * Faz a requisicao HTTP e devolve o JSON tipado. Lanca ErroApi/ErroConexao.
 */
export async function clienteApi<T>(caminho: string, opcoes: OpcoesClienteApi = {}): Promise<T> {
  const url = `${API_BASE_URL}${caminho.startsWith('/') ? caminho : '/' + caminho}`

  // Monta header Cookie a partir dos cookies do request atual (Server-side).
  const cookieStore = await cookies()
  const todosCookies = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ')

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(opcoes.headers ?? {}),
  }
  if (todosCookies) headers.Cookie = todosCookies
  if (opcoes.body !== undefined) headers['Content-Type'] = 'application/json'

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const res = await fetch(url, {
      method: opcoes.method ?? 'GET',
      headers,
      body: opcoes.body !== undefined ? JSON.stringify(opcoes.body) : undefined,
      signal: controller.signal,
      cache: 'no-store',
    })

    if (!res.ok) {
      let body: ErroRespostaBackend
      try {
        body = (await res.json()) as ErroRespostaBackend
      } catch {
        body = {
          codigo: res.status,
          mensagem: `HTTP ${res.status}`,
          timestamp: new Date().toISOString(),
        }
      }
      throw new ErroApi(res.status, body)
    }

    if (res.status === 204) {
      return undefined as T
    }

    return (await res.json()) as T
  } catch (err) {
    if (err instanceof ErroApi) throw err
    if (err instanceof Error && err.name === 'AbortError') {
      throw new ErroConexao('Timeout ao conectar a API.')
    }
    throw new ErroConexao('Falha de conexao com a API.')
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Envia multipart/form-data (upload de arquivos) e retorna o Response bruto.
 *
 * Nao define Content-Type manualmente — o fetch monta o cabecalho com o
 * boundary correto a partir do FormData. Injeta os cookies de sessao.
 */
export async function clienteApiUpload(
  caminho: string,
  formData: FormData,
): Promise<Response> {
  const url = `${API_BASE_URL}${caminho.startsWith('/') ? caminho : '/' + caminho}`

  const cookieStore = await cookies()
  const todosCookies = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ')

  const headers: Record<string, string> = { Accept: 'application/json' }
  if (todosCookies) headers.Cookie = todosCookies

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    return await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
      signal: controller.signal,
      cache: 'no-store',
    })
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new ErroConexao('Timeout ao conectar a API.')
    }
    throw new ErroConexao('Falha de conexao com a API.')
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Versao bruta que retorna o Response completo (uteis para login/refresh,
 * onde precisamos repassar os cookies Set-Cookie do back para o navegador).
 */
export async function clienteApiBruto(
  caminho: string,
  opcoes: OpcoesClienteApi = {},
): Promise<Response> {
  const url = `${API_BASE_URL}${caminho.startsWith('/') ? caminho : '/' + caminho}`

  const cookieStore = await cookies()
  const todosCookies = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ')

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(opcoes.headers ?? {}),
  }
  if (todosCookies) headers.Cookie = todosCookies
  if (opcoes.body !== undefined) headers['Content-Type'] = 'application/json'

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    return await fetch(url, {
      method: opcoes.method ?? 'GET',
      headers,
      body: opcoes.body !== undefined ? JSON.stringify(opcoes.body) : undefined,
      signal: controller.signal,
      cache: 'no-store',
    })
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new ErroConexao('Timeout ao conectar a API.')
    }
    throw new ErroConexao('Falha de conexao com a API.')
  } finally {
    clearTimeout(timer)
  }
}
