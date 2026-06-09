import Link from 'next/link'
import { clienteApi } from '@/app/lib/cliente-api'
import type {
  PaginaResposta,
  PecaResposta,
  UnidadeMedidaResposta,
} from '@/app/lib/definicoes'
import { lerSessao } from '@/app/lib/sessao'
import { temPermissao } from '@/app/lib/permissoes'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { BotaoNovaPeca } from './botao-nova-peca'

type Props = { searchParams: Promise<{ busca?: string; pagina?: string; apenasAtivos?: string }> }

export default async function PecasPage({ searchParams }: Props) {
  const params = await searchParams
  const busca = params.busca ?? ''
  const pagina = Number(params.pagina ?? '0')
  const apenasAtivos = params.apenasAtivos !== 'false'

  const q = new URLSearchParams()
  if (busca) q.set('busca', busca)
  q.set('pagina', String(pagina))
  q.set('tamanho', '20')
  q.set('apenasAtivos', String(apenasAtivos))

  const [dados, unidadesMedida, sessao] = await Promise.all([
    clienteApi<PaginaResposta<PecaResposta>>(`/pecas?${q.toString()}`),
    clienteApi<UnidadeMedidaResposta[]>('/unidades-medida'),
    lerSessao(),
  ])
  const podeGerenciar = temPermissao(sessao, 'PECA_GERENCIAR')

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Pecas e materiais</h1>
          <p className="text-sm text-slate-500 mt-1">
            {dados.totalElementos} {dados.totalElementos === 1 ? 'item' : 'itens'} no catalogo
            {apenasAtivos ? ' (apenas ativos)' : ''}
          </p>
        </div>
        {podeGerenciar && <BotaoNovaPeca unidadesMedida={unidadesMedida} />}
      </div>

      <Card padding="none">
        {dados.conteudo.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-slate-500 mb-4">Nenhuma peca cadastrada.</p>
            {podeGerenciar && (
              <BotaoNovaPeca
                unidadesMedida={unidadesMedida}
                rotulo="Cadastrar primeira peca"
                size="sm"
              />
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nome</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Descricao</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Unidade</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {dados.conteudo.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/pecas/${p.id}`} className="text-primary hover:underline font-medium">
                        {p.nome}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-md truncate">{p.descricao ?? '-'}</td>
                    <td className="px-4 py-3 text-slate-700 font-mono text-xs">{p.unidadeMedidaSigla ?? '-'}</td>
                    <td className="px-4 py-3">
                      <Badge variant={p.ativo ? 'success' : 'default'} dot size="sm">
                        {p.ativo ? 'Ativa' : 'Inativa'}
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
