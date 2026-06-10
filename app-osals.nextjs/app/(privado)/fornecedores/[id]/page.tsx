import Link from 'next/link'
import { lerSessao } from '@/app/lib/sessao'
import { temPermissao } from '@/app/lib/permissoes'
import { clienteApi } from '@/app/lib/cliente-api'
import type { FornecedorResposta } from '@/app/lib/definicoes'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { FormularioFornecedor } from '../formulario-fornecedor'
import { AcoesCabecalhoFornecedor } from './acoes-cabecalho-fornecedor'

type Props = { params: Promise<{ id: string }> }

export default async function FornecedorDetalhePage({ params }: Props) {
  const { id } = await params
  const [fornecedor, sessao] = await Promise.all([
    clienteApi<FornecedorResposta>(`/fornecedores/${id}`),
    lerSessao(),
  ])
  const podeGerenciar = temPermissao(sessao, 'FORNECEDOR_GERENCIAR')

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/fornecedores" className="text-sm text-slate-500 hover:text-slate-700">
        ← Voltar para fornecedores
      </Link>

      <Card padding="md">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-semibold text-slate-900">{fornecedor.nome}</h1>
              <Badge variant={fornecedor.ativo ? 'success' : 'default'} dot>
                {fornecedor.ativo ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
            {fornecedor.tipoPessoa && (
              <p className="text-sm text-slate-500">{fornecedor.tipoPessoa}</p>
            )}
          </div>
          {podeGerenciar && <AcoesCabecalhoFornecedor fornecedor={fornecedor} />}
        </div>
      </Card>

      <Card padding="md" title="Dados do fornecedor">
        <FormularioFornecedor fornecedor={fornecedor} podeEditar={podeGerenciar} />
      </Card>
    </div>
  )
}
