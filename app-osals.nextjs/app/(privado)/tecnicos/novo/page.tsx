import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { FormularioNovoTecnico } from './formulario-novo-tecnico'

export default function NovoTecnicoPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/tecnicos" className="text-sm text-slate-500 hover:text-slate-700">
          ← Voltar para tecnicos
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900 mt-2">Novo tecnico</h1>
        <p className="text-sm text-slate-500 mt-1">
          Cria conjuntamente o usuario com papel TECNICO e o cadastro de valor/hora.
        </p>
      </div>
      <Card padding="md">
        <FormularioNovoTecnico />
      </Card>
    </div>
  )
}
