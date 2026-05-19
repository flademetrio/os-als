'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'
import type { SessaoUsuario } from '@/app/lib/definicoes'
import {
  NAV_PRINCIPAL,
  NAV_INFERIOR,
  filtrarPorPapel,
  itemEstaAtivo,
} from '@/app/lib/navegacao'
import {
  IconeDashboard,
  IconeServico,
  IconeOS,
  IconeCliente,
  IconeEquipamento,
  IconeTecnico,
  IconeVeiculo,
  IconePecas,
  IconeRelatorios,
  IconeConfiguracoes,
  IconeMenu,
  IconeFechar,
} from './icones'

const ICONE_POR_HREF: Record<string, ReactNode> = {
  '/dashboard': <IconeDashboard />,
  '/servicos': <IconeServico />,
  '/ordens-servico': <IconeOS />,
  '/clientes': <IconeCliente />,
  '/equipamentos': <IconeEquipamento />,
  '/tecnicos': <IconeTecnico />,
  '/veiculos': <IconeVeiculo />,
  '/pecas': <IconePecas />,
  '/relatorios': <IconeRelatorios />,
  '/configuracoes': <IconeConfiguracoes />,
}

export function BotaoMenuMobile({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-700"
      aria-label="Abrir menu"
    >
      <IconeMenu />
    </button>
  )
}

export function NavegacaoMobile({
  usuario,
  aberto,
  onFechar,
}: {
  usuario: SessaoUsuario
  aberto: boolean
  onFechar: () => void
}) {
  const pathname = usePathname()
  const principal = filtrarPorPapel(NAV_PRINCIPAL, usuario.papel)
  const inferior = filtrarPorPapel(NAV_INFERIOR, usuario.papel)

  // Fecha ao mudar de rota
  useEffect(() => {
    onFechar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // ESC fecha
  useEffect(() => {
    if (!aberto) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFechar()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [aberto, onFechar])

  if (!aberto) return null

  return (
    <div className="md:hidden fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onFechar} />

      {/* Drawer */}
      <aside
        className="absolute inset-y-0 left-0 w-72 bg-gradient-to-b from-primary-glow to-primary-mid shadow-xl flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between h-14 px-4 border-b border-white/10">
          <span className="text-white text-base font-semibold">OS-ALS</span>
          <button
            onClick={onFechar}
            className="p-1.5 rounded-lg text-white/80 hover:bg-white/10 hover:text-white"
            aria-label="Fechar menu"
          >
            <IconeFechar />
          </button>
        </div>

        <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
          {principal.map((item) => {
            const ativa = itemEstaAtivo(item, pathname)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  ativa ? 'bg-primary text-white' : 'text-white/80 hover:bg-white/10 hover:text-white',
                ].join(' ')}
              >
                <span className="shrink-0">{ICONE_POR_HREF[item.href]}</span>
                {item.rotulo}
              </Link>
            )
          })}

          {inferior.length > 0 && <div className="my-2 border-t border-white/5" />}

          {inferior.map((item) => {
            const ativa = itemEstaAtivo(item, pathname)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  ativa ? 'bg-primary text-white' : 'text-white/80 hover:bg-white/10 hover:text-white',
                ].join(' ')}
              >
                <span className="shrink-0">{ICONE_POR_HREF[item.href]}</span>
                {item.rotulo}
              </Link>
            )
          })}
        </nav>
      </aside>
    </div>
  )
}
