'use client'

import { ReactNode } from 'react'

type ItemTab = {
  id: string
  label: string
  count?: number
}

type Props = {
  tabs: ItemTab[]
  ativa: string
  onMudar: (id: string) => void
  className?: string
  children?: ReactNode
}

export function Tabs({ tabs, ativa, onMudar, className = '', children }: Props) {
  return (
    <div className={className}>
      <div className="border-b border-slate-200">
        <nav className="flex gap-6" aria-label="Tabs">
          {tabs.map((t) => {
            const ehAtiva = t.id === ativa
            return (
              <button
                key={t.id}
                onClick={() => onMudar(t.id)}
                className={[
                  'px-1 py-3 text-sm font-medium border-b-2 transition-colors',
                  ehAtiva
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300',
                ].join(' ')}
                aria-current={ehAtiva ? 'page' : undefined}
              >
                {t.label}
                {t.count !== undefined && (
                  <span
                    className={[
                      'ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs',
                      ehAtiva ? 'bg-primary-light text-primary-dark' : 'bg-slate-100 text-slate-600',
                    ].join(' ')}
                  >
                    {t.count}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>
      {children && <div className="pt-5">{children}</div>}
    </div>
  )
}
