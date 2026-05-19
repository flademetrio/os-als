import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { FormularioNovoVeiculo } from './formulario-novo-veiculo'

export default function NovoVeiculoPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/veiculos" className="text-sm text-slate-500 hover:text-slate-700">
          ← Voltar para veiculos
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900 mt-2">Novo veiculo</h1>
      </div>
      <Card padding="md">
        <FormularioNovoVeiculo />
      </Card>
    </div>
  )
}
