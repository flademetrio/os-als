import Link from 'next/link'
import { clienteApi } from '@/app/lib/cliente-api'
import type { ClienteResumoDto, PaginaResposta, ServicoResumoDto } from '@/app/lib/definicoes'
import { formatarDataIso } from '@/app/lib/data'
import { badgeStatusServico } from '@/app/lib/esquemas/servico'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { SeletorCliente } from './seletor-cliente'

type Props = {
  searchParams: Promise<{ clienteId?: string }>
}

export default async function RelatorioServicoSelecaoPage({ searchParams }: Props) {
  const p = await searchParams
  const clienteId = p.clienteId ? Number(p.clienteId) : null

  const clientes = await clienteApi<PaginaResposta<ClienteResumoDto>>(
    '/clientes?tamanho=500&apenasAtivos=true',
  )

  let servicos: ServicoResumoDto[] = []
  if (clienteId) {
    const pg = await clienteApi<PaginaResposta<ServicoResumoDto>>(
      `/servicos?clienteId=${clienteId}&tamanho=200`,
    )
    // Por ordem de data (inicio previsto), mais recente primeiro; sem data por ultimo.
    servicos = [...pg.conteudo].sort((a, b) => {
      const da = a.dataInicioPrevista ?? ''
      const db = b.dataInicioPrevista ?? ''
      if (da && db) return db.localeCompare(da)
      if (da) return -1
      if (db) return 1
      return b.numero - a.numero
    })
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link href="/relatorios" className="text-sm text-slate-500 hover:text-slate-700">
          ← Voltar para relatorios
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900 mt-2">Relatório de Serviço</h1>
        <p className="text-sm text-slate-500 mt-1">
          Escolha o cliente e depois clique no servico para abrir o relatorio completo.
        </p>
      </div>

      <Card padding="md">
        <SeletorCliente clientes={clientes.conteudo} clienteId={clienteId} />
      </Card>

      {clienteId && (
        <Card padding="none">
          {servicos.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-slate-500">Este cliente nao tem servicos.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {servicos.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/relatorios/servico/${s.id}`}
                    className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="min-w-0">
                      <span className="font-mono text-sm font-medium text-primary">
                        {s.numeroFormatado}
                      </span>
                      <span className="block text-sm text-slate-600 truncate">{s.descricao}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge variant={badgeStatusServico(s.status)} size="sm" dot>
                        {s.statusRotulo}
                      </Badge>
                      <span className="block text-xs text-slate-400 mt-0.5">
                        {s.dataInicioPrevista ? formatarDataIso(s.dataInicioPrevista) : '—'}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </div>
  )
}
