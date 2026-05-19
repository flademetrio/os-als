'use client'

import { InputHTMLAttributes } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
  hint?: string
  fullWidth?: boolean
}

export function Input({
  label,
  error,
  hint,
  fullWidth = false,
  className = '',
  id,
  ...props
}: Props) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className={fullWidth ? 'w-full' : 'inline-block'}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 mb-1">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={[
          'block w-full rounded-lg border bg-white text-sm text-slate-900 placeholder-slate-400 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
          'disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed',
          error ? 'border-red-400 focus:ring-red-400' : 'border-slate-300',
          'px-3 py-2',
          className,
        ].join(' ')}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  )
}
