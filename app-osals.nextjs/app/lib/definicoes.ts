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

// ===== Cadastro: Cliente / Unidade / Contato =====

export type TipoPessoa = 'PF' | 'PJ'

export type ClienteResposta = {
  id: number
  tipoPessoa: TipoPessoa
  documento: string
  nome: string
  nomeFantasia: string | null
  ativo: boolean
  createdAt: string
  updatedAt: string | null
}

export type ClienteResumoDto = {
  id: number
  tipoPessoa: TipoPessoa
  documento: string
  nome: string
  ativo: boolean
}

export type UnidadeResposta = {
  id: number
  clienteId: number
  identificacaoInterna: string
  cep: string | null
  logradouro: string | null
  numero: string | null
  complemento: string | null
  bairro: string | null
  cidade: string | null
  estado: string | null
  ativo: boolean
}

export type ContatoClienteResposta = {
  id: number
  clienteId: number
  nome: string
  funcao: string | null
  telefone: string | null
  email: string | null
}
