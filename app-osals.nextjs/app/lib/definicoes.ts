/**
 * Tipos canonicos compartilhados, espelhando os DTOs do backend Java.
 * Manter em sincronia com br.com.osals.seguranca.aplicacao.dto.*
 */

export type Papel = 'OPERADOR' | 'GERENTE' | 'ADMIN' | 'TECNICO'

export type UsuarioResumoDto = {
  id: number
  nome: string
  email: string
  papel: Papel
}

export type TokenResposta = {
  usuario: UsuarioResumoDto
  expiraEm: number // epoch millis do access token
}

/**
 * Erro padronizado retornado pelo TratadorExcecoesGlobal do back.
 */
export type ErroRespostaBackend = {
  codigo: number
  mensagem: string
  timestamp: string
}

/**
 * Resposta paginada padrao.
 */
export type PaginaResposta<T> = {
  conteudo: T[]
  pagina: number
  tamanho: number
  totalElementos: number
  totalPaginas: number
}

/**
 * Sessao do usuario logado (snapshot decodificado do JWT + cookies).
 */
export type SessaoUsuario = {
  id: number
  nome: string
  email: string
  papel: Papel
  versaoToken: number
  expiraEm: number
}
