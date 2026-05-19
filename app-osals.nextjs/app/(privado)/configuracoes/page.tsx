import Link from 'next/link'
import { Card } from '@/components/ui/Card'

type AtalhoConfig = {
  href: string
  titulo: string
  descricao: string
}

const ATALHOS: AtalhoConfig[] = [
  {
    href: '/configuracoes/financeiro',
    titulo: 'Financeiro',
    descricao: 'Markup percentual aplicado no calculo do preco e valor cobrado por km.',
  },
  {
    href: '/configuracoes/tipos-servico',
    titulo: 'Tipos de servico',
    descricao: 'Lista fixa de tipos (preventiva, corretiva, instalacao, ...). Permite renomear e ativar/desativar.',
  },
  {
    href: '/configuracoes/categorias-custo',
    titulo: 'Categorias de custo',
    descricao: 'Catalogo usado nos lancamentos da OS (mao de obra, deslocamento, peca, ...).',
  },
  {
    href: '/configuracoes/unidades-medida',
    titulo: 'Unidades de medida',
    descricao: 'Catalogo de unidades (un, kg, m, l, ...) usadas no cadastro de pecas.',
  },
]

export default function ConfiguracoesPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Configuracoes</h1>
        <p className="text-sm text-slate-500 mt-1">
          Ajustes administrativos do sistema. Acesso restrito a administradores.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ATALHOS.map((item) => (
          <Link key={item.href} href={item.href} className="block">
            <Card padding="md" hover>
              <h2 className="text-sm font-semibold text-slate-900">{item.titulo}</h2>
              <p className="text-xs text-slate-500 mt-1">{item.descricao}</p>
              <p className="text-xs text-primary mt-3 font-medium">Acessar →</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
