'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { ModalNovoCliente } from './modal-novo-cliente'

type Props = {
  rotulo?: string
  size?: 'sm' | 'md' | 'lg'
}

/** Botao que abre o formulario de novo cliente num drawer lateral. */
export function BotaoNovoCliente({ rotulo = '+ Novo cliente', size = 'md' }: Props) {
  const [aberto, setAberto] = useState(false)

  return (
    <>
      <Button variant="primary" size={size} onClick={() => setAberto(true)}>
        {rotulo}
      </Button>
      {aberto && <ModalNovoCliente onClose={() => setAberto(false)} />}
    </>
  )
}
