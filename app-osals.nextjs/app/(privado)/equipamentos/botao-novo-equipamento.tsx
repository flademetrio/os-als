'use client'

import { useState } from 'react'
import type { ClienteResumoDto } from '@/app/lib/definicoes'
import { Button } from '@/components/ui/Button'
import { ModalNovoEquipamento } from './modal-novo-equipamento'

type Props = {
  clientes: ClienteResumoDto[]
  rotulo?: string
  size?: 'sm' | 'md' | 'lg'
}

/** Botao que abre o formulario de novo equipamento num drawer lateral. */
export function BotaoNovoEquipamento({
  clientes,
  rotulo = '+ Novo equipamento',
  size = 'md',
}: Props) {
  const [aberto, setAberto] = useState(false)

  return (
    <>
      <Button variant="primary" size={size} onClick={() => setAberto(true)}>
        {rotulo}
      </Button>
      {aberto && (
        <ModalNovoEquipamento clientes={clientes} onClose={() => setAberto(false)} />
      )}
    </>
  )
}
