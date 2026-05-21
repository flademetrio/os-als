'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import type { ClienteResumoDto, TipoServicoResposta } from '@/app/lib/definicoes'
import { STATUS_SERVICO_LABEL } from '@/app/lib/esquemas/servico'
import { Input } from '@/components/ui/Input'
import { SearchBar } from '@/components/ui/SearchBar'
import { Select } from '@/components/ui/Select'

type Props = {
  busca: string
  status: string
  clienteId: string
  tipoServicoId: string
  inicio: string
  fim: string
  clientes: ClienteResumoDto[]
  tipos: TipoServicoResposta[]
}

export function FiltrosServicos({
  busca: buscaInicial,
  status,
  clienteId,
  tipoServicoId,
  inicio,
  fim,
  clientes,
  tipos,
}: Props) {
  const router = useRouter()
  const params = useSearchParams()
  const [busca, setBusca] = useState(buscaInicial)

  function navegar(mut: (p: URLSearchParams) => void) {
    const next = new URLSearchParams(params.toString())
    mut(next)
    next.set('pagina', '0')
    router.push(`/servicos?${next.toString()}`)
  }

  function definir(chave: string, valor: string) {
    navegar((p) => {
      if (valor) p.set(chave, valor)
      else p.delete(chave)
    })
  }

  function aplicarBusca() {
    definir('busca', busca.trim())
  }

  return (
    <div className="space-y-3">
      <SearchBar
        placeholder="Buscar por numero ou descricao..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') aplicarBusca()
        }}
        onBlur={aplicarBusca}
        fullWidth
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Select
          label="Status"
          value={status}
          onChange={(e) => definir('status', e.target.value)}
          fullWidth
        >
          <option value="">Todos</option>
          {Object.entries(STATUS_SERVICO_LABEL).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Select>
        <Select
          label="Cliente"
          value={clienteId}
          onChange={(e) => definir('clienteId', e.target.value)}
          fullWidth
        >
          <option value="">Todos</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </Select>
        <Select
          label="Tipo de servico"
          value={tipoServicoId}
          onChange={(e) => definir('tipoServicoId', e.target.value)}
          fullWidth
        >
          <option value="">Todos</option>
          {tipos.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome}
            </option>
          ))}
        </Select>
        <div className="grid grid-cols-2 gap-2">
          <Input
            label="Inicio"
            type="date"
            value={inicio}
            onChange={(e) => definir('inicio', e.target.value)}
            fullWidth
          />
          <Input
            label="Fim"
            type="date"
            value={fim}
            onChange={(e) => definir('fim', e.target.value)}
            fullWidth
          />
        </div>
      </div>
    </div>
  )
}
