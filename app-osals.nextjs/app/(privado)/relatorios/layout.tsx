import { redirect } from 'next/navigation'
import { lerSessao } from '@/app/lib/sessao'

/**
 * Layout dos relatorios — acesso restrito a gerente e admin.
 * Operador e tecnico sao redirecionados ao dashboard.
 */
export default async function LayoutRelatorios({
  children,
}: {
  children: React.ReactNode
}) {
  const sessao = await lerSessao()
  if (sessao?.papel !== 'GERENTE' && sessao?.papel !== 'ADMIN') {
    redirect('/dashboard')
  }
  return <>{children}</>
}
