'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import type { ClienteResumoDto, TipoServicoResposta } from '@/app/lib/definicoes'
import { STATUS_SERVICO_LABEL } from '@/app/lib/esquemas/servico'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

type Props = {
  inicio: string
  fim: string
  clienteId: string
  tipoServicoId: string
  status: string
  clientes: ClienteResumoDto[]
  tipos: TipoServicoResposta[]
}

export function FiltrosCustosPorServico({
  inicio,
  fim,
  clienteId,
  tipoServicoId,
  status,
  clientes,
  tipos,
}: Props) {
  const router = useRouter()
  const params = useSearchParams()

  function definir(chave: string, valor: string) {
    const next = new URLSearchParams(params.toString())
    if (valor) next.set(chave, valor)
    else next.delete(chave)
    next.set('pagina', '0')
    router.push(`/relatorios/custos-por-servico?${next.toString()}`)
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      <Input
        label="Cadastro — inicio"
        type="date"
        value={inicio}
        onChange={(e) => definir('inicio', e.target.value)}
        fullWidth
      />
      <Input
        label="Cadastro — fim"
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
        label="Tipo"
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
    </div>
  )
}
