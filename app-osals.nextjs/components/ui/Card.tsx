import { HTMLAttributes, ReactNode } from 'react'

type Padding = 'none' | 'sm' | 'md' | 'lg'

const classesPadding: Record<Padding, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
}

type Props = HTMLAttributes<HTMLDivElement> & {
  title?: string
  subtitle?: string
  actions?: ReactNode
  padding?: Padding
  hover?: boolean
}

export function Card({
  title,
  subtitle,
  actions,
  padding = 'md',
  hover = false,
  children,
  className = '',
  ...props
}: Props) {
  return (
    <div
      className={[
        'bg-surface rounded-xl border border-slate-200 shadow-sm',
        hover ? 'hover:shadow-md transition-shadow cursor-pointer' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {(title || actions) && (
        <div className="flex items-start justify-between px-5 pt-5 pb-0">
          <div>
            {title && <h3 className="text-sm font-semibold text-slate-900">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2 ml-4 shrink-0">{actions}</div>}
        </div>
      )}
      <div className={classesPadding[padding]}>{children}</div>
    </div>
  )
}
