import Link from 'next/link'
import { clienteApi } from '@/app/lib/cliente-api'
import type {
  ClienteResumoDto,
  PaginaResposta,
  TipoServicoResposta,
} from '@/app/lib/definicoes'
import { Card } from '@/components/ui/Card'
import { FormularioNovoServico } from './formulario-novo-servico'

export default async function NovoServicoPage() {
  const [clientes, tipos] = await Promise.all([
    clienteApi<PaginaResposta<ClienteResumoDto>>('/clientes?tamanho=200&apenasAtivos=true'),
    clienteApi<TipoServicoResposta[]>('/tipos-servico?apenasAtivos=true'),
  ])

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/servicos" className="text-sm text-slate-500 hover:text-slate-700">
          ← Voltar para servicos
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900 mt-2">Novo servico</h1>
      </div>

      <Card padding="md">
        <FormularioNovoServico clientes={clientes.conteudo} tipos={tipos} />
      </Card>
    </div>
  )
}
