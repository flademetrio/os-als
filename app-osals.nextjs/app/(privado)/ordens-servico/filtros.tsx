'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { STATUS_OS_LABEL } from '@/app/lib/esquemas/ordem-servico'
import { SearchBar } from '@/components/ui/SearchBar'
import { Select } from '@/components/ui/Select'

type Props = {
  busca: string
  status: string
}

export function FiltrosOrdensServico({ busca: buscaInicial, status }: Props) {
  const router = useRouter()
  const params = useSearchParams()
  const [busca, setBusca] = useState(buscaInicial)

  function navegar(mut: (p: URLSearchParams) => void) {
    const next = new URLSearchParams(params.toString())
    mut(next)
    next.set('pagina', '0')
    router.push(`/ordens-servico?${next.toString()}`)
  }

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
      <div className="flex-1">
        <SearchBar
          placeholder="Buscar por codigo ou atividade..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              navegar((p) => {
                if (busca.trim()) p.set('busca', busca.trim())
                else p.delete('busca')
              })
            }
          }}
          onBlur={() =>
            navegar((p) => {
              if (busca.trim()) p.set('busca', busca.trim())
              else p.delete('busca')
            })
          }
          fullWidth
        />
      </div>
      <div className="sm:w-56">
        <Select
          label="Status"
          value={status}
          onChange={(e) =>
            navegar((p) => {
              if (e.target.value) p.set('status', e.target.value)
              else p.delete('status')
            })
          }
          fullWidth
        >
          <option value="">Todos</option>
          {Object.entries(STATUS_OS_LABEL).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Select>
      </div>
    </div>
  )
}
