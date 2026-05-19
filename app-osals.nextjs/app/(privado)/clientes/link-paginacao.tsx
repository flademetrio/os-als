import Link from 'next/link'
import type { ReactNode } from 'react'

type Props = {
  pagina: number
  desabilitado: boolean
  busca: string
  apenasAtivos: boolean
  children: ReactNode
}

export function LinkPaginacao({ pagina, desabilitado, busca, apenasAtivos, children }: Props) {
  const params = new URLSearchParams()
  if (busca) params.set('busca', busca)
  if (!apenasAtivos) params.set('apenasAtivos', 'false')
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
    <Link href={`/clientes?${params.toString()}`} className={classe}>
      {children}
    </Link>
  )
}
