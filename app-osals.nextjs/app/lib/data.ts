/**
 * Helpers de data/hora. Padrao do projeto:
 *  - API/banco usam ISO-8601 UTC
 *  - UI exibe em America/Sao_Paulo
 */

const FUSO = 'America/Sao_Paulo'

const FMT_DATA = new Intl.DateTimeFormat('pt-BR', {
  timeZone: FUSO,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const FMT_DATA_HORA = new Intl.DateTimeFormat('pt-BR', {
  timeZone: FUSO,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

/** "2026-05-18" ou "2026-05-18T13:45:00" -> "18/05/2026" */
export function formatarData(iso: string | Date | null | undefined): string {
  if (!iso) return ''
  const d = typeof iso === 'string' ? new Date(iso) : iso
  return FMT_DATA.format(d)
}

/**
 * Formata uma data pura "YYYY-MM-DD" (coluna DATE) como "DD/MM/AAAA" sem
 * conversao de fuso. Use isto — e nao formatarData() — para campos DATE, pois
 * `new Date("2026-05-18")` vira meia-noite UTC e desloca o dia em America/Sao_Paulo.
 */
export function formatarDataIso(iso: string | null | undefined): string {
  if (!iso) return ''
  const [ano, mes, dia] = iso.split('-')
  return dia && mes && ano ? `${dia}/${mes}/${ano}` : iso
}

/** "2026-05-18T13:45:00" -> "18/05/2026 13:45" */
export function formatarDataHora(iso: string | Date | null | undefined): string {
  if (!iso) return ''
  const d = typeof iso === 'string' ? new Date(iso) : iso
  return FMT_DATA_HORA.format(d)
}
