'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import type { ClienteResumoDto, TecnicoResumoDto } from '@/app/lib/definicoes'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

type Props = {
  inicio: string
  fim: string
  clienteId: string
  tecnicoId: string
  clientes: ClienteResumoDto[]
  tecnicos: TecnicoResumoDto[]
}

export function FiltrosOsPorStatus({
  inicio,
  fim,
  clienteId,
  tecnicoId,
  clientes,
  tecnicos,
}: Props) {
  const router = useRouter()
  const params = useSearchParams()

  function definir(chave: string, valor: string) {
    const next = new URLSearchParams(params.toString())
    if (valor) next.set(chave, valor)
    else next.delete(chave)
    next.set('pagina', '0')
    router.push(`/relatorios/os-por-status?${next.toString()}`)
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <Input
        label="Abertura — inicio"
        type="date"
        value={inicio}
        onChange={(e) => definir('inicio', e.target.value)}
        fullWidth
      />
      <Input
        label="Abertura — fim"
        type="date"
        value={fim}
        onChange={(e) => definir('fim', e.target.value)}
        fullWidth
      />
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
        label="Tecnico"
        value={tecnicoId}
        onChange={(e) => definir('tecnicoId', e.target.value)}
        fullWidth
      >
        <option value="">Todos</option>
        {tecnicos.map((t) => (
          <option key={t.id} value={t.id}>
            {t.nome}
          </option>
        ))}
      </Select>
    </div>
  )
}
