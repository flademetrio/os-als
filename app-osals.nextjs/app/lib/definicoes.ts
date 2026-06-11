/**
 * Tipos canonicos compartilhados, espelhando os DTOs do backend Java.
 * Manter em sincronia com br.com.osals.seguranca.aplicacao.dto.*
 */

export type Papel = 'OPERADOR' | 'COMPRAS' | 'GERENTE' | 'ADMIN' | 'TECNICO'

export type Permissao =
  | 'SERVICO_VER'
  | 'SERVICO_GERENCIAR'
  | 'ORDEM_SERVICO_EDITAR'
  | 'SERVICO_EXCLUIR'
  | 'CUSTO_VER'
  | 'CUSTO_EDITAR'
  | 'RELATORIO_VER'
  | 'CLIENTE_VER'
  | 'CLIENTE_GERENCIAR'
  | 'EQUIPAMENTO_VER'
  | 'EQUIPAMENTO_GERENCIAR'
  | 'PECA_VER'
  | 'PECA_GERENCIAR'
  | 'FORNECEDOR_VER'
  | 'FORNECEDOR_GERENCIAR'
  | 'VEICULO_VER'
  | 'VEICULO_GERENCIAR'
  | 'TECNICO_VER'
  | 'TECNICO_GERENCIAR'
  | 'CONFIG_GERENCIAR'
  | 'USUARIO_GERENCIAR'

export type UsuarioResumoDto = {
  id: number
  nome: string
  email: string
  papel: Papel
  permissoes: Permissao[]
}

// ===== Administracao de usuarios e permissoes =====

export type UsuarioAdminResumoDto = {
  id: number
  nome: string
  email: string
  papel: Papel
  ativo: boolean
}

export type UsuarioAdminResposta = {
  id: number
  nome: string
  email: string
  papel: Papel
  ativo: boolean
  permissoes: Permissao[]
}

export type PermissaoDto = {
  nome: Permissao
  grupo: string
  descricao: string
}

