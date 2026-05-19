import Link from 'next/link'
import { clienteApi } from '@/app/lib/cliente-api'
import type { UnidadeMedidaResposta } from '@/app/lib/definicoes'
import { Card } from '@/components/ui/Card'
import { ListaUnidadesMedida } from './lista-unidades-medida'

export default async function UnidadesMedidaPage() {
  const unidades = await clienteApi<UnidadeMedidaResposta[]>('/unidades-medida')

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/configuracoes"
        className="text-sm text-slate-500 hover:text-slate-700"
      >
        ← Voltar para configuracoes
      </Link>

      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Unidades de medida</h1>
        <p className="text-sm text-slate-500 mt-1">
          Catalogo de unidades (un, kg, m, l, ...) usadas no cadastro de pecas.
        </p>
      </div>

      <Card padding="md">
        <ListaUnidadesMedida unidades={unidades} />
      </Card>
    </div>
  )
}
