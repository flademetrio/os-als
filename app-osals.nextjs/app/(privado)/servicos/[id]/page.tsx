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
import { badgeStatusServico } from '@/app/lib/esquemas/servico'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { AcoesCabecalhoServico } from './acoes-cabecalho-servico'
import { BotaoAbrirOs } from './botao-abrir-os'
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
  const podeAlterarCustos = !encerrado || ehGestor

  return (
    <div className="space-y-6">
      <Link href="/servicos" className="text-sm text-slate-500 hover:text-slate-700">
        ← Voltar para servicos
      </Link>

      <Card padding="md">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="text-2xl font-semibold text-slate-900 font-mono">
                Servico {servico.numeroFormatado}
              </h1>
              <Badge variant={badgeStatusServico(servico.status)} dot>
                {servico.statusRotulo}
              </Badge>
              <Badge variant="info" size="sm">
                {servico.tipoServicoNome}
              </Badge>
            </div>
            <p className="text-sm text-slate-500">
              <Link
                href={`/clientes/${servico.clienteId}`}
                className="text-primary hover:underline"
              >
                {servico.clienteNome}
              </Link>
            </p>
            {servico.finalizadoEm && (
              <p className="text-xs text-slate-400 mt-1">
                Encerrado em {formatarDataHora(servico.finalizadoEm)}
                {servico.finalizadoPorNome ? ` por ${servico.finalizadoPorNome}` : ''}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {!encerrado && (
              <BotaoAbrirOs
                servicoId={servico.id}
                tecnicos={tecnicos.conteudo}
                veiculos={veiculos.conteudo}
                equipamentos={equipamentos.conteudo}
                contatos={contatos}
              />
            )}
            <AcoesCabecalhoServico servico={servico} />
          </div>
        </div>
      </Card>

      <DetalheServico
        servico={servico}
        tipos={tipos}
        ordens={ordens}
        tecnicos={tecnicos.conteudo}
        custos={custos}
        resumo={resumo}
        categorias={categorias}
        podeAlterarCustos={podeAlterarCustos}
        anexos={anexos}
        ehGestor={ehGestor}
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
