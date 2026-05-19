import Link from 'next/link'
import { clienteApi } from '@/app/lib/cliente-api'
import type { PaginaResposta, VeiculoResumoDto } from '@/app/lib/definicoes'
import { STATUS_VEICULO_LABEL } from '@/app/lib/esquemas/equipamento'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

type Props = {
  searchParams: Promise<{ busca?: string; pagina?: string; apenasAtivos?: string }>
}

export default async function VeiculosPage({ searchParams }: Props) {
  const params = await searchParams
  const busca = params.busca ?? ''
  const pagina = Number(params.pagina ?? '0')
  const apenasAtivos = params.apenasAtivos !== 'false'

  const q = new URLSearchParams()
  if (busca) q.set('busca', busca)
  q.set('pagina', String(pagina))
  q.set('tamanho', '20')
  q.set('apenasAtivos', String(apenasAtivos))

  const dados = await clienteApi<PaginaResposta<VeiculoResumoDto>>(`/veiculos?${q.toString()}`)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Veiculos</h1>
          <p className="text-sm text-slate-500 mt-1">
            {dados.totalElementos} {dados.totalElementos === 1 ? 'veiculo' : 'veiculos'}
            {apenasAtivos ? ' ativos' : ' no total'}
          </p>
        </div>
        <Link href="/veiculos/novo">
          <Button variant="primary">+ Novo veiculo</Button>
        </Link>
      </div>

      <Card padding="none">
        {dados.conteudo.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-slate-500">Nenhum veiculo encontrado.</p>
            <Link href="/veiculos/novo" className="inline-block mt-4">
              <Button size="sm">Cadastrar o primeiro veiculo</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Placa</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Modelo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {dados.conteudo.map((v) => (
                  <tr key={v.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/veiculos/${v.id}`} className="text-primary hover:underline font-mono font-medium">
                        {formatarPlaca(v.placa)}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{v.modelo ?? '-'}</td>
                    <td className="px-4 py-3">
                      <Badge variant={badgeStatus(v.status)} dot size="sm">
                        {STATUS_VEICULO_LABEL[v.status]}
                      </Badge>
                    </td>
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

function formatarPlaca(p: string): string {
  if (/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(p)) {
    return `${p.slice(0, 3)}-${p.slice(3)}`
  }
  return p
}

function badgeStatus(s: string): 'success' | 'warning' | 'default' {
  if (s === 'ATIVO') return 'success'
  if (s === 'MANUTENCAO') return 'warning'
  return 'default'
}
