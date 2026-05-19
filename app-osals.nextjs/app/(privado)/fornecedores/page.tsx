import Link from 'next/link'
import { clienteApi } from '@/app/lib/cliente-api'
import type { FornecedorResposta, PaginaResposta } from '@/app/lib/definicoes'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

type Props = { searchParams: Promise<{ busca?: string; pagina?: string; apenasAtivos?: string }> }

export default async function FornecedoresPage({ searchParams }: Props) {
  const params = await searchParams
  const busca = params.busca ?? ''
  const pagina = Number(params.pagina ?? '0')
  const apenasAtivos = params.apenasAtivos !== 'false'

  const q = new URLSearchParams()
  if (busca) q.set('busca', busca)
  q.set('pagina', String(pagina))
  q.set('tamanho', '20')
  q.set('apenasAtivos', String(apenasAtivos))

  const dados = await clienteApi<PaginaResposta<FornecedorResposta>>(`/fornecedores?${q.toString()}`)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Fornecedores</h1>
          <p className="text-sm text-slate-500 mt-1">
            {dados.totalElementos} {dados.totalElementos === 1 ? 'fornecedor' : 'fornecedores'}
            {apenasAtivos ? ' ativos' : ' no total'}
          </p>
        </div>
        <Link href="/fornecedores/novo">
          <Button variant="primary">+ Novo fornecedor</Button>
        </Link>
      </div>

      <Card padding="none">
        {dados.conteudo.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-slate-500">Nenhum fornecedor encontrado.</p>
            <Link href="/fornecedores/novo" className="inline-block mt-4">
              <Button size="sm">Cadastrar o primeiro fornecedor</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nome</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Documento</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Contato</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {dados.conteudo.map((f) => (
                  <tr key={f.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/fornecedores/${f.id}`} className="text-primary hover:underline font-medium">
                        {f.nome}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-700">
                      {f.documento ? formatarDocumento(f.documento) : '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {[f.telefone, f.email].filter(Boolean).join(' · ') || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={f.ativo ? 'success' : 'default'} dot size="sm">
                        {f.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

function formatarDocumento(doc: string): string {
  if (doc.length === 11) {
    return `${doc.slice(0, 3)}.${doc.slice(3, 6)}.${doc.slice(6, 9)}-${doc.slice(9)}`
  }
  if (doc.length === 14) {
    return `${doc.slice(0, 2)}.${doc.slice(2, 5)}.${doc.slice(5, 8)}/${doc.slice(8, 12)}-${doc.slice(12)}`
  }
  return doc
}
