import Link from 'next/link'
import { lerSessao } from '@/app/lib/sessao'
import { temPermissao } from '@/app/lib/permissoes'
import { clienteApi } from '@/app/lib/cliente-api'
import type { ClienteResposta, EquipamentoResposta, UnidadeResposta } from '@/app/lib/definicoes'
import {
  STATUS_EQUIPAMENTO_LABEL,
  TIPOS_EQUIPAMENTO_LABEL,
} from '@/app/lib/esquemas/equipamento'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { FormularioEdicaoEquipamento } from './formulario-edicao-equipamento'
import { AcoesCabecalhoEquipamento } from './acoes-cabecalho-equipamento'

type Props = { params: Promise<{ id: string }> }

export default async function EquipamentoDetalhePage({ params }: Props) {
  const { id } = await params
  const equipamento = await clienteApi<EquipamentoResposta>(`/equipamentos/${id}`)
  const [cliente, unidade, sessao] = await Promise.all([
    clienteApi<ClienteResposta>(`/clientes/${equipamento.clienteId}`),
    clienteApi<UnidadeResposta>(`/unidades/${equipamento.unidadeId}`),
    lerSessao(),
  ])
  const podeGerenciar = temPermissao(sessao, 'EQUIPAMENTO_GERENCIAR')

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/equipamentos" className="text-sm text-slate-500 hover:text-slate-700">
        ← Voltar para equipamentos
      </Link>

      <Card padding="md">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="text-2xl font-semibold text-slate-900">
                {[equipamento.marca, equipamento.modelo].filter(Boolean).join(' ') || `Equipamento #${equipamento.id}`}
              </h1>
              <Badge variant={equipamento.ativo ? 'success' : 'default'} dot>
                {equipamento.ativo ? 'Ativo' : 'Inativo'}
              </Badge>
              <Badge variant={badgeStatus(equipamento.status)} size="sm">
                {STATUS_EQUIPAMENTO_LABEL[equipamento.status]}
              </Badge>
              <Badge variant="info" size="sm">
                {TIPOS_EQUIPAMENTO_LABEL[equipamento.tipo]}
              </Badge>
            </div>
            <p className="text-sm text-slate-500">
              <Link href={`/clientes/${cliente.id}`} className="text-primary hover:underline">
                {cliente.nome}
              </Link>{' '}
              · {unidade.identificacaoInterna}
            </p>
            {equipamento.localizacaoInterna && (
              <p className="text-xs text-slate-400 mt-1">📍 {equipamento.localizacaoInterna}</p>
            )}
          </div>
          {podeGerenciar && <AcoesCabecalhoEquipamento equipamento={equipamento} />}
        </div>
      </Card>

      <Card padding="md" title="Dados do equipamento">
        <FormularioEdicaoEquipamento equipamento={equipamento} podeEditar={podeGerenciar} />
      </Card>
    </div>
  )
}

function badgeStatus(s: string): 'success' | 'warning' | 'default' {
  if (s === 'ATIVO') return 'success'
  if (s === 'EM_MANUTENCAO') return 'warning'
  return 'default'
}
