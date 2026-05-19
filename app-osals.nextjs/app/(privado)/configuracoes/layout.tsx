import { redirect } from 'next/navigation'
import { lerSessao } from '@/app/lib/sessao'

/**
 * Layout das telas de configuracoes — apenas ADMIN pode acessar.
 *
 * Caso o usuario nao tenha papel ADMIN, redireciona para /dashboard.
 * A camada de autenticacao ja foi feita no layout (privado) pai.
 */
export default async function LayoutConfiguracoes({
  children,
}: {
  children: React.ReactNode
}) {
  const sessao = await lerSessao()
  if (sessao?.papel !== 'ADMIN') {
    redirect('/dashboard')
  }
  return <>{children}</>
}