export type CatalogoPermissoesResposta = {
  permissoes: PermissaoDto[]
  /** chave = nome do papel (ex.: "COMPRAS"), valor = lista de permissoes do preset */
  presets: Record<string, Permissao[]>
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
  permissoes: Permissao[]
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
  nomeFantasia: string | null
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
  identificacaoUnidade: string
  clienteId: number
  clienteNome: string
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

// ===== Configuracoes =====

export type TipoValorConfiguracao = 'NUMBER' | 'STRING' | 'BOOLEAN'

export type ConfiguracaoResposta = {
  chave: string
  valor: string
  tipo: TipoValorConfiguracao
  descricao: string | null
  updatedAt: string | null
  updatedByNome: string | null
}

export type TipoServicoResposta = {
  id: number
  nome: string
  ativo: boolean
}

export type TipoLancamentoCusto =
  | 'ESTRUTURADO_MAO_OBRA'
  | 'ESTRUTURADO_DESLOCAMENTO'
  | 'LIVRE'

export type CategoriaCustoResposta = {
  id: number
  codigo: string
  nome: string
  tipoLancamento: TipoLancamentoCusto
  ativo: boolean
}

// ===== Servico =====

export type StatusServico =
  | 'EM_ABERTO'
  | 'EM_EXECUCAO'
  | 'AGUARDANDO'
  | 'CONCLUIDO'
  | 'CANCELADO'

export type ServicoResposta = {
  id: number
  numero: number
  numeroFormatado: string
  clienteId: number
  clienteNome: string
  tipoServicoId: number
  tipoServicoNome: string
  descricao: string
  dataInicioPrevista: string | null
  dataFimPrevista: string | null
  status: StatusServico
  statusRotulo: string
  finalizadoEm: string | null
  finalizadoPorNome: string | null
  createdAt: string
  createdByNome: string | null
  updatedAt: string | null
}

export type ServicoResumoDto = {
  id: number
  numero: number
  numeroFormatado: string
  clienteId: number
  clienteNome: string
  tipoServicoNome: string
  descricao: string
  dataInicioPrevista: string | null
  status: StatusServico
  statusRotulo: string
}

// ===== Ordem de Servico =====

export type StatusOrdemServico =
  | 'ABERTA'
  | 'IMPRESSA'
  | 'PENDENTE_DIGITACAO'
  | 'CONCLUIDA'
  | 'CANCELADA'

export type EmpresaOrdemServico = 'ALS' | 'FRYO'

export type OsTecnicoDto = {
  id: number
  nome: string
  especialidade: string | null
}

export type OsVeiculoDto = {
  id: number
  placa: string
  marca: string | null
  modelo: string | null
}

export type OsEquipamentoDto = {
  id: number
  marca: string | null
  modelo: string | null
  numeroSerie: string | null
  localizacaoInterna: string | null
}

export type OsContatoDto = {
  id: number
  nome: string
  funcao: string | null
  telefone: string | null
  email: string | null
}

export type OrdemServicoResposta = {
  id: number
  numero: number
  codigoExibicao: string
  servicoId: number
  servicoNumero: number
  servicoNumeroFormatado: string
  clienteId: number
  clienteNome: string
  tipoServicoNome: string
  descricaoAtividade: string
  empresa: EmpresaOrdemServico
  empresaRotulo: string
  status: StatusOrdemServico
  statusRotulo: string
  dataAgendada: string | null
  dataAbertura: string
  dataImpressao: string | null
  horaInicioExecucao: string | null
  horaFimExecucao: string | null
  oQueFoiFeito: string | null
  observacoes: string | null
  impedimentos: string | null
  digitadoEm: string | null
  digitadoPorNome: string | null
  createdAt: string
  createdByNome: string | null
  tecnicos: OsTecnicoDto[]
  veiculos: OsVeiculoDto[]
  equipamentos: OsEquipamentoDto[]
  contatos: OsContatoDto[]
}

// ===== Custos do Servico =====

export type LancamentoCustoResposta = {
  id: number
  servicoId: number
  categoriaCustoId: number
  categoriaCodigo: string
  categoriaNome: string
  tipoLancamento: TipoLancamentoCusto
  descricao: string | null
  valorTotalCentavos: number
  dataCusto: string
  tecnicoId: number | null
  tecnicoNome: string | null
  horas: number | null
  valorHoraSnapshotCentavos: number | null
  km: number | null
  valorKmSnapshotCentavos: number | null
  createdAt: string
  createdByNome: string | null
  updatedAt: string | null
}

export type CustoPorCategoria = {
  categoriaCustoId: number
  categoriaCodigo: string
  categoriaNome: string
  quantidadeLancamentos: number
  subtotalCentavos: number
}

export type ResumoFinanceiroServico = {
  servicoId: number
  custosPorCategoria: CustoPorCategoria[]
  custoTotalCentavos: number
  markupPercentual: number
  precoVendaCentavos: number
}

export type OrdemServicoResumoDto = {
  id: number
  numero: number
  codigoExibicao: string
  servicoId: number
  clienteId: number
  clienteNome: string
  descricaoAtividade: string
  empresa: EmpresaOrdemServico
  status: StatusOrdemServico
  statusRotulo: string
  dataAgendada: string | null
  dataAbertura: string
}

// ===== Anexos =====

export type AnexoServicoResposta = {
  id: number
  servicoId: number
  nomeArquivo: string
  descricao: string | null
  contentType: string
  tamanhoBytes: number
  createdAt: string
  createdByNome: string | null
}

export type AnexoOsResposta = {
  osId: number
  nomeArquivo: string
  contentType: string
  tamanhoBytes: number
  createdAt: string
  createdByNome: string | null
}

// ===== Relatorios =====

export type ContagemStatus = {
  status: StatusOrdemServico
  statusRotulo: string
  quantidade: number
}

export type RelatorioOsItem = {
  osId: number
  codigoExibicao: string
  servicoId: number
  clienteId: number
  clienteNome: string
  tecnicos: string
  dataAbertura: string
  dataFimPrevista: string | null
  status: StatusOrdemServico
  statusRotulo: string
}

export type OsPorStatusRelatorio = {
  contagemPorStatus: ContagemStatus[]
  totalOs: number
  itens: PaginaResposta<RelatorioOsItem>
}

export type CustosPorServicoItem = {
  servicoId: number
  numero: number
  numeroFormatado: string
  clienteId: number
  clienteNome: string
  descricao: string
  status: StatusServico
  statusRotulo: string
  maoObraCentavos: number
  deslocamentoCentavos: number
  pecasCentavos: number
  terceirosCentavos: number
  hospedagemCentavos: number
  custoTotalCentavos: number
  markupPercentual: number
  precoVendaCentavos: number
}

export type CustosPorClienteItem = {
  clienteId: number
  clienteNome: string
  quantidadeServicos: number
  quantidadeOs: number
  custoTotalCentavos: number
  markupPercentual: number
  precoVendaCentavos: number
}
