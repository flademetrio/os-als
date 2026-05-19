'use client'

import { useState, type ReactNode } from 'react'
import type { SessaoUsuario } from '@/app/lib/definicoes'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { NavegacaoMobile, BotaoMenuMobile } from './NavegacaoMobile'

/**
 * Shell da area privada: Sidebar (desktop) + Drawer (mobile) + Topbar + conteudo.
 *
 * Client Component porque controla estado do drawer mobile e dropdown do avatar.
 * O Layout pai (Server Component) faz a verificacao JWT e passa o usuario.
 */
export function ShellPrivado({
  usuario,
  children,
}: {
  usuario: SessaoUsuario
  children: ReactNode
}) {
  const [menuMobileAberto, setMenuMobileAberto] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar usuario={usuario} />

      <NavegacaoMobile
        usuario={usuario}
        aberto={menuMobileAberto}
        onFechar={() => setMenuMobileAberto(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          usuario={usuario}
          botaoMenuMobile={<BotaoMenuMobile onClick={() => setMenuMobileAberto(true)} />}
        />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
