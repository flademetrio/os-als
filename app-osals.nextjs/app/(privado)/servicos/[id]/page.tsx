import Link from 'next/link'
import { clienteApi } from '@/app/lib/cliente-api'
import { lerSessao } from '@/app/lib/sessao'
import type {
  AnexoServicoResposta,
  CategoriaCustoResposta,
  CobrancaResposta,
  ContatoClienteResposta,
  EquipamentoResumoDto,
  FaturamentoResposta,
  LancamentoCustoResposta,
  OrdemServicoResumoDto,
  PaginaResposta,
  ResumoFinanceiroServico,
  ServicoResposta,
  TecnicoResumoDto,
  TipoServicoResposta,
  VeiculoResumoDto,
} from '@/app/lib/definicoes'
import { DetalheServico } from './detalhe-servico'

type Props = { params: Promise<{ id: string }> }

export default async function ServicoDetalhePage({ params }: Props) {
  const { id } = await params
  const sessao = await lerSessao()
  const permissoes = sessao?.permissoes ?? []
  const podeVerCustos = permissoes.includes('CUSTO_VER')
  const podeEditarCustos = permissoes.includes('CUSTO_EDITAR')
  const podeEditarOs = permissoes.includes('ORDEM_SERVICO_EDITAR')
  const podeVerFaturamento = permissoes.includes('FATURAMENTO_VER')
  const podeEditarFaturamento = permissoes.includes('FATURAMENTO_EDITAR')

  const servico = await clienteApi<ServicoResposta>(`/servicos/${id}`)

  const [tipos, ordens, tecnicos, veiculos, equipamentos, contatos, anexos] = await Promise.all([
    clienteApi<TipoServicoResposta[]>('/tipos-servico?apenasAtivos=true'),
    clienteApi<OrdemServicoResumoDto[]>(`/servicos/${id}/ordens-servico`),
    clienteApi<PaginaResposta<TecnicoResumoDto>>('/tecnicos?apenasAtivos=true&tamanho=200'),
    clienteApi<PaginaResposta<VeiculoResumoDto>>('/veiculos?apenasAtivos=true&tamanho=200'),
    clienteApi<PaginaResposta<EquipamentoResumoDto>>(
      `/equipamentos?clienteId=${servico.clienteId}&apenasAtivos=true&tamanho=200`,
    ),
    clienteApi<ContatoClienteResposta[]>(`/clientes/${servico.clienteId}/contatos`),
    clienteApi<AnexoServicoResposta[]>(`/servicos/${id}/anexos`),
  ])

  // Custos (e o catalogo de categorias usado no modal) so sao buscados quando o
  // usuario tem CUSTO_VER — caso contrario o backend retornaria 403 e a tela quebraria.
  const [custos, resumo, categorias]: [
    LancamentoCustoResposta[],
    ResumoFinanceiroServico,
    CategoriaCustoResposta[],
  ] = podeVerCustos
    ? await Promise.all([
        clienteApi<LancamentoCustoResposta[]>(`/servicos/${id}/custos`),
        clienteApi<ResumoFinanceiroServico>(`/servicos/${id}/resumo-financeiro`),
        clienteApi<CategoriaCustoResposta[]>('/categorias-custo?apenasAtivos=true'),
      ])
    : [[], resumoVazio(servico.id), []]

  // Cobranca e faturamento so sao buscados quando o usuario tem FATURAMENTO_VER.
  const [cobranca, faturamento]: [CobrancaResposta | undefined, FaturamentoResposta | undefined] =
    podeVerFaturamento
      ? await Promise.all([
          clienteApi<CobrancaResposta>(`/servicos/${id}/cobranca`),
          clienteApi<FaturamentoResposta>(`/servicos/${id}/faturamento`),
        ])
      : [undefined, undefined]

  const encerrado = servico.status === 'CONCLUIDO' || servico.status === 'CANCELADO'
  const ehGestor = sessao?.papel === 'GERENTE' || sessao?.papel === 'ADMIN'
  const ehAdmin = sessao?.papel === 'ADMIN'
  const podeAlterarCustos = podeEditarCustos && (!encerrado || ehGestor)
  const podeAlterarFaturamento = podeEditarFaturamento && (!encerrado || ehGestor)

  return (
    <div className="space-y-6">
      <Link href="/servicos" className="text-sm text-slate-500 hover:text-slate-700">
        ← Voltar para servicos
      </Link>

      <DetalheServico
        servico={servico}
        tipos={tipos}
        ordens={ordens}
        tecnicos={tecnicos.conteudo}
        veiculos={veiculos.conteudo}
        equipamentos={equipamentos.conteudo}
        contatos={contatos}
        custos={custos}
        resumo={resumo}
        categorias={categorias}
        podeVerCustos={podeVerCustos}
        podeAlterarCustos={podeAlterarCustos}
        anexos={anexos}
        cobranca={cobranca}
        faturamento={faturamento}
        podeVerFaturamento={podeVerFaturamento}
        podeAlterarFaturamento={podeAlterarFaturamento}
        ehGestor={ehGestor}
        ehAdmin={ehAdmin}
        podeEditarOs={podeEditarOs}
      />
    </div>
  )
}

function resumoVazio(servicoId: number): ResumoFinanceiroServico {
  return {
    servicoId,
    custosPorCategoria: [],
    custoTotalCentavos: 0,
    markupPercentual: 0,
    precoVendaCentavos: 0,
  }
}
