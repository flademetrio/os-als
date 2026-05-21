import Link from 'next/link'
import { clienteApi } from '@/app/lib/cliente-api'
import type { CustosPorClienteItem } from '@/app/lib/definicoes'
import { centavosParaReais } from '@/app/lib/moeda'
import { Card } from '@/components/ui/Card'
import { FiltrosCustosPorCliente } from './filtros'

type Props = {
  searchParams: Promise<{ inicio?: string; fim?: string }>
}

export default async function RelatorioCustosPorClientePage({ searchParams }: Props) {
  const p = await searchParams
  const inicio = p.inicio ?? ''
  const fim = p.fim ?? ''

  const q = new URLSearchParams()
  if (inicio) q.set('inicio', inicio)
  if (fim) q.set('fim', fim)

  const itens = await clienteApi<CustosPorClienteItem[]>(
    `/relatorios/custos-por-cliente?${q.toString()}`,
  )

  const totalCusto = itens.reduce((s, c) => s + c.custoTotalCentavos, 0)
  const totalVenda = itens.reduce((s, c) => s + c.precoVendaCentavos, 0)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <Link href="/relatorios" className="text-sm text-slate-500 hover:text-slate-700">
          ← Voltar para relatorios
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900 mt-2">Custos por cliente</h1>
      </div>

      <Card padding="md">
        <FiltrosCustosPorCliente inicio={inicio} fim={fim} />
      </Card>

      <Card padding="none">
        {itens.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-slate-500">Nenhum cliente com servicos no periodo.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">Cliente</th>
                  <th className="px-4 py-3 text-right">Servicos</th>
                  <th className="px-4 py-3 text-right">OS</th>
                  <th className="px-4 py-3 text-right">Custo total</th>
                  <th className="px-4 py-3 text-right">Preco de venda</th>
                </tr>
              </thead>
              <tbody>
                {itens.map((c) => (
                  <tr key={c.clienteId} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/clientes/${c.clienteId}`}
                        className="text-primary hover:underline font-medium"
                      >
                        {c.clienteNome}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 text-right text-slate-600">{c.quantidadeServicos}</td>
                    <td className="px-4 py-2.5 text-right text-slate-600">{c.quantidadeOs}</td>
                    <td className="px-4 py-2.5 text-right font-medium text-slate-900">
                      {centavosParaReais(c.custoTotalCentavos)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium text-primary-dark">
                      {centavosParaReais(c.precoVendaCentavos)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-300 bg-slate-50 font-semibold text-slate-900">
                  <td className="px-4 py-2.5" colSpan={3}>Total</td>
                  <td className="px-4 py-2.5 text-right">{centavosParaReais(totalCusto)}</td>
                  <td className="px-4 py-2.5 text-right text-primary-dark">
                    {centavosParaReais(totalVenda)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
