'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { ModalNovoTecnico } from './modal-novo-tecnico'

type Props = {
  rotulo?: string
  size?: 'sm' | 'md' | 'lg'
}

/** Botao que abre o formulario de novo tecnico num drawer lateral. */
export function BotaoNovoTecnico({ rotulo = '+ Novo tecnico', size = 'md' }: Props) {
  const [aberto, setAberto] = useState(false)

  return (
    <>
      <Button variant="primary" size={size} onClick={() => setAberto(true)}>
        {rotulo}
      </Button>
      {aberto && <ModalNovoTecnico onClose={() => setAberto(false)} />}
    </>
  )
}
