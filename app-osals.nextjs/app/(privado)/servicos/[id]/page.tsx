import Link from 'next/link'
import { clienteApi } from '@/app/lib/cliente-api'
import type { ServicoResposta, TipoServicoResposta } from '@/app/lib/definicoes'
import { badgeStatusServico } from '@/app/lib/esquemas/servico'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { AcoesCabecalhoServico } from './acoes-cabecalho-servico'
import { DetalheServico } from './detalhe-servico'

type Props = { params: Promise<{ id: string }> }

export default async function ServicoDetalhePage({ params }: Props) {
  const { id } = await params
  const [servico, tipos] = await Promise.all([
    clienteApi<ServicoResposta>(`/servicos/${id}`),
    clienteApi<TipoServicoResposta[]>('/tipos-servico?apenasAtivos=true'),
  ])

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/servicos" className="text-sm text-slate-500 hover:text-slate-700">
        ← Voltar para servicos
      </Link>

      <Card padding="md">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="text-2xl font-semibold text-slate-900 font-mono">
                Servico {servico.numeroFormatado}
              </h1>
              <Badge variant={badgeStatusServico(servico.status)} dot>
                {servico.statusRotulo}
              </Badge>
              <Badge variant="info" size="sm">
                {servico.tipoServicoNome}
              </Badge>
            </div>
            <p className="text-sm text-slate-500">
              <Link
                href={`/clientes/${servico.clienteId}`}
                className="text-primary hover:underline"
              >
                {servico.clienteNome}
              </Link>
            </p>
            {servico.finalizadoEm && (
              <p className="text-xs text-slate-400 mt-1">
                Encerrado em {formatarDataHora(servico.finalizadoEm)}
                {servico.finalizadoPorNome ? ` por ${servico.finalizadoPorNome}` : ''}
              </p>
            )}
          </div>
          <AcoesCabecalhoServico servico={servico} />
        </div>
      </Card>

      <DetalheServico servico={servico} tipos={tipos} />
    </div>
  )
}

function formatarDataHora(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}
