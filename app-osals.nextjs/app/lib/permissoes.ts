import type { Permissao, SessaoUsuario } from './definicoes'

/** Verdadeiro se a sessao possui a permissao informada. */
export function temPermissao(sessao: SessaoUsuario | null, permissao: Permissao): boolean {
  return !!sessao?.permissoes.includes(permissao)
}

/** Verdadeiro se a sessao possui ao menos uma das permissoes informadas. */
export function temAlguma(sessao: SessaoUsuario | null, permissoes: Permissao[]): boolean {
  return !!sessao && permissoes.some((p) => sessao.permissoes.includes(p))
}
