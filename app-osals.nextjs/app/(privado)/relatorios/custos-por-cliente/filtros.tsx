'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/Input'

type Props = {
  inicio: string
  fim: string
}

export function FiltrosCustosPorCliente({ inicio, fim }: Props) {
  const router = useRouter()
  const params = useSearchParams()

  function definir(chave: string, valor: string) {
    const next = new URLSearchParams(params.toString())
    if (valor) next.set(chave, valor)
    else next.delete(chave)
    router.push(`/relatorios/custos-por-cliente?${next.toString()}`)
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
      <Input
        label="Cadastro do servico — inicio"
        type="date"
        value={inicio}
        onChange={(e) => definir('inicio', e.target.value)}
        fullWidth
      />
      <Input
        label="Cadastro do servico — fim"
        type="date"
        value={fim}
        onChange={(e) => definir('fim', e.target.value)}
        fullWidth
      />
    </div>
  )
}
