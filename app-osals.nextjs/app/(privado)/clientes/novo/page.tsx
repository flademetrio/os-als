import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { FormularioNovoCliente } from './formulario-novo-cliente'

export default function NovoClientePage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/clientes" className="text-sm text-slate-500 hover:text-slate-700">
          ← Voltar para clientes
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900 mt-2">Novo cliente</h1>
      </div>

      <Card padding="md">
        <FormularioNovoCliente />
      </Card>
    </div>
  )
}
