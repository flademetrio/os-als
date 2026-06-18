import Link from 'next/link'
import { Card } from '@/components/ui/Card'

const RELATORIOS = [
  {
    href: '/relatorios/servicos-abertos',
    titulo: 'Servicos abertos',
    descricao:
      'Todos os servicos em andamento: cliente, tipo, se e cobrado, numero de OS e valor.',
  },
  {
    href: '/relatorios/os-por-status',
    titulo: 'OS por status',
    descricao:
      'Contagem das ordens de servico em cada status e a lista detalhada. Identifica gargalos na operacao.',
  },
  {
    href: '/relatorios/custos-por-servico',
    titulo: 'Custos por servico',
    descricao:
      'Custo desmembrado por categoria, custo total, markup e preco de venda de cada servico.',
  },
  {
    href: '/relatorios/custos-por-cliente',
    titulo: 'Custos por cliente',
    descricao:
      'Volume consolidado por cliente: quantidade de servicos, OS, custo total e preco de venda.',
  },
]

export default function RelatoriosPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Relatorios</h1>
        <p className="text-sm text-slate-500 mt-1">
          Visoes agregadas da operacao. Acesso restrito a gerentes e administradores.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {RELATORIOS.map((r) => (
          <Link key={r.href} href={r.href} className="block">
            <Card padding="md" hover>
              <h2 className="text-sm font-semibold text-slate-900">{r.titulo}</h2>
              <p className="text-xs text-slate-500 mt-1">{r.descricao}</p>
              <p className="text-xs text-primary mt-3 font-medium">Abrir →</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
