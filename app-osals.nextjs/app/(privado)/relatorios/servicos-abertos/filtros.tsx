'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import type { ClienteResumoDto, TipoServicoResposta } from '@/app/lib/definicoes'
import { Select } from '@/components/ui/Select'

type Props = {
  clienteId: string
  tipoServicoId: string
  clientes: ClienteResumoDto[]
  tipos: TipoServicoResposta[]
}

export function FiltrosServicosAbertos({ clienteId, tipoServicoId, clientes, tipos }: Props) {
  const router = useRouter()
  const params = useSearchParams()

  function definir(chave: string, valor: string) {
    const next = new URLSearchParams(params.toString())
    if (valor) next.set(chave, valor)
    else next.delete(chave)
    router.push(`/relatorios/servicos-abertos?${next.toString()}`)
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
    </div>
  )
}
