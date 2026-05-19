import { lerSessao } from '@/app/lib/sessao'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'

export default async function DashboardPage() {
  const sessao = await lerSessao()

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Bem-vindo, {sessao?.nome}. Front-2 do shell esta funcionando.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="OS abertas" subtitle="Aguardando execucao">
          <p className="text-3xl font-semibold text-primary">—</p>
          <p className="text-xs text-slate-400 mt-1">A implementar (Fase 5)</p>
        </Card>
        <Card title="OS pendentes de digitacao" subtitle="Papel preenchido, falta lancar">
          <p className="text-3xl font-semibold text-amber-600">—</p>
          <p className="text-xs text-slate-400 mt-1">A implementar (Fase 5)</p>
        </Card>
        <Card title="Servicos em execucao" subtitle="No mes corrente">
          <p className="text-3xl font-semibold text-secondary">—</p>
          <p className="text-xs text-slate-400 mt-1">A implementar (Fase 4)</p>
        </Card>
      </div>

      <Card title="Sessao atual" subtitle="Dados decodificados do JWT (Camada 2 verificada)">
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <dt className="text-slate-500">Nome</dt>
            <dd className="text-slate-900 font-medium">{sessao?.nome}</dd>
          </div>
          <div>
            <dt className="text-slate-500">E-mail</dt>
            <dd className="text-slate-900 font-medium">{sessao?.email}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Papel</dt>
            <dd>
              <Badge variant={badgeDoPapel(sessao?.papel)} dot>
                {sessao?.papel}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">ID</dt>
            <dd className="text-slate-900 font-medium">{sessao?.id}</dd>
          </div>
        </dl>
      </Card>

      <Card>
        <p className="text-xs text-slate-400">
          KPIs e graficos serao implementados na Fase 10 do front (Dashboard +
          polimento). Proximas fases: cadastros (Fase 3), Servicos (Fase 5),
          Ordens de Servico (Fase 6) e Custos (Fase 7).
        </p>
      </Card>
    </div>
  )
}

function badgeDoPapel(papel?: string) {
  switch (papel) {
    case 'ADMIN':
      return 'purple' as const
    case 'GERENTE':
      return 'primary' as const
    case 'TECNICO':
      return 'info' as const
    default:
      return 'default' as const
  }
}
