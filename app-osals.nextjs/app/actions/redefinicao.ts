'use server'

import { clienteApiBruto, ErroConexao } from '@/app/lib/cliente-api'

export type ValidacaoLink = { valido: boolean; nome: string | null }

/** Valida o token do link (publico, sem sessao). Falha de rede => invalido. */
export async function validarLink(token: string): Promise<ValidacaoLink> {
  if (!token) return { valido: false, nome: null }
  try {
    const res = await clienteApiBruto(
      `/auth/redefinir-senha/validar?token=${encodeURIComponent(token)}`,
    )
    if (!res.ok) return { valido: false, nome: null }
    return (await res.json()) as ValidacaoLink
  } catch {
    return { valido: false, nome: null }
  }
}

export type EstadoRedefinicao = {
  erro?: string
  errosCampos?: Record<string, string>
  sucesso?: boolean
}

/** Consome o token e define a nova senha (publico). */
export async function redefinirPorToken(
  token: string,
  _estado: EstadoRedefinicao,
  formData: FormData,
): Promise<EstadoRedefinicao> {
  const novaSenha = String(formData.get('novaSenha') ?? '')
  const confirmar = String(formData.get('confirmar') ?? '')

  if (novaSenha.length < 8) {
    return { errosCampos: { novaSenha: 'A senha deve ter no minimo 8 caracteres' } }
  }
  if (novaSenha !== confirmar) {
    return { errosCampos: { confirmar: 'As senhas nao conferem' } }
  }

  let res: Response
  try {
    res = await clienteApiBruto('/auth/redefinir-senha', {
      method: 'POST',
      body: { token, novaSenha },
    })
  } catch (err) {
    if (err instanceof ErroConexao) return { erro: 'Falha ao conectar a API. Tente novamente.' }
    return { erro: 'Erro inesperado ao redefinir a senha.' }
  }

  if (!res.ok) {
    let body: { mensagem?: string } | null = null
    try {
      body = await res.json()
    } catch {
      body = null
    }
    return { erro: body?.mensagem ?? 'Link invalido ou expirado.' }
  }

  return { sucesso: true }
}
