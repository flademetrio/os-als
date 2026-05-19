'use client'

import { Button } from './Button'

type Props = {
  pagina: number // zero-based
  totalPaginas: number
  onMudar: (novaPagina: number) => void
  className?: string
}

export function Pagination({ pagina, totalPaginas, onMudar, className = '' }: Props) {
  if (totalPaginas <= 1) return null

  const podeVoltar = pagina > 0
  const podeAvancar = pagina < totalPaginas - 1

  return (
    <div className={['flex items-center justify-between gap-3 text-sm', className].join(' ')}>
      <div className="text-slate-500">
        Pagina <span className="font-medium text-slate-900">{pagina + 1}</span> de{' '}
        <span className="font-medium text-slate-900">{totalPaginas}</span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onMudar(pagina - 1)}
          disabled={!podeVoltar}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onMudar(pagina + 1)}
          disabled={!podeAvancar}
        >
          Proxima
        </Button>
      </div>
    </div>
  )
}
