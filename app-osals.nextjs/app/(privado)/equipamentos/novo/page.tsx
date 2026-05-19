import Link from 'next/link'
import { clienteApi } from '@/app/lib/cliente-api'
import type { ClienteResumoDto, PaginaResposta } from '@/app/lib/definicoes'
import { Card } from '@/components/ui/Card'
import { FormularioNovoEquipamento } from './formulario-novo-equipamento'

export default async function NovoEquipamentoPage() {
  // Pega ate 200 clientes ativos pra popular o select inicial
  const clientes = await clienteApi<PaginaResposta<ClienteResumoDto>>(
    '/clientes?tamanho=200&apenasAtivos=true',
  )

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/equipamentos" className="text-sm text-slate-500 hover:text-slate-700">
          ← Voltar para equipamentos
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900 mt-2">Novo equipamento</h1>
      </div>

      <Card padding="md">
        <FormularioNovoEquipamento clientes={clientes.conteudo} />
      </Card>
    </div>
  )
}
