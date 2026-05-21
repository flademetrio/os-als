'use client'

import { useRouter, useSearchParams } from 'next/navigation'

type Vista = 'lista' | 'cards'

/** Alterna a apresentacao da listagem de servicos entre tabela e cards. */
export function SeletorVista({ vista }: { vista: Vista }) {
  const router = useRouter()
  const params = useSearchParams()

  function mudar(nova: Vista) {
    const next = new URLSearchParams(params.toString())
    // "cards" e o padrao da pagina — dispensa o parametro na URL.
    if (nova === 'cards') next.delete('vista')
    else next.set('vista', nova)
    router.push(`/servicos?${next.toString()}`)
  }

  return (
    <div className="inline-flex rounded-lg border border-slate-200 p-0.5">
      <Botao ativo={vista === 'lista'} onClick={() => mudar('lista')} rotulo="Lista" />
      <Botao ativo={vista === 'cards'} onClick={() => mudar('cards')} rotulo="Cards" />
    </div>
  )
}

function Botao({
  ativo,
  onClick,
  rotulo,
}: {
  ativo: boolean
  onClick: () => void
  rotulo: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      className={[
        'px-3 py-1 text-xs font-medium rounded-md transition-colors',
        ativo ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100',
      ].join(' ')}
    >
      {rotulo}
    </button>
  )
}
