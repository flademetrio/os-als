type Variante = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple'
type Tamanho = 'sm' | 'md'

const classesVariante: Record<Variante, string> = {
  default: 'bg-slate-100 text-slate-700',
  primary: 'bg-sky-100 text-sky-800',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  purple: 'bg-purple-100 text-purple-700',
}

const classesTamanho: Record<Tamanho, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
}

const corDot: Record<Variante, string> = {
  default: 'bg-slate-500',
  primary: 'bg-sky-500',
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-blue-500',
  purple: 'bg-purple-500',
}

type Props = {
  children: React.ReactNode
  variant?: Variante
  size?: Tamanho
  dot?: boolean
  className?: string
}

export function Badge({ children, variant = 'default', size = 'md', dot = false, className = '' }: Props) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 font-medium rounded-full',
        classesVariante[variant],
        classesTamanho[size],
        className,
      ].join(' ')}
    >
      {dot && <span className={['w-1.5 h-1.5 rounded-full shrink-0', corDot[variant]].join(' ')} />}
      {children}
    </span>
  )
}
