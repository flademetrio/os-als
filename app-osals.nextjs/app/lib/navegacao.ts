/**
 * Definicao dos itens de navegacao da Sidebar e do menu mobile.
 *
 * Filtragem por papel acontece nos componentes que renderizam — esta lista
 * declara apenas o requisito minimo de papel para ver cada item.
 */

import type { Papel } from './definicoes'

export type ItemNavegacao = {
  rotulo: string
  href: string
  /** Papeis que veem este item. Vazio = todos autenticados. */
  papeis?: Papel[]
  /** Rotas correlatas que tambem ativam este item (ex.: /clientes ativa "Clientes" em /clientes/123). */
  rotasCorrelatas?: string[]
}

export const NAV_PRINCIPAL: ItemNavegacao[] = [
  { rotulo: 'Dashboard', href: '/dashboard' },
  { rotulo: 'Servicos', href: '/servicos' },
  { rotulo: 'Clientes', href: '/clientes' },
  { rotulo: 'Equipamentos', href: '/equipamentos' },
  { rotulo: 'Tecnicos', href: '/tecnicos' },
  { rotulo: 'Veiculos', href: '/veiculos' },
  { rotulo: 'Pecas', href: '/pecas' },
  { rotulo: 'Relatorios', href: '/relatorios', papeis: ['GERENTE', 'ADMIN'] },
]

export const NAV_INFERIOR: ItemNavegacao[] = [
  { rotulo: 'Configuracoes', href: '/configuracoes', papeis: ['ADMIN'] },
]

export function filtrarPorPapel(itens: ItemNavegacao[], papel: Papel): ItemNavegacao[] {
  return itens.filter((i) => !i.papeis || i.papeis.includes(papel))
}

export function itemEstaAtivo(item: ItemNavegacao, pathname: string): boolean {
  if (pathname === item.href || pathname.startsWith(item.href + '/')) return true
  return (item.rotasCorrelatas ?? []).some(
    (r) => pathname === r || pathname.startsWith(r + '/'),
  )
}
