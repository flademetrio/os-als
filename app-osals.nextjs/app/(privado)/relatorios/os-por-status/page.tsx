import Link from 'next/link'
import { clienteApi } from '@/app/lib/cliente-api'
import type {
  ClienteResumoDto,
  OsPorStatusRelatorio,
  PaginaResposta,
  TecnicoResumoDto,
} from '@/app/lib/definicoes'
import { badgeStatusOs } from '@/app/lib/esquemas/ordem-servico'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { FiltrosOsPorStatus } from './filtros'

type Props = {
  searchParams: Promise<{
    inicio?: string
    fim?: string
    clienteId?: string
    tecnicoId?: string
    pagina?: string
  }>
}

export default async function RelatorioOsPorStatusPage({ searchParams }: Props) {
  const p = await searchParams
  const inicio = p.inicio ?? ''
  const fim = p.fim ?? ''
  const clienteId = p.clienteId ?? ''
  const tecnicoId = p.tecnicoId ?? ''
  const pagina = Number(p.pagina ?? '0')

  const q = new URLSearchParams()
  if (inicio) q.set('inicio', inicio)
  if (fim) q.set('fim', fim)
  if (clienteId) q.set('clienteId', clienteId)
  if (tecnicoId) q.set('tecnicoId', tecnicoId)
  q.set('pagina', String(pagina))
  q.set('tamanho', '20')

  const [relatorio, clientes, tecnicos] = await Promise.all([
    clienteApi<OsPorStatusRelatorio>(`/relatorios/os-por-status?${q.toString()}`),
    clienteApi<PaginaResposta<ClienteResumoDto>>('/clientes?tamanho=200&apenasAtivos=true'),
    clienteApi<PaginaResposta<TecnicoResumoDto>>('/tecnicos?apenasAtivos=true&tamanho=200'),
  ])

  const base = { inicio, fim, clienteId, tecnicoId }
  const { itens } = relatorio

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <Link href="/relatorios" className="text-sm text-slate-500 hover:text-slate-700">
          ← Voltar para relatorios
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900 mt-2">OS por status</h1>
      </div>

      <Card padding="md">
        <FiltrosOsPorStatus
          inicio={inicio}
          fim={fim}
          clienteId={clienteId}
          tecnicoId={tecnicoId}
          clientes={clientes.conteudo}
          tecnicos={tecnicos.conteudo}
        />
      </Card>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {relatorio.contagemPorStatus.map((c) => (
          <div key={c.status} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs text-slate-500">{c.statusRotulo}</p>
            <p className="text-2xl font-semibold text-slate-900 mt-0.5">{c.quantidade}</p>
          </div>
        ))}
      </div>

      <Card padding="none">
        {itens.conteudo.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-slate-500">Nenhuma OS no periodo/filtro selecionado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Codigo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tecnicos</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Abertura</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {itens.conteudo.map((os) => (
                  <tr key={os.osId} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/ordens-servico/${os.osId}`}
                        className="text-primary hover:underline font-medium font-mono"
                      >
                        {os.codigoExibicao}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{os.clienteNome}</td>
                    <td className="px-4 py-3 text-slate-600">{os.tecnicos || '-'}</td>
                    <td className="px-4 py-3 text-slate-600">{formatarData(os.dataAbertura)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={badgeStatusOs(os.status)} dot size="sm">
                        {os.statusRotulo}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {itens.totalPaginas > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm">
            <span className="text-slate-500">
              Pagina <span className="font-medium text-slate-900">{itens.pagina + 1}</span> de{' '}
              <span className="font-medium text-slate-900">{itens.totalPaginas}</span>
            </span>
            <div className="flex gap-2">
              <LinkPagina pagina={itens.pagina - 1} desabilitado={itens.pagina === 0} base={base}>
                Anterior
              </LinkPagina>
              <LinkPagina
                pagina={itens.pagina + 1}
                desabilitado={itens.pagina >= itens.totalPaginas - 1}
                base={base}
              >
                Proxima
              </LinkPagina>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

function LinkPagina({
  pagina,
  desabilitado,
  base,
  children,
}: {
  pagina: number
  desabilitado: boolean
  base: Record<string, string>
  children: React.ReactNode
}) {
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(base)) if (v) params.set(k, v)
  params.set('pagina', String(pagina))
  const classe = [
    'inline-flex items-center justify-center px-3 py-1.5 text-sm rounded-lg border transition-colors',
    desabilitado
      ? 'border-slate-200 text-slate-400 cursor-not-allowed'
      : 'border-primary text-primary hover:bg-primary-light',
  ].join(' ')
  if (desabilitado) return <span className={classe}>{children}</span>
  return (
    <Link href={`/relatorios/os-por-status?${params.toString()}`} className={classe}>
      {children}
    </Link>
  )
}

function formatarData(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('pt-BR')
}
