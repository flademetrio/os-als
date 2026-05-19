type Tamanho = 'sm' | 'md' | 'lg'

const classesTamanho: Record<Tamanho, string> = {
  sm: 'h-7 w-7 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-12 w-12 text-base',
}

type Props = {
  nome: string
  size?: Tamanho
  className?: string
}

/**
 * Avatar de iniciais coloridas. Cor estavel por nome (hash simples).
 */
export function Avatar({ nome, size = 'md', className = '' }: Props) {
  const iniciais = extrairIniciais(nome)
  const cor = corPorNome(nome)

  return (
    <div
      className={[
        'inline-flex items-center justify-center rounded-full font-semibold text-white shrink-0',
        classesTamanho[size],
        cor,
        className,
      ].join(' ')}
      aria-label={`Avatar de ${nome}`}
    >
      {iniciais}
    </div>
  )
}

function extrairIniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/)
  if (partes.length === 0) return '?'
  if (partes.length === 1) return partes[0][0]?.toUpperCase() ?? '?'
  return ((partes[0][0] ?? '') + (partes[partes.length - 1][0] ?? '')).toUpperCase()
}

const CORES = [
  'bg-sky-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-violet-500',
  'bg-indigo-500',
  'bg-teal-500',
  'bg-orange-500',
]

function corPorNome(nome: string): string {
  let hash = 0
  for (let i = 0; i < nome.length; i++) hash = (hash * 31 + nome.charCodeAt(i)) | 0
  return CORES[Math.abs(hash) % CORES.length]
}
