'use server'

import { redirect } from 'next/navigation'
import { clienteApiBruto, ErroApi, ErroConexao } from '@/app/lib/cliente-api'
import { repassarCookiesDeApi } from '@/app/lib/sessao'
import { loginSchema } from '@/app/lib/esquemas/auth'
import type { TokenResposta } from '@/app/lib/definicoes'

export type EstadoLogin = {
  erro?: string
  errosCampos?: Record<string, string>
  sucesso?: boolean
}

export async function entrar(
  _estadoAnterior: EstadoLogin,
  formData: FormData,
): Promise<EstadoLogin> {
  const dados = {
    email: String(formData.get('email') ?? ''),
    senha: String(formData.get('senha') ?? ''),
  }

  const parse = loginSchema.safeParse(dados)
  if (!parse.success) {
    const errosCampos: Record<string, string> = {}
    for (const issue of parse.error.issues) {
      const campo = String(issue.path[0])
      if (campo && !errosCampos[campo]) errosCampos[campo] = issue.message
    }
    return { errosCampos }
  }

  let resposta: Response
  try {
    resposta = await clienteApiBruto('/auth/login', {
      method: 'POST',
      body: parse.data,
    })
  } catch (err) {
    if (err instanceof ErroConexao) {
      return { erro: 'Falha ao conectar a API. Tente novamente.' }
    }
    return { erro: 'Erro inesperado ao tentar entrar.' }
  }

  if (!resposta.ok) {
    let body: { mensagem?: string } | null = null
    try {
      body = await resposta.json()
    } catch {
      body = null
    }
    if (resposta.status === 401) {
      return { erro: body?.mensagem ?? 'Email ou senha invalidos.' }
    }
    if (resposta.status === 423) {
      return { erro: body?.mensagem ?? 'Conta bloqueada. Tente novamente em alguns minutos.' }
    }
    if (resposta.status === 400) {
      return { erro: body?.mensagem ?? 'Dados invalidos.' }
    }
    return { erro: 'Nao foi possivel entrar. Tente novamente.' }
  }

  // Sucesso — repassa Set-Cookie da resposta da API para o navegador
  await repassarCookiesDeApi(resposta)

  // Consome o body so para confirmar (nao usado diretamente — sessao vem do cookie)
  try {
    await (resposta.json() as Promise<TokenResposta>)
  } catch {
    /* corpo opcional */
  }

  redirect('/dashboard')
}
