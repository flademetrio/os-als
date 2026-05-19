import Link from 'next/link'
import { clienteApi } from '@/app/lib/cliente-api'
import type { UnidadeMedidaResposta } from '@/app/lib/definicoes'
import { Card } from '@/components/ui/Card'
import { FormularioPeca } from '../formulario-peca'

export default async function NovaPecaPage() {
  const unidades = await clienteApi<UnidadeMedidaResposta[]>('/unidades-medida')

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/pecas" className="text-sm text-slate-500 hover:text-slate-700">
          ← Voltar para pecas
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900 mt-2">Nova peca</h1>
      </div>
      <Card padding="md">
        <FormularioPeca peca={null} unidadesMedida={unidades} />
      </Card>
    </div>
  )
}
