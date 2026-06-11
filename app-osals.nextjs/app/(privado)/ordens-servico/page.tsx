import Link from 'next/link'
import { clienteApi } from '@/app/lib/cliente-api'
import type { OrdemServicoResumoDto, PaginaResposta } from '@/app/lib/definicoes'
import { badgeStatusOs } from '@/app/lib/esquemas/ordem-servico'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { FiltrosOrdensServico } from './filtros'
import { LinkPaginacao } from './link-paginacao'

type Props = {
  searchParams: Promise<{
    busca?: string
    status?: string
    empresa?: string
    pagina?: string
  }>
}

export default async function OrdensServicoPage({ searchParams }: Props) {
  const p = await searchParams
  const busca = p.busca ?? ''
  const status = p.status ?? ''
  const empresa = p.empresa ?? ''
  const pagina = Number(p.pagina ?? '0')

  const q = new URLSearchParams()
  if (busca) q.set('busca', busca)
  if (status) q.set('status', status)
  if (empresa) q.set('empresa', empresa)
  q.set('pagina', String(pagina))
  q.set('tamanho', '20')

  const dados = await clienteApi<PaginaResposta<OrdemServicoResumoDto>>(
    `/ordens-servico?${q.toString()}`,
  )
  const base = { busca, status, empresa }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Ordens de servico</h1>
        <p className="text-sm text-slate-500 mt-1">
          {dados.totalElementos} {dados.totalElementos === 1 ? 'OS' : 'OS no total'}
        </p>
      </div>

      <Card padding="md">
        <FiltrosOrdensServico busca={busca} status={status} empresa={empresa} />
      </Card>

      <Card padding="none">
        {dados.conteudo.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-slate-500">Nenhuma ordem de servico encontrada.</p>
            <p className="text-xs text-slate-400 mt-2">
              As OS sao abertas dentro de um servico.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Codigo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Empresa</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Atividade</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Abertura</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {dados.conteudo.map((os) => (
                  <tr key={os.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/ordens-servico/${os.id}`}
                        className="text-primary hover:underline font-medium font-mono"
                      >
                        {os.codigoExibicao}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{os.empresa}</td>
                    <td className="px-4 py-3 text-slate-700">{os.clienteNome}</td>
                    <td className="px-4 py-3 text-slate-600">
                      <span className="block truncate max-w-sm">{os.descricaoAtividade}</span>
                    </td>
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

        {dados.totalPaginas > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm">
            <span className="text-slate-500">
              Pagina <span className="font-medium text-slate-900">{dados.pagina + 1}</span> de{' '}
              <span className="font-medium text-slate-900">{dados.totalPaginas}</span>
            </span>
            <div className="flex gap-2">
              <LinkPaginacao pagina={dados.pagina - 1} desabilitado={dados.pagina === 0} base={base}>
                Anterior
              </LinkPaginacao>
              <LinkPaginacao
                pagina={dados.pagina + 1}
                desabilitado={dados.pagina >= dados.totalPaginas - 1}
                base={base}
              >
                Proxima
              </LinkPaginacao>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

function formatarData(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('pt-BR')
}
