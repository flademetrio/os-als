import Link from 'next/link'
import { clienteApi } from '@/app/lib/cliente-api'
import type { OrdemServicoResposta } from '@/app/lib/definicoes'
import { badgeStatusOs } from '@/app/lib/esquemas/ordem-servico'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { AcoesOs } from './acoes-os'

type Props = { params: Promise<{ id: string }> }

export default async function OrdemServicoDetalhePage({ params }: Props) {
  const { id } = await params
  const os = await clienteApi<OrdemServicoResposta>(`/ordens-servico/${id}`)
  const digitada = os.status === 'CONCLUIDA'

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href={`/servicos/${os.servicoId}`}
        className="text-sm text-slate-500 hover:text-slate-700"
      >
        ← Voltar para o servico {os.servicoNumeroFormatado}
      </Link>

      <Card padding="md">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="text-2xl font-semibold text-slate-900 font-mono">
                OS {os.codigoExibicao}
              </h1>
              <Badge variant={badgeStatusOs(os.status)} dot>
                {os.statusRotulo}
              </Badge>
            </div>
            <p className="text-sm text-slate-500">
              {os.clienteNome} · {os.tipoServicoNome} ·{' '}
              <Link
                href={`/servicos/${os.servicoId}`}
                className="text-primary hover:underline"
              >
                Servico {os.servicoNumeroFormatado}
              </Link>
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Aberta em {formatarDataHora(os.dataAbertura)}
              {os.dataImpressao ? ` · Impressa em ${formatarDataHora(os.dataImpressao)}` : ''}
            </p>
          </div>
          <AcoesOs os={os} />
        </div>
      </Card>

      <Card padding="md" title="Dados da OS">
        <div className="space-y-4">
          <Campo titulo="Atividade prevista">
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{os.descricaoAtividade}</p>
          </Campo>

          <Campo titulo="Tecnicos">
            {os.tecnicos.length === 0 ? (
              <Vazio />
            ) : (
              <ul className="text-sm text-slate-700 list-disc list-inside">
                {os.tecnicos.map((t) => (
                  <li key={t.id}>
                    {t.nome}
                    {t.especialidade ? ` — ${t.especialidade}` : ''}
                  </li>
                ))}
              </ul>
            )}
          </Campo>

          <Campo titulo="Veiculos">
            {os.veiculos.length === 0 ? (
              <Vazio />
            ) : (
              <ul className="text-sm text-slate-700 list-disc list-inside">
                {os.veiculos.map((v) => (
                  <li key={v.id}>
                    {[v.placa, v.marca, v.modelo].filter(Boolean).join(' ')}
                  </li>
                ))}
              </ul>
            )}
          </Campo>

          <Campo titulo="Equipamentos atendidos">
            {os.equipamentos.length === 0 ? (
              <Vazio />
            ) : (
              <ul className="text-sm text-slate-700 list-disc list-inside">
                {os.equipamentos.map((e) => (
                  <li key={e.id}>
                    {[e.marca, e.modelo].filter(Boolean).join(' ') || `Equipamento #${e.id}`}
                    {e.localizacaoInterna ? ` — ${e.localizacaoInterna}` : ''}
                    {e.numeroSerie ? ` (s/n ${e.numeroSerie})` : ''}
                  </li>
                ))}
              </ul>
            )}
          </Campo>
        </div>
      </Card>

      {digitada && (
        <Card padding="md" title="Execucao">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Campo titulo="Hora de inicio">
                <p className="text-sm text-slate-700">{formatarDataHora(os.horaInicioExecucao)}</p>
              </Campo>
              <Campo titulo="Hora de fim">
                <p className="text-sm text-slate-700">{formatarDataHora(os.horaFimExecucao)}</p>
              </Campo>
            </div>
            <Campo titulo="O que foi feito">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{os.oQueFoiFeito ?? '-'}</p>
            </Campo>
            <Campo titulo="Observacoes">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{os.observacoes ?? '-'}</p>
            </Campo>
            <Campo titulo="Impedimentos">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{os.impedimentos ?? '-'}</p>
            </Campo>
            {os.digitadoEm && (
              <p className="text-xs text-slate-400">
                Digitada em {formatarDataHora(os.digitadoEm)}
                {os.digitadoPorNome ? ` por ${os.digitadoPorNome}` : ''}
              </p>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}

function Campo({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
        {titulo}
      </p>
      {children}
    </div>
  )
}

function Vazio() {
  return <p className="text-sm text-slate-400">-</p>
}

function formatarDataHora(iso: string | null): string {
  if (!iso) return '-'
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}
