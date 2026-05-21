import Link from 'next/link'
import type { ReactNode } from 'react'

type Props = {
  pagina: number
  desabilitado: boolean
  base: Record<string, string>
  children: ReactNode
}

/** Link de paginacao da listagem de OS — preserva os filtros ativos. */
export function LinkPaginacao({ pagina, desabilitado, base, children }: Props) {
  const params = new URLSearchParams()
  for (const [chave, valor] of Object.entries(base)) {
    if (valor) params.set(chave, valor)
  }
  params.set('pagina', String(pagina))

  const classe = [
    'inline-flex items-center justify-center px-3 py-1.5 text-sm rounded-lg border transition-colors',
    desabilitado
      ? 'border-slate-200 text-slate-400 cursor-not-allowed'
      : 'border-primary text-primary hover:bg-primary-light',
  ].join(' ')

  if (desabilitado) {
    return <span className={classe}>{children}</span>
  }
  return (
    <Link href={`/ordens-servico?${params.toString()}`} className={classe}>
      {children}
    </Link>
  )
}
