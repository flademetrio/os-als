'use client'

import { ReactNode, useEffect, useRef, useState } from 'react'

type Tamanho = 'sm' | 'md' | 'lg' | 'xl' | 'meio'

/**
 * Largura do painel lateral por tamanho. "meio" ocupa metade da tela em
 * telas medias/grandes (a borda esquerda do painel chega ao centro).
 */
const classesTamanho: Record<Tamanho, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-xl',
  xl: 'max-w-3xl',
  meio: 'sm:max-w-[50vw]',
}

const DURACAO_MS = 300

type Props = {
  open: boolean
  onClose: () => void
  title?: string
  size?: Tamanho
  children: ReactNode
  footer?: ReactNode
}

/**
 * Painel lateral (drawer): desliza da borda direita para a esquerda ao abrir
 * e volta ao fechar. Substitui o modal centralizado em todo o sistema.
 */
export function Modal({ open, onClose, title, size = 'md', children, footer }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null)
  // "renderizar" mantem o painel no DOM durante a animacao de saida;
  // "visivel" controla o transform que produz o deslize.
  const [renderizar, setRenderizar] = useState(open)
  const [visivel, setVisivel] = useState(false)

  useEffect(() => {
    if (open) {
      setRenderizar(true)
      const id = requestAnimationFrame(() => setVisivel(true))
      return () => cancelAnimationFrame(id)
    }
    setVisivel(false)
    const t = setTimeout(() => setRenderizar(false), DURACAO_MS)
    return () => clearTimeout(t)
  }, [open])

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  useEffect(() => {
    if (visivel) dialogRef.current?.focus()
  }, [visivel])

  if (!renderizar) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className={[
          'absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300',
          visivel ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={[
          'relative ml-auto h-full w-full bg-surface shadow-2xl flex flex-col',
          'transition-transform duration-300 ease-out focus:outline-none',
          visivel ? 'translate-x-0' : 'translate-x-full',
          classesTamanho[size],
        ].join(' ')}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          {title && <h2 className="text-base font-semibold text-slate-900">{title}</h2>}
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="ml-auto text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
