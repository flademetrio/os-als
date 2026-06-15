import type { StatusFaturamento, TipoCobranca } from '@/app/lib/definicoes'

/** Rotulos dos tipos de cobranca, na ordem de exibicao do select. */
export const TIPO_COBRANCA_LABEL: Record<TipoCobranca, string> = {
  COBRADO: 'Cobrado',
  GARANTIA: 'Garantia',
  ORCAMENTO: 'Orcamento',
  SEM_COBRANCA: 'Sem cobranca',
}

/** Variante de Badge por status do faturamento. */
export function badgeStatusFaturamento(
  status: StatusFaturamento,
): 'success' | 'warning' | 'default' {
  switch (status) {
    case 'FECHADO':
      return 'success'
    case 'AGUARDANDO':
      return 'warning'
    default:
      return 'default'
  }
}
