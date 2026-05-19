import Link from 'next/link'
import { lerSessao } from '@/app/lib/sessao'
import { clienteApi } from '@/app/lib/cliente-api'
import type { PaginaResposta, TecnicoResumoDto } from '@/app/lib/definicoes'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

type Props = { searchParams: Promise<{ busca?: string; pagina?: string; apenasAtivos?: string }> }

export default async function TecnicosPage({ searchParams }: Props) {
  const params = await searchParams
  const busca = params.busca ?? ''
  const pagina = Number(params.pagina ?? '0')
  const apenasAtivos = params.apenasAtivos !== 'false'

  const q = new URLSearchParams()
  if (busca) q.set('busca', busca)
  q.set('pagina', String(pagina))
  q.set('tamanho', '20')
  q.set('apenasAtivos', String(apenasAtivos))

  const [dados, sessao] = await Promise.all([
    clienteApi<PaginaResposta<TecnicoResumoDto>>(`/tecnicos?${q.toString()}`),
    lerSessao(),
  ])
  const podeCriar = sessao?.papel === 'ADMIN' || sessao?.papel === 'GERENTE'

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Tecnicos</h1>
          <p className="text-sm text-slate-500 mt-1">
            {dados.totalElementos} {dados.totalElementos === 1 ? 'tecnico' : 'tecnicos'}
            {apenasAtivos ? ' ativos' : ' no total'}
          </p>
        </div>
        {podeCriar && (
          <Link href="/tecnicos/novo">
            <Button variant="primary">+ Novo tecnico</Button>
          </Link>
        )}
      </div>

      <Card padding="none">
        {dados.conteudo.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-slate-500">Nenhum tecnico cadastrado.</p>
            {podeCriar && (
              <Link href="/tecnicos/novo" className="inline-block mt-4">
                <Button size="sm">Cadastrar primeiro tecnico</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nome</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Especialidade</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {dados.conteudo.map((t) => (
                  <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/tecnicos/${t.id}`} className="text-primary hover:underline font-medium">
                        {t.nome}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{t.especialidade ?? '-'}</td>
                    <td className="px-4 py-3">
                      <Badge variant={t.ativo ? 'success' : 'default'} dot size="sm">
                        {t.ativo ? 'Ativo' : 'Inativo'}
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
