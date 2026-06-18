import Link from 'next/link'
import { clienteApi } from '@/app/lib/cliente-api'
import type {
  ClienteResumoDto,
  PaginaResposta,
  ServicoAbertoItem,
  TipoServicoResposta,
} from '@/app/lib/definicoes'
import { centavosParaReais } from '@/app/lib/moeda'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { FiltrosServicosAbertos } from './filtros'

type Props = {
  searchParams: Promise<{
    clienteId?: string
    tipoServicoId?: string
  }>
}

export default async function RelatorioServicosAbertosPage({ searchParams }: Props) {
  const p = await searchParams
  const clienteId = p.clienteId ?? ''
  const tipoServicoId = p.tipoServicoId ?? ''

  const q = new URLSearchParams()
  if (clienteId) q.set('clienteId', clienteId)
  if (tipoServicoId) q.set('tipoServicoId', tipoServicoId)

  const [dados, clientes, tipos] = await Promise.all([
    clienteApi<ServicoAbertoItem[]>(`/relatorios/servicos-abertos?${q.toString()}`),
    clienteApi<PaginaResposta<ClienteResumoDto>>('/clientes?tamanho=200&apenasAtivos=true'),
    clienteApi<TipoServicoResposta[]>('/tipos-servico?apenasAtivos=true'),
  ])

  const totalValor = dados.reduce((acc, s) => acc + (s.valorCentavos ?? 0), 0)

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <Link href="/relatorios" className="text-sm text-slate-500 hover:text-slate-700">
          ← Voltar para relatorios
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900 mt-2">Servicos abertos</h1>
        <p className="text-sm text-slate-500 mt-1">
          {dados.length} {dados.length === 1 ? 'servico em andamento' : 'servicos em andamento'}
        </p>
      </div>

      <Card padding="md">
        <FiltrosServicosAbertos
          clienteId={clienteId}
          tipoServicoId={tipoServicoId}
          clientes={clientes.conteudo}
          tipos={tipos}
        />
      </Card>

      <Card padding="none">
        {dados.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-slate-500">Nenhum servico aberto no filtro selecionado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-3 py-3 text-left">No</th>
                  <th className="px-3 py-3 text-left">Cliente</th>
                  <th className="px-3 py-3 text-left">Tipo</th>
                  <th className="px-3 py-3 text-left">Descricao</th>
                  <th className="px-3 py-3 text-center">Cobrado</th>
                  <th className="px-3 py-3 text-right">OS</th>
                  <th className="px-3 py-3 text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {dados.map((s) => (
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
                    <td className="px-3 py-2.5 text-slate-600">{s.tipoServicoNome}</td>
                    <td className="px-3 py-2.5 text-slate-600">
                      <span className="block max-w-sm truncate">{s.descricao}</span>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {s.cobrado ? (
                        <Badge variant="success" size="sm">Sim</Badge>
                      ) : (
                        <Badge variant="default" size="sm">Nao</Badge>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right text-slate-600">{s.numeroOs}</td>
                    <td className="px-3 py-2.5 text-right font-medium text-slate-900">
                      {s.valorCentavos != null ? centavosParaReais(s.valorCentavos) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-300 bg-slate-50 font-semibold text-slate-900">
                  <td className="px-3 py-2.5" colSpan={6}>Total cobrado</td>
                  <td className="px-3 py-2.5 text-right">{centavosParaReais(totalValor)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
