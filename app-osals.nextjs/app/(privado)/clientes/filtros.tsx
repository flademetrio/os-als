'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Checkbox } from '@/components/ui/Checkbox'
import { SearchBar } from '@/components/ui/SearchBar'

type Props = {
  busca: string
  apenasAtivos: boolean
}

export function FiltrosClientes({ busca: buscaInicial, apenasAtivos }: Props) {
  const router = useRouter()
  const params = useSearchParams()
  const [busca, setBusca] = useState(buscaInicial)

  function atualizarBusca() {
    const next = new URLSearchParams(params.toString())
    if (busca.trim()) next.set('busca', busca.trim())
    else next.delete('busca')
    next.set('pagina', '0')
    router.push(`/clientes?${next.toString()}`)
  }

  function alternarAtivos(novoValor: boolean) {
    const next = new URLSearchParams(params.toString())
    if (novoValor) next.delete('apenasAtivos')
    else next.set('apenasAtivos', 'false')
    next.set('pagina', '0')
    router.push(`/clientes?${next.toString()}`)
  }

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
      <SearchBar
        placeholder="Buscar por nome ou documento..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') atualizarBusca()
        }}
        onBlur={atualizarBusca}
        fullWidth
      />
      <div className="shrink-0">
        <Checkbox
          label="Apenas ativos"
          checked={apenasAtivos}
          onChange={(e) => alternarAtivos(e.target.checked)}
        />
      </div>
    </div>
  )
}
