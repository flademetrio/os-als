'use client'

import { useRouter } from 'next/navigation'
import type { ClienteResumoDto } from '@/app/lib/definicoes'
import { ComboboxCliente } from '@/components/app/combobox-cliente'

export function SeletorCliente({
  clientes,
  clienteId,
}: {
  clientes: ClienteResumoDto[]
  clienteId: number | null
}) {
  const router = useRouter()
  return (
    <ComboboxCliente
      clientesIniciais={clientes}
      value={clienteId}
      onChange={(id) => router.push(`/relatorios/servico?clienteId=${id}`)}
      permitirCriar={false}
      required={false}
    />
  )
}
