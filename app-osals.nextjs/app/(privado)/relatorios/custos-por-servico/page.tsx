import Link from 'next/link'
import { clienteApi } from '@/app/lib/cliente-api'
import type {
  ClienteResumoDto,
  CustosPorServicoItem,
  PaginaResposta,
  TipoServicoResposta,
} from '@/app/lib/definicoes'
import { centavosParaReais } from '@/app/lib/moeda'
import { Card } from '@/components/ui/Card'
import { FiltrosCustosPorServico } from './filtros'

type Props = {
  searchParams: Promise<{
    inicio?: string
    fim?: string
    clienteId?: string
    tipoServicoId?: string
    status?: string
    pagina?: string
  }>
}

export default async function RelatorioCustosPorServicoPage({ searchParams }: Props) {
  const p = await searchParams
  const inicio = p.inicio ?? ''
  const fim = p.fim ?? ''
  const clienteId = p.clienteId ?? ''
  const tipoServicoId = p.tipoServicoId ?? ''
  const status = p.status ?? ''
  const pagina = Number(p.pagina ?? '0')

  const q = new URLSearchParams()
  if (inicio) q.set('inicio', inicio)
  if (fim) q.set('fim', fim)
  if (clienteId) q.set('clienteId', clienteId)
  if (tipoServicoId) q.set('tipoServicoId', tipoServicoId)
  if (status) q.set('status', status)
  q.set('pagina', String(pagina))
  q.set('tamanho', '20')

  const [dados, clientes, tipos] = await Promise.all([
    clienteApi<PaginaResposta<CustosPorServicoItem>>(
      `/relatorios/custos-por-servico?${q.toString()}`,
    ),
    clienteApi<PaginaResposta<ClienteResumoDto>>('/clientes?tamanho=200&apenasAtivos=true'),
    clienteApi<TipoServicoResposta[]>('/tipos-servico?apenasAtivos=true'),
  ])

  const base = { inicio, fim, clienteId, tipoServicoId, status }
  const totais = somar(dados.conteudo)

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <Link href="/relatorios" className="text-sm text-slate-500 hover:text-slate-700">
          ← Voltar para relatorios
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900 mt-2">Custos por servico</h1>
      </div>

      <Card padding="md">
        <FiltrosCustosPorServico
          inicio={inicio}
          fim={fim}
          clienteId={clienteId}
          tipoServicoId={tipoServicoId}
          status={status}
          clientes={clientes.conteudo}
          tipos={tipos}
        />
      </Card>

      <Card padding="none">
        {dados.conteudo.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-slate-500">Nenhum servico no periodo/filtro selecionado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-3 py-3 text-left">Servico</th>
                  <th className="px-3 py-3 text-left">Cliente</th>
                  <th className="px-3 py-3 text-right">Mao de obra</th>
                  <th className="px-3 py-3 text-right">Deslocamento</th>
                  <th className="px-3 py-3 text-right">Pecas</th>
                  <th className="px-3 py-3 text-right">Terceiros</th>
                  <th className="px-3 py-3 text-right">Hospedagem</th>
                  <th className="px-3 py-3 text-right">Custo total</th>
                  <th className="px-3 py-3 text-right">Preco venda</th>
                </tr>
              </thead>
              <tbody>
                {dados.conteudo.map((s) => (
                  <tr key={s.servicoId} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-2.5">
                      <Link
                        href={`/servicos/${s.servicoId}`}
                        className="text-primary hover:underline font-medium font-mono"
                      >
                        {s.numeroFormatado}
                      </Link>
                    </td>
                    <td className="px-3 py-2.5 text-slate-700">{s.clienteNome}</td>
                    <td className="px-3 py-2.5 text-right text-slate-600">{centavosParaReais(s.maoObraCentavos)}</td>
                    <td className="px-3 py-2.5 text-right text-slate-600">{centavosParaReais(s.deslocamentoCentavos)}</td>
                    <td className="px-3 py-2.5 text-right text-slate-600">{centavosParaReais(s.pecasCentavos)}</td>
                    <td className="px-3 py-2.5 text-right text-slate-600">{centavosParaReais(s.terceirosCentavos)}</td>
                    <td className="px-3 py-2.5 text-right text-slate-600">{centavosParaReais(s.hospedagemCentavos)}</td>
                    <td className="px-3 py-2.5 text-right font-medium text-slate-900">{centavosParaReais(s.custoTotalCentavos)}</td>
                    <td className="px-3 py-2.5 text-right font-medium text-primary-dark">{centavosParaReais(s.precoVendaCentavos)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-300 bg-slate-50 font-semibold text-slate-900">
                  <td className="px-3 py-2.5" colSpan={2}>Total da pagina</td>
                  <td className="px-3 py-2.5 text-right">{centavosParaReais(totais.maoObra)}</td>
                  <td className="px-3 py-2.5 text-right">{centavosParaReais(totais.deslocamento)}</td>
                  <td className="px-3 py-2.5 text-right">{centavosParaReais(totais.pecas)}</td>
                  <td className="px-3 py-2.5 text-right">{centavosParaReais(totais.terceiros)}</td>
                  <td className="px-3 py-2.5 text-right">{centavosParaReais(totais.hospedagem)}</td>
                  <td className="px-3 py-2.5 text-right">{centavosParaReais(totais.custoTotal)}</td>
                  <td className="px-3 py-2.5 text-right text-primary-dark">{centavosParaReais(totais.precoVenda)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {dados.totalPaginas > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm">
            <span className="text-slate-500">
              Pagina <span className="font-medium text-slate-900">{dados.pagina + 1}</span> de{' '}
              <span className="font-medium text-slate-900">{dados.totalPaginas}</span>
            </span>
            <div className="flex gap-2">
              <LinkPagina pagina={dados.pagina - 1} desabilitado={dados.pagina === 0} base={base}>
                Anterior
              </LinkPagina>
              <LinkPagina
                pagina={dados.pagina + 1}
                desabilitado={dados.pagina >= dados.totalPaginas - 1}
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

function somar(itens: CustosPorServicoItem[]) {
  return itens.reduce(
    (acc, s) => ({
      maoObra: acc.maoObra + s.maoObraCentavos,
      deslocamento: acc.deslocamento + s.deslocamentoCentavos,
      pecas: acc.pecas + s.pecasCentavos,
      terceiros: acc.terceiros + s.terceirosCentavos,
      hospedagem: acc.hospedagem + s.hospedagemCentavos,
      custoTotal: acc.custoTotal + s.custoTotalCentavos,
      precoVenda: acc.precoVenda + s.precoVendaCentavos,
    }),
    { maoObra: 0, deslocamento: 0, pecas: 0, terceiros: 0, hospedagem: 0, custoTotal: 0, precoVenda: 0 },
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
    <Link href={`/relatorios/custos-por-servico?${params.toString()}`} className={classe}>
      {children}
    </Link>
  )
}
