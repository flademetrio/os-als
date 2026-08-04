'use client'

import type { OsPorPeriodoItem } from '@/app/lib/definicoes'
import { Button } from '@/components/ui/Button'

const FUSO = 'America/Sao_Paulo'
const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function diaSemana(dataIso: string): string {
  const [a, m, d] = dataIso.split('-').map(Number)
  return DIAS[new Date(a, m - 1, d).getDay()] ?? ''
}

function formatarData(dataIso: string): string {
  const [a, m, d] = dataIso.split('-')
  return d && m && a ? `${d}/${m}/${a}` : dataIso
}

function horaBR(isoStr: string | null): string | null {
  if (!isoStr) return null
  const dt = new Date(isoStr)
  if (Number.isNaN(dt.getTime())) return null
  return dt.toLocaleTimeString('pt-BR', { timeZone: FUSO, hour: '2-digit', minute: '2-digit' })
}

function execucao(l: OsPorPeriodoItem): string {
  const i = horaBR(l.horaInicioExecucao)
  const f = horaBR(l.horaFimExecucao)
  if (i && f) return `${i}-${f}`
  return l.statusRotulo
}

/** Envolve o valor em aspas e escapa aspas internas (CSV robusto p/ Excel). */
function celula(valor: string): string {
  return `"${(valor ?? '').replace(/"/g, '""')}"`
}

/**
 * Exporta o relatorio para um CSV que o Excel abre com colunas e acentos:
 * separador ';' (padrao pt-BR) e BOM UTF-8 (﻿).
 */
export function BotaoExportarExcel({
  linhas,
  inicio,
  fim,
}: {
  linhas: OsPorPeriodoItem[]
  inicio: string
  fim: string
}) {
  function exportar() {
    const cabecalho = [
      'Data',
      'Dia',
      'Cod',
      'Cliente',
      'Servico',
      'Atividade',
      'Tecnicos',
      'Veiculos',
      'Execucao',
    ]
    const corpo = linhas.map((l) =>
      [
        formatarData(l.data),
        diaSemana(l.data),
        l.codigoExibicao,
        l.clienteNome,
        l.servicoDescricao,
        l.atividade,
        l.tecnicos,
        l.veiculos,
        execucao(l),
      ]
        .map(celula)
        .join(';'),
    )
    const bom = String.fromCharCode(0xfeff)
    const conteudo = bom + [cabecalho.map(celula).join(';'), ...corpo].join('\r\n')

    const blob = new Blob([conteudo], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `os-por-periodo_${inicio}_a_${fim}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <Button variant="outline" size="sm" onClick={exportar} disabled={linhas.length === 0}>
      Exportar Excel
    </Button>
  )
}
