'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import type { SessaoUsuario } from '@/app/lib/definicoes'
import { sair } from '@/app/actions/auth/sair'
import { Avatar } from '@/components/ui/Avatar'
import { SearchBar } from '@/components/ui/SearchBar'
import { IconeSair } from './icones'

type Props = {
  usuario: SessaoUsuario
  onAbrirMenuMobile?: () => void
  botaoMenuMobile?: React.ReactNode
}

export function Topbar({ usuario, botaoMenuMobile }: Props) {
  const router = useRouter()
  const [aberto, setAberto] = useState(false)
  const [busca, setBusca] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  /** Enter na busca global: abre /servicos filtrado pelo termo, em todos os status. */
  function buscar() {
    const termo = busca.trim()
    if (!termo) return
    router.push(`/servicos?busca=${encodeURIComponent(termo)}&situacao=todos`)
    setBusca('')
  }

  // Fechar ao clicar fora
  useEffect(() => {
    if (!aberto) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [aberto])

  return (
    <header className="sticky top-0 z-30 bg-surface border-b border-slate-200 h-14 flex items-center px-4 md:px-6 gap-4">
      {botaoMenuMobile && <div className="md:hidden">{botaoMenuMobile}</div>}

      <div className="flex-1 max-w-md hidden sm:block">
        <SearchBar
          placeholder="Buscar servico, OS, cliente..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') buscar()
          }}
          fullWidth
        />
      </div>

      <div className="flex-1 sm:hidden" />

      <div className="relative" ref={ref}>
        <button
          onClick={() => setAberto((a) => !a)}
          className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors"
          aria-haspopup="menu"
          aria-expanded={aberto}
        >
          <Avatar nome={usuario.nome} size="sm" />
          <div className="text-left hidden sm:block">
            <p className="text-sm font-medium text-slate-900 leading-tight">{usuario.nome}</p>
            <p className="text-xs text-slate-500 leading-tight">{usuario.papel}</p>
          </div>
        </button>

        {aberto && (
          <div
            className="absolute right-0 mt-2 w-56 bg-surface rounded-xl border border-slate-200 shadow-lg overflow-hidden"
            role="menu"
          >
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-sm font-medium text-slate-900 truncate">{usuario.nome}</p>
              <p className="text-xs text-slate-500 truncate">{usuario.email}</p>
            </div>
            <form action={sair}>
              <button
                type="submit"
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                role="menuitem"
              >
                <IconeSair className="w-4 h-4 text-slate-500" />
                Sair
              </button>
            </form>
          </div>
        )}
      </div>
    </header>
  )
}
