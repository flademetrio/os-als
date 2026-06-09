import Link from 'next/link'
import { clienteApi } from '@/app/lib/cliente-api'
import type { ClienteResumoDto, PaginaResposta } from '@/app/lib/definicoes'
import { lerSessao } from '@/app/lib/sessao'
import { temPermissao } from '@/app/lib/permissoes'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { BotaoNovoCliente } from './botao-novo-cliente'
import { FiltrosClientes } from './filtros'
import { LinkPaginacao } from './link-paginacao'

type Props = {
  searchParams: Promise<{
    busca?: string
    pagina?: string
    apenasAtivos?: string
  }>
}

export default async function ClientesPage({ searchParams }: Props) {
  const params = await searchParams
  const busca = params.busca ?? ''
  const pagina = Number(params.pagina ?? '0')
  const apenasAtivos = params.apenasAtivos !== 'false'

  const url = new URL('http://placeholder/clientes')
  if (busca) url.searchParams.set('busca', busca)
  url.searchParams.set('pagina', String(pagina))
  url.searchParams.set('tamanho', '20')
  url.searchParams.set('apenasAtivos', String(apenasAtivos))

  const [dados, sessao] = await Promise.all([
    clienteApi<PaginaResposta<ClienteResumoDto>>(`/clientes?${url.searchParams.toString()}`),
    lerSessao(),
  ])
  const podeGerenciar = temPermissao(sessao, 'CLIENTE_GERENCIAR')

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Clientes</h1>
          <p className="text-sm text-slate-500 mt-1">
            {dados.totalElementos} {dados.totalElementos === 1 ? 'cliente' : 'clientes'}
            {apenasAtivos ? ' ativos' : ' no total'}
          </p>
        </div>
        {podeGerenciar && <BotaoNovoCliente />}
      </div>

      <Card padding="md">
        <FiltrosClientes busca={busca} apenasAtivos={apenasAtivos} />
      </Card>

      <Card padding="none">
        {dados.conteudo.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-slate-500">Nenhum cliente encontrado.</p>
            {busca && (
              <p className="text-xs text-slate-400 mt-2">
                Tente outra busca ou desmarque &ldquo;Apenas ativos&rdquo;.
              </p>
            )}
            {!busca && podeGerenciar && (
              <div className="mt-4">
                <BotaoNovoCliente rotulo="Cadastrar o primeiro cliente" size="sm" />
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Documento
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {dados.conteudo.map((c) => (
                  <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/clientes/${c.id}`} className="text-primary hover:underline font-medium">
                        {c.nome}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{c.tipoPessoa}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-700">
                      {formatarDocumento(c.documento, c.tipoPessoa)}
                    </td>
                    <td className="px-4 py-3">
                      {c.ativo ? (
                        <Badge variant="success" dot size="sm">
                          Ativo
                        </Badge>
                      ) : (
                        <Badge variant="default" dot size="sm">
                          Inativo
                        </Badge>
                      )}
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
              <LinkPaginacao
                pagina={dados.pagina - 1}
                desabilitado={dados.pagina === 0}
                busca={busca}
                apenasAtivos={apenasAtivos}
              >
                Anterior
              </LinkPaginacao>
              <LinkPaginacao
                pagina={dados.pagina + 1}
                desabilitado={dados.pagina >= dados.totalPaginas - 1}
                busca={busca}
                apenasAtivos={apenasAtivos}
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

function formatarDocumento(doc: string, tipo: 'PF' | 'PJ'): string {
  if (tipo === 'PF' && doc.length === 11) {
    return `${doc.slice(0, 3)}.${doc.slice(3, 6)}.${doc.slice(6, 9)}-${doc.slice(9)}`
  }
  if (tipo === 'PJ' && doc.length === 14) {
    return `${doc.slice(0, 2)}.${doc.slice(2, 5)}.${doc.slice(5, 8)}/${doc.slice(8, 12)}-${doc.slice(12)}`
  }
  return doc
}
