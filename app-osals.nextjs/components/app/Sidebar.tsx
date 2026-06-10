'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, type ReactNode } from 'react'
import type { SessaoUsuario } from '@/app/lib/definicoes'
import {
  NAV_PRINCIPAL,
  NAV_INFERIOR,
  filtrarPorPermissao,
  itemEstaAtivo,
  type ItemNavegacao,
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
  IconeRecolher,
} from './icones'

// Versao "carimbada" no build (release.sh -> Dockerfile ARG). Em dev local fica
// vazia e a linha de versao nao aparece.
const VERSAO_APP = process.env.NEXT_PUBLIC_APP_VERSAO

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
  '/usuarios': <IconeTecnico />,
  '/configuracoes': <IconeConfiguracoes />,
}

export function Sidebar({ usuario }: { usuario: SessaoUsuario }) {
  const pathname = usePathname()
  const [expandida, setExpandida] = useState(true)

  const principal = filtrarPorPermissao(NAV_PRINCIPAL, usuario.permissoes)
  const inferior = filtrarPorPermissao(NAV_INFERIOR, usuario.permissoes)

  function LinkNav({ item }: { item: ItemNavegacao }) {
    const ativa = itemEstaAtivo(item, pathname)
    return (
      <Link
        href={item.href}
        title={!expandida ? item.rotulo : undefined}
        className={[
          'group relative flex items-center gap-2.5 text-[13px] font-medium transition-all duration-150',
          expandida ? 'px-3 py-2.5 rounded-lg' : 'justify-center py-2.5 rounded-xl',
          ativa
            ? 'bg-primary text-white shadow-[0_4px_12px_rgba(14,165,233,0.45)]'
            : 'text-white/80 hover:bg-white/10 hover:text-white',
        ].join(' ')}
      >
        <span className="shrink-0">{ICONE_POR_HREF[item.href]}</span>
        {expandida && <span className="truncate">{item.rotulo}</span>}
      </Link>
    )
  }

  return (
    <aside
      className={[
        'hidden md:flex shrink-0 flex-col h-screen sticky top-0 transition-all duration-200 overflow-hidden',
        'bg-gradient-to-b from-primary-glow to-primary-mid shadow-[2px_0_12px_rgba(12,74,109,0.18)]',
        expandida ? 'w-56' : 'w-[60px]',
      ].join(' ')}
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

      <div
        className={[
          'flex items-center h-14 border-b border-white/10',
          expandida ? 'px-4 gap-3' : 'justify-center px-2',
        ].join(' ')}
      >
        {expandida ? (
          <>
            <span className="text-white text-base font-semibold tracking-wide">OS-ALS</span>
            <span className="text-[10px] text-white/60 ml-auto truncate" title="ALS Industria">
              ALS Industria
            </span>
          </>
        ) : (
          <span className="text-white text-sm font-bold">OS</span>
        )}
      </div>

      <nav
        className={[
          'flex-1 py-3 space-y-0.5 overflow-y-auto',
          '[scrollbar-width:thin] [scrollbar-color:rgb(255_255_255_/_0.12)_transparent]',
          expandida ? 'px-3' : 'px-2',
        ].join(' ')}
      >
        {principal.map((item) => (
          <LinkNav key={item.href} item={item} />
        ))}

        {inferior.length > 0 && <div className="my-2 border-t border-white/5" />}

        {inferior.map((item) => (
          <LinkNav key={item.href} item={item} />
        ))}
      </nav>

      <div className={['border-t border-white/5 pt-3 pb-3', expandida ? 'px-3' : 'px-2'].join(' ')}>
        <button
          onClick={() => setExpandida((e) => !e)}
          title={expandida ? 'Recolher' : 'Expandir'}
          className={[
            'w-full flex items-center gap-2 rounded-xl px-3 py-2 text-white/70 hover:bg-white/10 hover:text-white transition-all text-[12px]',
            !expandida ? 'justify-center px-0' : '',
          ].join(' ')}
        >
          <IconeRecolher className={`w-3.5 h-3.5 transition-transform ${!expandida ? 'rotate-180' : ''}`} />
          {expandida && <span>Recolher</span>}
        </button>

        {VERSAO_APP && (
          <p
            className={[
              'mt-1 text-white/40',
              expandida ? 'px-3 text-[10px]' : 'text-center text-[9px]',
            ].join(' ')}
            title={`Versao ${VERSAO_APP}`}
          >
            {expandida ? `versao ${VERSAO_APP}` : VERSAO_APP}
          </p>
        )}
      </div>
    </aside>
  )
}
