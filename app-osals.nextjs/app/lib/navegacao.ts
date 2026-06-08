/**
 * Definicao dos itens de navegacao da Sidebar e do menu mobile.
 *
 * Cada item pode exigir uma permissao; itens sem permissao aparecem para
 * qualquer usuario autenticado. A filtragem por permissao acontece nos
 * componentes que renderizam.
 */

import type { Permissao } from './definicoes'

export type ItemNavegacao = {
  rotulo: string
  href: string
  /** Permissao necessaria para ver o item. Ausente = todos autenticados. */
  permissao?: Permissao
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
  { rotulo: 'Relatorios', href: '/relatorios', permissao: 'RELATORIO_VER' },
]

export const NAV_INFERIOR: ItemNavegacao[] = [
  { rotulo: 'Usuarios', href: '/usuarios', permissao: 'USUARIO_GERENCIAR' },
  { rotulo: 'Configuracoes', href: '/configuracoes', permissao: 'CONFIG_GERENCIAR' },
]

export function filtrarPorPermissao(
  itens: ItemNavegacao[],
  permissoes: Permissao[],
): ItemNavegacao[] {
  return itens.filter((i) => !i.permissao || permissoes.includes(i.permissao))
}

export function itemEstaAtivo(item: ItemNavegacao, pathname: string): boolean {
  if (pathname === item.href || pathname.startsWith(item.href + '/')) return true
  return (item.rotasCorrelatas ?? []).some(
    (r) => pathname === r || pathname.startsWith(r + '/'),
  )
}
