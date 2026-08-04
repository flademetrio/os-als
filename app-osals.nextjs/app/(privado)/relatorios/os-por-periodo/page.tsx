import Link from 'next/link'
import { clienteApi } from '@/app/lib/cliente-api'
import type { OsPorPeriodoItem } from '@/app/lib/definicoes'
import { Card } from '@/components/ui/Card'
import { BotaoExportarExcel } from './botao-exportar'
import { FiltrosOsPorPeriodo } from './filtros'

const FUSO = 'America/Sao_Paulo'
const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

type Props = {
  searchParams: Promise<{ inicio?: string; fim?: string }>
}

function iso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Dia da semana abreviado (Seg, Ter...) de uma data ISO YYYY-MM-DD (sem fuso). */
function diaSemana(dataIso: string): string {
  const [a, m, d] = dataIso.split('-').map(Number)
  return DIAS[new Date(a, m - 1, d).getDay()] ?? ''
}

function formatarData(dataIso: string): string {
  const [a, m, d] = dataIso.split('-')
  return d && m && a ? `${d}/${m}/${a}` : dataIso
}

/** Hora (HH:mm) de um instante ISO, no fuso de Brasília. */
function horaBR(isoStr: string | null): string | null {
  if (!isoStr) return null
  const dt = new Date(isoStr)
  if (Number.isNaN(dt.getTime())) return null
  return dt.toLocaleTimeString('pt-BR', { timeZone: FUSO, hour: '2-digit', minute: '2-digit' })
}

/** Execução: horário trabalhado quando digitada; senão o status da OS. */
function execucao(l: OsPorPeriodoItem): string {
  const i = horaBR(l.horaInicioExecucao)
  const f = horaBR(l.horaFimExecucao)
  if (i && f) return `${i}–${f}`
  return l.statusRotulo
}

export default async function RelatorioOsPorPeriodoPage({ searchParams }: Props) {
  const p = await searchParams

  const hoje = new Date()
  const primeiroDoMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
  const inicio = p.inicio ?? iso(primeiroDoMes)
  const fim = p.fim ?? iso(hoje)

  const dados = await clienteApi<OsPorPeriodoItem[]>(
    `/relatorios/os-por-periodo?inicio=${inicio}&fim=${fim}`,
  )

  return (
    <div className="max-w-[90rem] mx-auto space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/relatorios" className="text-sm text-slate-500 hover:text-slate-700">
            ← Voltar para relatorios
          </Link>
          <h1 className="text-2xl font-semibold text-slate-900 mt-2">OS por periodo</h1>
          <p className="text-sm text-slate-500 mt-1">
            {dados.length} {dados.length === 1 ? 'ordem de servico' : 'ordens de servico'} agendada(s)
            no periodo (por data agendada).
          </p>
        </div>
        <BotaoExportarExcel linhas={dados} inicio={inicio} fim={fim} />
      </div>

      <Card padding="md">
        <FiltrosOsPorPeriodo inicio={inicio} fim={fim} />
      </Card>

      <Card padding="none">
        {dados.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-slate-500">Nenhuma OS agendada no periodo selecionado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-3 py-3 text-left whitespace-nowrap">Data</th>
                  <th className="px-3 py-3 text-left whitespace-nowrap">Cod</th>
                  <th className="px-3 py-3 text-left whitespace-nowrap">Cliente</th>
                  <th className="px-3 py-3 text-left whitespace-nowrap">Servico</th>
                  <th className="px-3 py-3 text-left whitespace-nowrap">Atividade</th>
                  <th className="px-3 py-3 text-left whitespace-nowrap">Tecnicos</th>
                  <th className="px-3 py-3 text-left whitespace-nowrap">Veiculos</th>
                  <th className="px-3 py-3 text-left whitespace-nowrap">Execucao</th>
                </tr>
              </thead>
              <tbody>
                {dados.map((l) => (
                  <tr
                    key={l.osId}
                    className="border-b border-slate-100 align-top hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span className="font-medium text-slate-700">{diaSemana(l.data)}</span>{' '}
                      <span className="text-slate-500">{formatarData(l.data)}</span>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <Link
                        href={`/ordens-servico/${l.osId}`}
                        className="text-primary hover:underline font-medium font-mono"
                      >
                        {l.codigoExibicao}
                      </Link>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-slate-700">{l.clienteNome}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-slate-600">{l.servicoDescricao}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-slate-600">{l.atividade}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-slate-600">{l.tecnicos || '—'}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-slate-600">{l.veiculos || '—'}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-slate-600">{execucao(l)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
