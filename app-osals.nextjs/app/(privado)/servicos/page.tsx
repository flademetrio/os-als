import Link from 'next/link'
import { clienteApi } from '@/app/lib/cliente-api'
import type {
  ClienteResumoDto,
  PaginaResposta,
  ServicoResumoDto,
  TipoServicoResposta,
} from '@/app/lib/definicoes'
import { badgeStatusServico } from '@/app/lib/esquemas/servico'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { FiltrosServicos } from './filtros'
import { LinkPaginacao } from './link-paginacao'

type Props = {
  searchParams: Promise<{
    busca?: string
    status?: string
    clienteId?: string
    tipoServicoId?: string
    inicio?: string
    fim?: string
    pagina?: string
  }>
}

export default async function ServicosPage({ searchParams }: Props) {
  const p = await searchParams
  const busca = p.busca ?? ''
  const status = p.status ?? ''
  const clienteId = p.clienteId ?? ''
  const tipoServicoId = p.tipoServicoId ?? ''
  const inicio = p.inicio ?? ''
  const fim = p.fim ?? ''
  const pagina = Number(p.pagina ?? '0')

  const q = new URLSearchParams()
  if (busca) q.set('busca', busca)
  if (status) q.set('status', status)
  if (clienteId) q.set('clienteId', clienteId)
  if (tipoServicoId) q.set('tipoServicoId', tipoServicoId)
  if (inicio) q.set('inicio', inicio)
  if (fim) q.set('fim', fim)
  q.set('pagina', String(pagina))
  q.set('tamanho', '20')

  const [dados, clientes, tipos] = await Promise.all([
    clienteApi<PaginaResposta<ServicoResumoDto>>(`/servicos?${q.toString()}`),
    clienteApi<PaginaResposta<ClienteResumoDto>>('/clientes?tamanho=200&apenasAtivos=true'),
    clienteApi<TipoServicoResposta[]>('/tipos-servico?apenasAtivos=true'),
  ])

  const base = { busca, status, clienteId, tipoServicoId, inicio, fim }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Servicos</h1>
          <p className="text-sm text-slate-500 mt-1">
            {dados.totalElementos} {dados.totalElementos === 1 ? 'servico' : 'servicos'}
          </p>
        </div>
        <Link href="/servicos/novo">
          <Button variant="primary">+ Novo servico</Button>
        </Link>
      </div>

      <Card padding="md">
        <FiltrosServicos
          busca={busca}
          status={status}
          clienteId={clienteId}
          tipoServicoId={tipoServicoId}
          inicio={inicio}
          fim={fim}
          clientes={clientes.conteudo}
          tipos={tipos}
        />
      </Card>

      <Card padding="none">
        {dados.conteudo.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-slate-500">Nenhum servico encontrado.</p>
            <Link href="/servicos/novo" className="inline-block mt-4">
              <Button size="sm">Cadastrar o primeiro servico</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">No</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Inicio previsto</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {dados.conteudo.map((s) => (
                  <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/servicos/${s.id}`}
                        className="text-primary hover:underline font-medium font-mono"
                      >
                        {s.numeroFormatado}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-slate-700">{s.clienteNome}</span>
                      <span className="block text-xs text-slate-400 truncate max-w-xs">
                        {s.descricao}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{s.tipoServicoNome}</td>
                    <td className="px-4 py-3 text-slate-600">{formatarData(s.dataInicioPrevista)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={badgeStatusServico(s.status)} dot size="sm">
                        {s.statusRotulo}
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

function formatarData(iso: string | null): string {
  if (!iso) return '-'
  const [ano, mes, dia] = iso.split('-')
  return dia && mes && ano ? `${dia}/${mes}/${ano}` : iso
}
