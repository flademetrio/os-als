'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { ModalNovoVeiculo } from './modal-novo-veiculo'

type Props = {
  rotulo?: string
  size?: 'sm' | 'md' | 'lg'
}

/** Botao que abre o formulario de novo veiculo num drawer lateral. */
export function BotaoNovoVeiculo({ rotulo = '+ Novo veiculo', size = 'md' }: Props) {
  const [aberto, setAberto] = useState(false)

  return (
    <>
      <Button variant="primary" size={size} onClick={() => setAberto(true)}>
        {rotulo}
      </Button>
      {aberto && <ModalNovoVeiculo onClose={() => setAberto(false)} />}
    </>
  )
}
