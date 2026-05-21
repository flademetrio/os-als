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
 * botao "+ Novo" e o painel de filtros recolhivel.
 *
 * O toggle "Filtro" (Nao/Sim) controla o painel: "Sim" mostra as caixas;
 * voltar para "Nao" limpa todos os filtros e esconde as caixas.
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

  function fecharLimpar() {
    if (!aberto) return
    // Mantem apenas a visao escolhida; descarta os filtros.
    const next = new URLSearchParams()
    const v = params.get('vista')
    if (v) next.set('vista', v)
    const qs = next.toString()
    router.push(qs ? `/servicos?${qs}` : '/servicos')
    setAberto(false)
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
          <div className="inline-flex rounded-lg border border-slate-200 p-0.5">
            <Segmento ativo={!aberto} onClick={fecharLimpar} rotulo="Sem filtro" />
            <Segmento ativo={aberto} onClick={() => setAberto(true)} rotulo="Com filtro" />
          </div>
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

function Segmento({
  ativo,
  onClick,
  rotulo,
}: {
  ativo: boolean
  onClick: () => void
  rotulo: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      className={[
        'px-3 py-1 text-xs font-medium rounded-md transition-colors',
        ativo ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100',
      ].join(' ')}
    >
      {rotulo}
    </button>
  )
}
