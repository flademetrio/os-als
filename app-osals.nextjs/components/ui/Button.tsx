'use client'

import { ButtonHTMLAttributes, ReactNode } from 'react'

type Variante = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'
type Tamanho = 'xs' | 'sm' | 'md' | 'lg'

const classesVariante: Record<Variante, string> = {
  primary: 'bg-primary text-white hover:bg-primary-dark active:bg-primary-dark shadow-[0_3px_10px_rgba(14,165,233,0.25)]',
  secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300',
  outline: 'border border-primary text-primary bg-transparent hover:bg-primary-light active:bg-primary-light',
  ghost: 'text-slate-600 bg-transparent hover:bg-slate-100 active:bg-slate-200',
  danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-sm',
  success: 'bg-secondary text-white hover:bg-secondary-dark active:bg-secondary-dark shadow-sm',
}

const classesTamanho: Record<Tamanho, string> = {
  xs: 'px-2.5 py-1 text-xs gap-1',
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-5 py-2.5 text-base gap-2',
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variante
  size?: Tamanho
  loading?: boolean
  icon?: ReactNode
  fullWidth?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  fullWidth = false,
  children,
  disabled,
  className = '',
  ...props
}: Props) {
  return (
    <button
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        classesVariante[variant],
        classesTamanho[size],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  )
}
