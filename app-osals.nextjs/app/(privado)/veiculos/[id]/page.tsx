import Link from 'next/link'
import { lerSessao } from '@/app/lib/sessao'
import { clienteApi } from '@/app/lib/cliente-api'
import type { VeiculoResposta } from '@/app/lib/definicoes'
import { STATUS_VEICULO_LABEL } from '@/app/lib/esquemas/equipamento'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { FormularioEdicaoVeiculo } from './formulario-edicao-veiculo'
import { AcoesCabecalhoVeiculo } from './acoes-cabecalho-veiculo'

type Props = { params: Promise<{ id: string }> }

export default async function VeiculoDetalhePage({ params }: Props) {
  const { id } = await params
  const veiculoId = Number(id)
  const [veiculo, sessao] = await Promise.all([
    clienteApi<VeiculoResposta>(`/veiculos/${veiculoId}`),
    lerSessao(),
  ])
  const podeInativar = sessao?.papel === 'ADMIN' || sessao?.papel === 'GERENTE'

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/veiculos" className="text-sm text-slate-500 hover:text-slate-700">
        ← Voltar para veiculos
      </Link>

      <Card padding="md">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-semibold text-slate-900 font-mono">
                {formatarPlaca(veiculo.placa)}
              </h1>
              <Badge variant={veiculo.ativo ? 'success' : 'default'} dot>
                {veiculo.ativo ? 'Ativo' : 'Inativo'}
              </Badge>
              <Badge variant={badgeStatus(veiculo.status)} size="sm">
                {STATUS_VEICULO_LABEL[veiculo.status]}
              </Badge>
            </div>
            <p className="text-sm text-slate-500">
              {[veiculo.marca, veiculo.modelo, veiculo.ano].filter(Boolean).join(' · ') || 'Sem detalhes'}
            </p>
          </div>
          {podeInativar && <AcoesCabecalhoVeiculo veiculo={veiculo} />}
        </div>
      </Card>

      <Card padding="md" title="Dados do veiculo">
        <FormularioEdicaoVeiculo veiculo={veiculo} />
      </Card>
    </div>
  )
}

function formatarPlaca(p: string): string {
  if (/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(p)) return `${p.slice(0, 3)}-${p.slice(3)}`
  return p
}

function badgeStatus(s: string): 'success' | 'warning' | 'default' {
  if (s === 'ATIVO') return 'success'
  if (s === 'MANUTENCAO') return 'warning'
  return 'default'
}
