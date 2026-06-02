import Link from 'next/link'
import { clienteApi } from '@/app/lib/cliente-api'
import type { TipoServicoResposta } from '@/app/lib/definicoes'
import { Card } from '@/components/ui/Card'
import { CabecalhoTiposServico } from './cabecalho-tipos-servico'
import { ListaTiposServico } from './lista-tipos-servico'

export default async function TiposServicoPage() {
  const tipos = await clienteApi<TipoServicoResposta[]>('/tipos-servico?apenasAtivos=false')

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/configuracoes"
        className="text-sm text-slate-500 hover:text-slate-700"
      >
        ← Voltar para configuracoes
      </Link>

      <CabecalhoTiposServico />

      <Card padding="md">
        <ListaTiposServico tipos={tipos} />
      </Card>
    </div>
  )
}
