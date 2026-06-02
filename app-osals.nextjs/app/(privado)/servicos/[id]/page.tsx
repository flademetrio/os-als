import Link from 'next/link'
import { clienteApi } from '@/app/lib/cliente-api'
import { lerSessao } from '@/app/lib/sessao'
import type {
  AnexoServicoResposta,
  CategoriaCustoResposta,
  ContatoClienteResposta,
  EquipamentoResumoDto,
  LancamentoCustoResposta,
  OrdemServicoResumoDto,
  PaginaResposta,
  ResumoFinanceiroServico,
  ServicoResposta,
  TecnicoResumoDto,
  TipoServicoResposta,
  VeiculoResumoDto,
} from '@/app/lib/definicoes'
import { badgeTipoServico } from '@/app/lib/esquemas/servico'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { AcoesCabecalhoServico } from './acoes-cabecalho-servico'
import { DetalheServico } from './detalhe-servico'

type Props = { params: Promise<{ id: string }> }

export default async function ServicoDetalhePage({ params }: Props) {
  const { id } = await params
  const servico = await clienteApi<ServicoResposta>(`/servicos/${id}`)

  const [
    tipos,
    ordens,
    tecnicos,
    veiculos,
    equipamentos,
    contatos,
    custos,
    resumo,
    categorias,
    anexos,
    sessao,
  ] = await Promise.all([
    clienteApi<TipoServicoResposta[]>('/tipos-servico?apenasAtivos=true'),
    clienteApi<OrdemServicoResumoDto[]>(`/servicos/${id}/ordens-servico`),
    clienteApi<PaginaResposta<TecnicoResumoDto>>('/tecnicos?apenasAtivos=true&tamanho=200'),
    clienteApi<PaginaResposta<VeiculoResumoDto>>('/veiculos?apenasAtivos=true&tamanho=200'),
    clienteApi<PaginaResposta<EquipamentoResumoDto>>(
      `/equipamentos?clienteId=${servico.clienteId}&apenasAtivos=true&tamanho=200`,
    ),
    clienteApi<ContatoClienteResposta[]>(`/clientes/${servico.clienteId}/contatos`),
    clienteApi<LancamentoCustoResposta[]>(`/servicos/${id}/custos`),
    clienteApi<ResumoFinanceiroServico>(`/servicos/${id}/resumo-financeiro`),
    clienteApi<CategoriaCustoResposta[]>('/categorias-custo?apenasAtivos=true'),
    clienteApi<AnexoServicoResposta[]>(`/servicos/${id}/anexos`),
    lerSessao(),
  ])

  const encerrado = servico.status === 'CONCLUIDO' || servico.status === 'CANCELADO'
  const ehGestor = sessao?.papel === 'GERENTE' || sessao?.papel === 'ADMIN'
  const ehAdmin = sessao?.papel === 'ADMIN'
  const podeAlterarCustos = !encerrado || ehGestor

  return (
    <div className="space-y-6">
      <Link href="/servicos" className="text-sm text-slate-500 hover:text-slate-700">
        ← Voltar para servicos
      </Link>

      <Card padding="md">
        {/* Cliente como titulo (esquerda) + numero do servico (canto direito) */}
        <div className="flex items-baseline justify-between gap-3">
          <h1 className="min-w-0">
            <Link
              href={`/clientes/${servico.clienteId}`}
              className="text-xl font-semibold text-primary hover:underline"
            >
              {servico.clienteNome}
            </Link>
          </h1>
          <span className="text-xl font-mono text-slate-400 shrink-0">
            Serviço {servico.numeroFormatado}
          </span>
        </div>

        {/* Descricao e painel de acoes lado a lado, mesma altura */}
        <div className="mt-3 flex items-stretch gap-4 flex-wrap">
          <div className="flex-1 min-w-[15rem] rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Descricao do servico
              </p>
              <Badge variant={badgeTipoServico(servico.tipoServicoNome)} size="sm">
                {servico.tipoServicoNome}
              </Badge>
            </div>
            <p className="text-xs text-slate-600 whitespace-pre-wrap">
              {servico.descricao || '—'}
            </p>
          </div>

          <AcoesCabecalhoServico servico={servico} ehAdmin={ehAdmin} />
        </div>

        {servico.finalizadoEm && (
          <p className="text-xs text-slate-400 mt-2">
            Encerrado em {formatarDataHora(servico.finalizadoEm)}
            {servico.finalizadoPorNome ? ` por ${servico.finalizadoPorNome}` : ''}
          </p>
        )}
      </Card>

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
        podeAlterarCustos={podeAlterarCustos}
        anexos={anexos}
        ehGestor={ehGestor}
        ehAdmin={ehAdmin}
      />
    </div>
  )
}

function formatarDataHora(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}
