'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { FiltrosServicos } from './filtros'
import { SeletorVista } from './seletor-vista'

type Props = {
  total: number
  vista: 'lista' | 'cards'
  busca: string
  situacao: string
  inicio: string
  fim: string
  /** Indica se ha algum filtro aplicado (define se o painel ja abre aberto). */
  temFiltroAtivo: boolean
}

/**
 * Cabecalho da listagem de servicos: titulo, contador, seletor de visao,
 * botao "+ Novo" e o painel de filtros — recolhivel pelo botao "Filtro".
 *
 * Fechado: filtros escondidos. Abrir: as caixas surgem abaixo. Clicar de
 * novo: limpa todos os filtros e esconde as caixas.
 */
export function CabecalhoServicos({
  total,
  vista,
  busca,
  situacao,
  inicio,
  fim,
  temFiltroAtivo,
}: Props) {
  const router = useRouter()
  const params = useSearchParams()
  const [aberto, setAberto] = useState(temFiltroAtivo)

  function alternarFiltro() {
    if (aberto) {
      // Fecha e limpa tudo (mantem apenas a visao escolhida).
      const next = new URLSearchParams()
      const v = params.get('vista')
      if (v) next.set('vista', v)
      const qs = next.toString()
      router.push(qs ? `/servicos?${qs}` : '/servicos')
      setAberto(false)
    } else {
      setAberto(true)
    }
  }

  return (
    <Card padding="md">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Servicos</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {total} {total === 1 ? 'servico' : 'servicos'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant={aberto ? 'primary' : 'secondary'}
            size="sm"
            onClick={alternarFiltro}
            aria-expanded={aberto}
          >
            Filtro
          </Button>
          <SeletorVista vista={vista} />
          <Link href="/servicos/novo">
            <Button variant="primary">+ Novo servico</Button>
          </Link>
        </div>
      </div>

      {aberto && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <FiltrosServicos busca={busca} situacao={situacao} inicio={inicio} fim={fim} />
        </div>
      )}
    </Card>
  )
}
