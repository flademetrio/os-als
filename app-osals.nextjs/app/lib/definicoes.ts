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

// ===== Cadastro: Equipamento =====

export type TipoEquipamento =
  | 'SPLIT'
  | 'MULTI_SPLIT'
  | 'VRF'
  | 'SELF'
  | 'CHILLER'
  | 'FAN_COIL'
  | 'JANELA'
  | 'OUTRO'

export type StatusEquipamento = 'ATIVO' | 'EM_MANUTENCAO' | 'DESATIVADO'

export type EquipamentoResposta = {
  id: number
  unidadeId: number
  clienteId: number
  marca: string | null
  modelo: string | null
  numeroSerie: string | null
  tipo: TipoEquipamento
  capacidadeBtus: number | null
  capacidadeTr: number | null
  localizacaoInterna: string | null
  dataInstalacao: string | null
  dataUltimaManutencao: string | null
  status: StatusEquipamento
  ativo: boolean
}

export type EquipamentoResumoDto = {
  id: number
  unidadeId: number
  tipo: TipoEquipamento
  marca: string | null
  modelo: string | null
  localizacaoInterna: string | null
  status: StatusEquipamento
  ativo: boolean
}

// ===== Cadastro: Veículo =====

export type StatusVeiculo = 'ATIVO' | 'MANUTENCAO' | 'INATIVO'

export type VeiculoResposta = {
  id: number
  placa: string
  marca: string | null
  modelo: string | null
  ano: number | null
  status: StatusVeiculo
  ativo: boolean
}

export type VeiculoResumoDto = {
  id: number
  placa: string
  modelo: string | null
  status: StatusVeiculo
}

// ===== Cadastro: Técnico =====

export type TecnicoResposta = {
  id: number
  nome: string
  email: string
  especialidade: string | null
  telefone: string | null
  valorHoraCentavos: number
  ativo: boolean
}

export type TecnicoResumoDto = {
  id: number
  nome: string
  especialidade: string | null
  ativo: boolean
}

// ===== Cadastro: Peça =====

export type PecaResposta = {
  id: number
  nome: string
  descricao: string | null
  unidadeMedidaId: number | null
  unidadeMedidaSigla: string | null
  ativo: boolean
}

export type UnidadeMedidaResposta = {
  id: number
  sigla: string
  nome: string
}

// ===== Cadastro: Fornecedor =====

export type FornecedorResposta = {
  id: number
  nome: string
  tipoPessoa: TipoPessoa | null
  documento: string | null
  telefone: string | null
  email: string | null
  ativo: boolean
}
