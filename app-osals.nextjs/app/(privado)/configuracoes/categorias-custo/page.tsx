import Link from 'next/link'
import { clienteApi } from '@/app/lib/cliente-api'
import type { CategoriaCustoResposta } from '@/app/lib/definicoes'
import { Card } from '@/components/ui/Card'
import { CabecalhoCategoriasCusto } from './cabecalho-categorias-custo'
import { ListaCategoriasCusto } from './lista-categorias-custo'

export default async function CategoriasCustoPage() {
  const categorias = await clienteApi<CategoriaCustoResposta[]>('/categorias-custo?apenasAtivos=false')

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/configuracoes"
        className="text-sm text-slate-500 hover:text-slate-700"
      >
        ← Voltar para configuracoes
      </Link>

      <CabecalhoCategoriasCusto />

      <Card padding="md">
        <ListaCategoriasCusto categorias={categorias} />
      </Card>
    </div>
  )
}
