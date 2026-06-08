import { redirect } from 'next/navigation'
import { lerSessao } from '@/app/lib/sessao'

/**
 * Layout das telas de configuracoes — exige a permissao CONFIG_GERENCIAR.
 *
 * Sem a permissao, redireciona para /dashboard.
 * A camada de autenticacao ja foi feita no layout (privado) pai.
 */
export default async function LayoutConfiguracoes({
  children,
}: {
  children: React.ReactNode
}) {
  const sessao = await lerSessao()
  if (!sessao?.permissoes.includes('CONFIG_GERENCIAR')) {
    redirect('/dashboard')
  }
  return <>{children}</>
}
