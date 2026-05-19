'use client'

import { ReactNode, useState } from 'react'

type Variante = 'info' | 'success' | 'warning' | 'danger'

const estilos: Record<Variante, { wrapper: string; icone: string }> = {
  info: { wrapper: 'bg-primary-light border-sky-200 text-sky-800', icone: 'text-sky-500' },
  success: { wrapper: 'bg-green-50 border-green-200 text-green-800', icone: 'text-green-500' },
  warning: { wrapper: 'bg-amber-50 border-amber-200 text-amber-800', icone: 'text-amber-500' },
  danger: { wrapper: 'bg-red-50 border-red-200 text-red-800', icone: 'text-red-500' },
}

type Props = {
  variant?: Variante
  title?: string
  children: ReactNode
  dismissible?: boolean
  className?: string
}

export function Alert({ variant = 'info', title, children, dismissible = false, className = '' }: Props) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  const s = estilos[variant]

  return (
    <div className={['flex gap-3 p-4 rounded-lg border text-sm', s.wrapper, className].join(' ')} role="alert">
      <div className="flex-1">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        <div>{children}</div>
      </div>
      {dismissible && (
        <button
          onClick={() => setDismissed(true)}
          className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Fechar"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
