import Link from 'next/link'
import { clienteApi } from '@/app/lib/cliente-api'
import type {
  LancamentoCustoResposta,
  OrdemRelatorioItem,
  RelatorioServicoCompleto,
} from '@/app/lib/definicoes'
import { formatarDataIso } from '@/app/lib/data'
import { centavosParaReais } from '@/app/lib/moeda'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'

const FUSO = 'America/Sao_Paulo'

type Props = { params: Promise<{ id: string }> }

function horaBR(iso: string | null): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleTimeString('pt-BR', { timeZone: FUSO, hour: '2-digit', minute: '2-digit' })
}

function dataHora(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('pt-BR', { timeZone: FUSO, dateStyle: 'short', timeStyle: 'short' })
}

function execucao(o: OrdemRelatorioItem): string {
  const i = horaBR(o.horaInicioExecucao)
  const f = horaBR(o.horaFimExecucao)
  return i && f ? `${i} – ${f}` : '—'
}

function detalheCusto(l: LancamentoCustoResposta): string {
  if (l.descricao) return l.descricao
  if (l.tipoLancamento === 'ESTRUTURADO_MAO_OBRA' && l.tecnicoNome) return l.tecnicoNome
  return '—'
}

export default async function RelatorioServicoDossiePage({ params }: Props) {
  const { id } = await params
  const dossie = await clienteApi<RelatorioServicoCompleto>(`/relatorios/servico/${id}`)
  const { servico: s, ordens, custos, custoTotalCentavos, cobranca, faturamento } = dossie

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <Link href="/relatorios/servico" className="text-sm text-slate-500 hover:text-slate-700">
          ← Voltar
        </Link>
        <a
          href={`/api-proxy/relatorios/servico/${id}/pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary bg-transparent px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
        >
          Gerar PDF
        </a>
      </div>

      {/* Cabecalho do servico */}
      <Card padding="md">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              Servico <span className="font-mono">{s.numeroFormatado}</span>
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">{s.clienteNome}</p>
          </div>
          <Badge variant="default" dot>
            {s.statusRotulo}
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 mt-4 text-sm">
          <Campo rotulo="Tipo de servico" valor={s.tipoServicoNome} />
          <Campo rotulo="Empresa" valor={s.empresaRotulo} />
          <Campo rotulo="Inicio previsto" valor={s.dataInicioPrevista ? formatarDataIso(s.dataInicioPrevista) : '—'} />
          <Campo rotulo="Fim previsto" valor={s.dataFimPrevista ? formatarDataIso(s.dataFimPrevista) : '—'} />
          <Campo rotulo="Aberto em" valor={dataHora(s.createdAt)} />
          <Campo
            rotulo="Finalizado"
            valor={s.finalizadoEm ? `${dataHora(s.finalizadoEm)}${s.finalizadoPorNome ? ' · ' + s.finalizadoPorNome : ''}` : '—'}
          />
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Descricao</p>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{s.descricao}</p>
        </div>
      </Card>

      {/* Ordens de servico por data */}
      <Secao titulo="Ordens de servico" contador={ordens.length}>
        {ordens.length === 0 ? (
          <Vazio texto="Nenhuma OS neste servico." />
        ) : (
          <div className="space-y-3">
            {ordens.map((o) => (
              <div key={o.osId} className="rounded-lg border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-primary">{o.codigoExibicao}</span>
                    <span className="text-sm text-slate-500">
                      {o.dataAgendada ? formatarDataIso(o.dataAgendada) : 'sem data agendada'}
                    </span>
                  </div>
                  <Badge variant="default" size="sm" dot>
                    {o.statusRotulo}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mt-3 text-sm">
                  <CampoLargo rotulo="Atividade prevista" valor={o.descricaoAtividade || '—'} />
                  <CampoLargo rotulo="O que foi feito" valor={o.oQueFoiFeito || '—'} />
                  <Campo rotulo="Tecnicos" valor={o.tecnicos || '—'} />
                  <Campo rotulo="Veiculos" valor={o.veiculos || '—'} />
                  <Campo rotulo="Execucao" valor={execucao(o)} />
                  {o.observacoes && <CampoLargo rotulo="Observacoes" valor={o.observacoes} />}
                  {o.impedimentos && <CampoLargo rotulo="Impedimentos" valor={o.impedimentos} />}
                </div>
              </div>
            ))}
          </div>
        )}
      </Secao>

      {/* Custos por data */}
      <Secao titulo="Custos" contador={custos.length}>
        {custos.length === 0 ? (
          <Vazio texto="Nenhum custo lancado." />
        ) : (
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-2.5 text-left whitespace-nowrap">Data</th>
                  <th className="px-5 py-2.5 text-left">Categoria</th>
                  <th className="px-5 py-2.5 text-left">Detalhe</th>
                  <th className="px-5 py-2.5 text-right whitespace-nowrap">Valor</th>
                </tr>
              </thead>
              <tbody>
                {custos.map((l) => (
                  <tr key={l.id} className="border-b border-slate-100">
                    <td className="px-5 py-2.5 whitespace-nowrap text-slate-600">
                      {formatarDataIso(l.dataCusto)}
                    </td>
                    <td className="px-5 py-2.5 text-slate-700">{l.categoriaNome}</td>
                    <td className="px-5 py-2.5 text-slate-600">{detalheCusto(l)}</td>
                    <td className="px-5 py-2.5 text-right font-medium text-slate-900">
                      {centavosParaReais(l.valorTotalCentavos)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-300 bg-slate-50 font-semibold text-slate-900">
                  <td className="px-5 py-2.5" colSpan={3}>
                    Custo total
                  </td>
                  <td className="px-5 py-2.5 text-right">{centavosParaReais(custoTotalCentavos)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Secao>

      {/* Cobranca e Faturamento lado a lado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Secao titulo="Cobranca">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <Campo rotulo="Tipo" valor={cobranca.tipoRotulo} />
            <Campo
              rotulo="Valor cobrado"
              valor={cobranca.valorCentavos != null ? centavosParaReais(cobranca.valorCentavos) : '—'}
            />
            <Campo rotulo="Dias previstos" valor={cobranca.diasPrevistos != null ? String(cobranca.diasPrevistos) : '—'} />
            <Campo rotulo="Pessoas" valor={cobranca.qtdePessoas != null ? String(cobranca.qtdePessoas) : '—'} />
          </div>
          {cobranca.obs && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Obs</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{cobranca.obs}</p>
            </div>
          )}
        </Secao>

        <Secao titulo="Faturamento (NFs)">
          {!faturamento.aplicavel ? (
            <Vazio texto="Faturamento nao se aplica (cobranca nao e Cobrado)." />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm mb-3">
                <Campo rotulo="Status" valor={faturamento.statusRotulo} />
                <Campo rotulo="Total das NFs" valor={centavosParaReais(faturamento.totalNfCentavos)} />
              </div>
              {faturamento.notas.length === 0 ? (
                <Vazio texto="Nenhuma nota fiscal lancada." />
              ) : (
                <ul className="divide-y divide-slate-100 border-t border-slate-100">
                  {faturamento.notas.map((nf) => (
                    <li key={nf.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                      <span className="text-slate-700">
                        NF <span className="font-medium">{nf.numero}</span>
                        <span className="text-slate-400"> · {formatarDataIso(nf.dataEmissao)}</span>
                      </span>
                      <span className="font-medium text-slate-900">{centavosParaReais(nf.valorCentavos)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </Secao>
      </div>
    </div>
  )
}

function Secao({
  titulo,
  contador,
  children,
}: {
  titulo: string
  contador?: number
  children: React.ReactNode
}) {
  return (
    <Card padding="md">
      <h2 className="text-sm font-semibold text-slate-900 mb-3">
        {titulo}
        {contador != null && <span className="text-slate-400 font-normal"> ({contador})</span>}
      </h2>
      {children}
    </Card>
  )
}

function Campo({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{rotulo}</p>
      <p className="text-slate-700 mt-0.5">{valor}</p>
    </div>
  )
}

function CampoLargo({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="sm:col-span-2">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{rotulo}</p>
      <p className="text-slate-700 mt-0.5 whitespace-pre-wrap">{valor}</p>
    </div>
  )
}

function Vazio({ texto }: { texto: string }) {
  return <p className="text-sm text-slate-400 py-3">{texto}</p>
}
