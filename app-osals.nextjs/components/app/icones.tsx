/**
 * Icones inline SVG para a Sidebar e demais lugares.
 * Mantemos como componentes pra evitar dependencia de lib externa.
 */

type IconProps = { className?: string }

const base = 'w-4 h-4'
const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

export function IconeDashboard({ className }: IconProps) {
  return (
    <svg className={className ?? base} viewBox="0 0 24 24" {...stroke}>
      <path d="M3 13l9-9 9 9M5 11v9a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1v-9" />
    </svg>
  )
}

export function IconeServico({ className }: IconProps) {
  return (
    <svg className={className ?? base} viewBox="0 0 24 24" {...stroke}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M9 4v16M4 9h5M14 9h6M14 13h6M14 17h6" />
    </svg>
  )
}

export function IconeOS({ className }: IconProps) {
  return (
    <svg className={className ?? base} viewBox="0 0 24 24" {...stroke}>
      <path d="M7 4h10l3 3v13a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1h2" />
      <path d="M9 12l2 2 4-4M8 4h8a0 0 0 010 0v2a1 1 0 01-1 1H9a1 1 0 01-1-1V4z" />
    </svg>
  )
}

export function IconeCliente({ className }: IconProps) {
  return (
    <svg className={className ?? base} viewBox="0 0 24 24" {...stroke}>
      <rect x="4" y="3" width="16" height="18" rx="1" />
      <path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h8" />
    </svg>
  )
}

export function IconeEquipamento({ className }: IconProps) {
  return (
    <svg className={className ?? base} viewBox="0 0 24 24" {...stroke}>
      <rect x="3" y="6" width="18" height="9" rx="1" />
      <path d="M5 9h14M7 12h2M11 12h2M15 12h2M9 18v2M15 18v2M9 15v3M15 15v3" />
    </svg>
  )
}

export function IconeTecnico({ className }: IconProps) {
  return (
    <svg className={className ?? base} viewBox="0 0 24 24" {...stroke}>
      <circle cx="12" cy="8" r="3" />
      <path d="M5 21v-2a4 4 0 014-4h6a4 4 0 014 4v2" />
    </svg>
  )
}

export function IconeVeiculo({ className }: IconProps) {
  return (
    <svg className={className ?? base} viewBox="0 0 24 24" {...stroke}>
      <path d="M3 13l2-6h14l2 6M3 13v5h2a2 2 0 014 0h6a2 2 0 014 0h2v-5M3 13h18" />
      <circle cx="7" cy="18" r="1.5" />
      <circle cx="17" cy="18" r="1.5" />
    </svg>
  )
}

export function IconePecas({ className }: IconProps) {
  return (
    <svg className={className ?? base} viewBox="0 0 24 24" {...stroke}>
      <path d="M12 2l3 3-1 3 3 3-1 3 3 3-3 3-3-1-3 3-3-3 1-3-3-3 1-3-3-3 3-3 3 1z" />
    </svg>
  )
}

export function IconeRelatorios({ className }: IconProps) {
  return (
    <svg className={className ?? base} viewBox="0 0 24 24" {...stroke}>
      <path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

export function IconeConfiguracoes({ className }: IconProps) {
  return (
    <svg className={className ?? base} viewBox="0 0 24 24" {...stroke}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33h0a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v0a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  )
}

export function IconeMenu({ className }: IconProps) {
  return (
    <svg className={className ?? 'w-5 h-5'} viewBox="0 0 24 24" {...stroke}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}

export function IconeFechar({ className }: IconProps) {
  return (
    <svg className={className ?? 'w-5 h-5'} viewBox="0 0 24 24" {...stroke}>
      <path d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

export function IconeSair({ className }: IconProps) {
  return (
    <svg className={className ?? base} viewBox="0 0 24 24" {...stroke}>
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  )
}

export function IconeBusca({ className }: IconProps) {
  return (
    <svg className={className ?? base} viewBox="0 0 24 24" {...stroke}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  )
}

export function IconeRecolher({ className }: IconProps) {
  return (
    <svg className={className ?? base} viewBox="0 0 24 24" {...stroke}>
      <path d="M11 19l-7-7 7-7M19 19l-7-7 7-7" />
    </svg>
  )
}
