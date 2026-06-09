import Link from 'next/link'
import { clienteApi } from '@/app/lib/cliente-api'
import type {
  ClienteResumoDto,
  EquipamentoResumoDto,
  PaginaResposta,
} from '@/app/lib/definicoes'
import {
  STATUS_EQUIPAMENTO_LABEL,
  TIPOS_EQUIPAMENTO_LABEL,
} from '@/app/lib/esquemas/equipamento'
import { lerSessao } from '@/app/lib/sessao'
import { temPermissao } from '@/app/lib/permissoes'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { BotaoNovoEquipamento } from './botao-novo-equipamento'

type Props = {
  searchParams: Promise<{
    busca?: string
    pagina?: string
    apenasAtivos?: string
    tipo?: string
    status?: string
  }>
}

export default async function EquipamentosPage({ searchParams }: Props) {
  const params = await searchParams
  const busca = params.busca ?? ''
  const pagina = Number(params.pagina ?? '0')
  const apenasAtivos = params.apenasAtivos !== 'false'

  const q = new URLSearchParams()
  if (busca) q.set('busca', busca)
  if (params.tipo) q.set('tipo', params.tipo)
  if (params.status) q.set('status', params.status)
  q.set('pagina', String(pagina))
  q.set('tamanho', '20')
  q.set('apenasAtivos', String(apenasAtivos))

  const [dados, clientes, sessao] = await Promise.all([
    clienteApi<PaginaResposta<EquipamentoResumoDto>>(`/equipamentos?${q.toString()}`),
    clienteApi<PaginaResposta<ClienteResumoDto>>('/clientes?tamanho=200&apenasAtivos=true'),
    lerSessao(),
  ])
  const podeGerenciar = temPermissao(sessao, 'EQUIPAMENTO_GERENCIAR')

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Equipamentos</h1>
          <p className="text-sm text-slate-500 mt-1">
            {dados.totalElementos} {dados.totalElementos === 1 ? 'equipamento' : 'equipamentos'}
            {apenasAtivos ? ' ativos' : ' no total'}
          </p>
        </div>
        {podeGerenciar && <BotaoNovoEquipamento clientes={clientes.conteudo} />}
      </div>

      <Card padding="none">
        {dados.conteudo.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-slate-500 mb-4">Nenhum equipamento cadastrado.</p>
            {podeGerenciar && (
              <BotaoNovoEquipamento
                clientes={clientes.conteudo}
                rotulo="Cadastrar primeiro equipamento"
                size="sm"
              />
            )}
            <p className="text-xs text-slate-400 mt-4">
              Equipamentos sao vinculados a uma unidade de um cliente.
              <br />
              Cadastre o cliente e a unidade primeiro em{' '}
              <Link href="/clientes" className="text-primary hover:underline">
                Clientes
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Equipamento</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Cliente / Unidade</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Localizacao</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {dados.conteudo.map((e) => (
                  <tr key={e.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/equipamentos/${e.id}`} className="text-primary hover:underline font-medium">
                        {[e.marca, e.modelo].filter(Boolean).join(' ') || `#${e.id}`}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/clientes/${e.clienteId}`}
                        className="text-slate-700 hover:text-primary hover:underline font-medium"
                      >
                        {e.clienteNome}
                      </Link>
                      <span className="block text-xs text-slate-500">{e.identificacaoUnidade}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{TIPOS_EQUIPAMENTO_LABEL[e.tipo]}</td>
                    <td className="px-4 py-3 text-slate-600">{e.localizacaoInterna ?? '-'}</td>
                    <td className="px-4 py-3">
                      <Badge variant={badgeStatus(e.status)} dot size="sm">
                        {STATUS_EQUIPAMENTO_LABEL[e.status]}
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

function badgeStatus(s: string): 'success' | 'warning' | 'default' {
  if (s === 'ATIVO') return 'success'
  if (s === 'EM_MANUTENCAO') return 'warning'
  return 'default'
}
