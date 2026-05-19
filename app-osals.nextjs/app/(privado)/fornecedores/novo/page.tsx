import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { FormularioFornecedor } from '../formulario-fornecedor'

export default function NovoFornecedorPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/fornecedores" className="text-sm text-slate-500 hover:text-slate-700">
          ← Voltar para fornecedores
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900 mt-2">Novo fornecedor</h1>
      </div>
      <Card padding="md">
        <FormularioFornecedor fornecedor={null} />
      </Card>
    </div>
  )
}
