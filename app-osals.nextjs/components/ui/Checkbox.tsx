'use client'

import { InputHTMLAttributes } from 'react'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label?: string
  error?: string
}

export function Checkbox({ label, error, className = '', id, ...props }: Props) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className="inline-flex flex-col">
      <label htmlFor={inputId} className="inline-flex items-center gap-2 cursor-pointer">
        <input
          id={inputId}
          type="checkbox"
          className={[
            'rounded border-slate-300 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'h-4 w-4',
            className,
          ].join(' ')}
          {...props}
        />
        {label && <span className="text-sm text-slate-700">{label}</span>}
      </label>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}
