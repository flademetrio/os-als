/**
 * Conversao de valores monetarios no lado do cliente.
 *
 * Padrao do projeto: <b>centavos sempre</b> em transit e em todas as operacoes.
 * Conversao acontece somente na UI — display em reais.
 *
 * Ver documentacao/09 §8 e documentacao/15 §5.
 */

/**
 * Converte string em reais (com ou sem mascara) para centavos.
 *
 * "R$ 299,90"  -> 29990
 * "1.234,56"   -> 123456
 * "10"         -> 1000
 */
export function reaisParaCentavos(valor: string): number {
  if (!valor || !valor.trim()) {
    throw new Error('Valor em reais nao pode ser vazio')
  }
  const limpo = valor
    .replace(/R\$\s?/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
    .trim()
  return Math.round(parseFloat(limpo) * 100)
}

/**
 * Formata centavos como string de reais com prefixo "R$" e separadores pt-BR.
 *
 * 29990  -> "R$ 299,90"
 * 100    -> "R$ 1,00"
 */
export function centavosParaReais(centavos: number): string {
  return (centavos / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}
