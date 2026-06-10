import Link from 'next/link'
import { lerSessao } from '@/app/lib/sessao'
import { temPermissao } from '@/app/lib/permissoes'
import { clienteApi } from '@/app/lib/cliente-api'
import type {
  ClienteResposta,
  ContatoClienteResposta,
  UnidadeResposta,
} from '@/app/lib/definicoes'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { DetalheCliente } from './detalhe-cliente'
import { AcoesCabecalho } from './acoes-cabecalho'

type Props = {
  params: Promise<{ id: string }>
}

export default async function ClienteDetalhePage({ params }: Props) {
  const { id } = await params
  const clienteId = Number(id)

  const [cliente, unidades, contatos, sessao] = await Promise.all([
    clienteApi<ClienteResposta>(`/clientes/${clienteId}`),
    clienteApi<UnidadeResposta[]>(`/clientes/${clienteId}/unidades?apenasAtivas=false`),
    clienteApi<ContatoClienteResposta[]>(`/clientes/${clienteId}/contatos`),
    lerSessao(),
  ])

  const podeGerenciar = temPermissao(sessao, 'CLIENTE_GERENCIAR')

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <Link href="/clientes" className="text-sm text-slate-500 hover:text-slate-700">
          ← Voltar para clientes
        </Link>
      </div>

      <Card padding="md">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-semibold text-slate-900">{cliente.nome}</h1>
              {cliente.ativo ? (
                <Badge variant="success" dot>
                  Ativo
                </Badge>
              ) : (
                <Badge variant="default" dot>
                  Inativo
                </Badge>
              )}
            </div>
            <p className="text-sm text-slate-500">
              {cliente.tipoPessoa} · {formatarDocumento(cliente.documento, cliente.tipoPessoa)}
              {cliente.nomeFantasia ? ` · ${cliente.nomeFantasia}` : ''}
            </p>
          </div>
          {podeGerenciar && <AcoesCabecalho cliente={cliente} />}
        </div>
      </Card>

      <DetalheCliente
        cliente={cliente}
        unidades={unidades}
        contatos={contatos}
        podeGerenciar={podeGerenciar}
      />
    </div>
  )
}

function formatarDocumento(doc: string, tipo: 'PF' | 'PJ'): string {
  if (tipo === 'PF' && doc.length === 11) {
    return `${doc.slice(0, 3)}.${doc.slice(3, 6)}.${doc.slice(6, 9)}-${doc.slice(9)}`
  }
  if (tipo === 'PJ' && doc.length === 14) {
    return `${doc.slice(0, 2)}.${doc.slice(2, 5)}.${doc.slice(5, 8)}/${doc.slice(8, 12)}-${doc.slice(12)}`
  }
  return doc
}
