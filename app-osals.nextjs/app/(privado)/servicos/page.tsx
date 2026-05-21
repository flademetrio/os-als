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
import { Card } from '@/components/ui/Card'
import { BotaoNovoServico } from './botao-novo-servico'
import { CabecalhoServicos } from './cabecalho-servicos'
import { LinkPaginacao } from './link-paginacao'

/** Situacao do filtro -> lista de status enviada ao backend. */
const STATUS_POR_SITUACAO: Record<string, string[]> = {
  andamento: ['EM_ABERTO', 'EM_EXECUCAO'],
  EM_ABERTO: ['EM_ABERTO'],
  EM_EXECUCAO: ['EM_EXECUCAO'],
  AGUARDANDO: ['AGUARDANDO'],
  CONCLUIDO: ['CONCLUIDO'],
  CANCELADO: ['CANCELADO'],
  todos: [],
}

type Props = {
  searchParams: Promise<{
    busca?: string
    situacao?: string
    inicio?: string
    fim?: string
    pagina?: string
    vista?: string
  }>
}

export default async function ServicosPage({ searchParams }: Props) {
  const p = await searchParams
  const busca = p.busca ?? ''
  const situacao = p.situacao && p.situacao in STATUS_POR_SITUACAO ? p.situacao : 'andamento'
  const inicio = p.inicio ?? ''
  const fim = p.fim ?? ''
  const pagina = Number(p.pagina ?? '0')
  const vista: 'lista' | 'cards' = p.vista === 'lista' ? 'lista' : 'cards'

  const q = new URLSearchParams()
  if (busca) q.set('busca', busca)
  for (const s of STATUS_POR_SITUACAO[situacao]) q.append('status', s)
  if (inicio) q.set('inicio', inicio)
  if (fim) q.set('fim', fim)
  q.set('pagina', String(pagina))
  q.set('tamanho', '20')

  const [dados, clientes, tipos] = await Promise.all([
    clienteApi<PaginaResposta<ServicoResumoDto>>(`/servicos?${q.toString()}`),
    clienteApi<PaginaResposta<ClienteResumoDto>>('/clientes?tamanho=200&apenasAtivos=true'),
    clienteApi<TipoServicoResposta[]>('/tipos-servico?apenasAtivos=true'),
  ])

  const base = { busca, situacao, inicio, fim, vista }
  const vazio = dados.conteudo.length === 0
  const temFiltroAtivo =
    busca !== '' || inicio !== '' || fim !== '' || situacao !== 'andamento'

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <CabecalhoServicos
        total={dados.totalElementos}
        vista={vista}
        busca={busca}
        situacao={situacao}
        inicio={inicio}
        fim={fim}
        temFiltroAtivo={temFiltroAtivo}
        clientes={clientes.conteudo}
        tipos={tipos}
      />

      {vazio ? (
        <Card padding="md">
          <div className="p-6 text-center">
            <p className="text-slate-500 mb-4">Nenhum servico encontrado.</p>
            <BotaoNovoServico
              clientes={clientes.conteudo}
              tipos={tipos}
              rotulo="Cadastrar o primeiro servico"
              size="sm"
            />
          </div>
        </Card>
      ) : vista === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {dados.conteudo.map((s) => (
            <Link key={s.id} href={`/servicos/${s.id}`} className="block">
              <Card padding="md" hover>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-semibold text-primary">
                    {s.numeroFormatado}
                  </span>
                  <Badge variant={badgeStatusServico(s.status)} dot size="sm">
                    {s.statusRotulo}
                  </Badge>
                </div>
                <p className="text-sm font-medium text-slate-800 mt-2">{s.clienteNome}</p>
                <p className="text-xs text-slate-500">{s.tipoServicoNome}</p>
                <p className="text-sm text-slate-600 mt-2 line-clamp-2">{s.descricao}</p>
                <p className="text-xs text-slate-400 mt-3">
                  Inicio previsto: {formatarData(s.dataInicioPrevista)}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card padding="none">
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
        </Card>
      )}

      {dados.totalPaginas > 1 && (
        <div className="flex items-center justify-between text-sm">
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
    </div>
  )
}

function formatarData(iso: string | null): string {
  if (!iso) return '-'
  const [ano, mes, dia] = iso.split('-')
  return dia && mes && ano ? `${dia}/${mes}/${ano}` : iso
}
