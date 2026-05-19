'use server'

import { redirect } from 'next/navigation'
import { clienteApiBruto } from '@/app/lib/cliente-api'
import { repassarCookiesDeApi } from '@/app/lib/sessao'

/**
 * Encerra a sessao no backend e limpa cookies locais.
 */
export async function sair(): Promise<void> {
  try {
    const resp = await clienteApiBruto('/auth/logout', { method: 'POST' })
    await repassarCookiesDeApi(resp)
  } catch {
    // mesmo se falhar no back, limpa local
  }
  redirect('/login')
}
