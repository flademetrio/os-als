import Link from 'next/link'
import { lerSessao } from '@/app/lib/sessao'
import { clienteApi } from '@/app/lib/cliente-api'
import type { TecnicoResposta } from '@/app/lib/definicoes'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { FormularioEdicaoTecnico } from './formulario-edicao-tecnico'
import { AcoesCabecalhoTecnico } from './acoes-cabecalho-tecnico'

type Props = { params: Promise<{ id: string }> }

export default async function TecnicoDetalhePage({ params }: Props) {
  const { id } = await params
  const [tecnico, sessao] = await Promise.all([
    clienteApi<TecnicoResposta>(`/tecnicos/${id}`),
    lerSessao(),
  ])
  const podeMexer = sessao?.papel === 'ADMIN' || sessao?.papel === 'GERENTE'

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/tecnicos" className="text-sm text-slate-500 hover:text-slate-700">
        ← Voltar para tecnicos
      </Link>

      <Card padding="md">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-semibold text-slate-900">{tecnico.nome}</h1>
              <Badge variant={tecnico.ativo ? 'success' : 'default'} dot>
                {tecnico.ativo ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
            <p className="text-sm text-slate-500">{tecnico.email}</p>
            {tecnico.especialidade && (
              <p className="text-xs text-slate-400 mt-1">{tecnico.especialidade}</p>
            )}
          </div>
          {podeMexer && <AcoesCabecalhoTecnico tecnico={tecnico} />}
        </div>
      </Card>

      <Card padding="md" title="Dados do tecnico">
        <FormularioEdicaoTecnico tecnico={tecnico} podeEditar={podeMexer} />
      </Card>
    </div>
  )
}
