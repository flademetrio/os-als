import { redirect } from 'next/navigation'
import { lerSessao } from '@/app/lib/sessao'

/**
 * Layout da administracao de usuarios — exige a permissao USUARIO_GERENCIAR.
 * Sem ela, redireciona para /dashboard.
 */
export default async function LayoutUsuarios({
  children,
}: {
  children: React.ReactNode
}) {
  const sessao = await lerSessao()
  if (!sessao?.permissoes.includes('USUARIO_GERENCIAR')) {
    redirect('/dashboard')
  }
  return <>{children}</>
}
