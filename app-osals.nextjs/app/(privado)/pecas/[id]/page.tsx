import Link from 'next/link'
import { lerSessao } from '@/app/lib/sessao'
import { temPermissao } from '@/app/lib/permissoes'
import { clienteApi } from '@/app/lib/cliente-api'
import type { PecaResposta, UnidadeMedidaResposta } from '@/app/lib/definicoes'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { FormularioPeca } from '../formulario-peca'
import { AcoesCabecalhoPeca } from './acoes-cabecalho-peca'

type Props = { params: Promise<{ id: string }> }

export default async function PecaDetalhePage({ params }: Props) {
  const { id } = await params
  const [peca, unidades, sessao] = await Promise.all([
    clienteApi<PecaResposta>(`/pecas/${id}`),
    clienteApi<UnidadeMedidaResposta[]>('/unidades-medida'),
    lerSessao(),
  ])
  const podeGerenciar = temPermissao(sessao, 'PECA_GERENCIAR')

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/pecas" className="text-sm text-slate-500 hover:text-slate-700">
        ← Voltar para pecas
      </Link>

      <Card padding="md">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-semibold text-slate-900">{peca.nome}</h1>
              <Badge variant={peca.ativo ? 'success' : 'default'} dot>
                {peca.ativo ? 'Ativa' : 'Inativa'}
              </Badge>
            </div>
            {peca.unidadeMedidaSigla && (
              <p className="text-sm text-slate-500">Unidade: {peca.unidadeMedidaSigla}</p>
            )}
          </div>
          {podeGerenciar && <AcoesCabecalhoPeca peca={peca} />}
        </div>
      </Card>

      <Card padding="md" title="Dados da peca">
        <FormularioPeca peca={peca} unidadesMedida={unidades} podeEditar={podeGerenciar} />
      </Card>
    </div>
  )
}
