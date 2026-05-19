import { redirect } from 'next/navigation'
import { verificarSessao } from '@/app/lib/sessao'
import { ShellPrivado } from '@/components/app/ShellPrivado'
import type { SessaoUsuario } from '@/app/lib/definicoes'

/**
 * Layout do grupo (privado).
 *
 * Camada 2 de autenticacao: jwtVerify RS256 com a chave publica.
 * Se invalido, redireciona ao /sair (que limpa cookies e leva ao /login).
 */
export default async function LayoutPrivado({
  children,
}: {
  children: React.ReactNode
}) {
  let sessao: SessaoUsuario
  try {
    sessao = await verificarSessao()
  } catch {
    redirect('/sair')
  }

  return <ShellPrivado usuario={sessao}>{children}</ShellPrivado>
}
