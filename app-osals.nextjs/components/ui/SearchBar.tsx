'use client'

import { InputHTMLAttributes } from 'react'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  fullWidth?: boolean
}

export function SearchBar({ fullWidth = false, className = '', placeholder = 'Buscar...', ...props }: Props) {
  return (
    <div className={['relative', fullWidth ? 'w-full' : 'inline-block'].join(' ')}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
          />
        </svg>
      </div>
      <input
        type="search"
        placeholder={placeholder}
        className={[
          'block w-full rounded-lg border bg-white text-sm text-slate-900 placeholder-slate-400 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
          'border-slate-300 pl-9 pr-3 py-2',
          className,
        ].join(' ')}
        {...props}
      />
    </div>
  )
}
