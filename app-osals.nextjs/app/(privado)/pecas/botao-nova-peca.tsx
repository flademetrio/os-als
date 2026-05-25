'use client'

import { useState } from 'react'
import type { UnidadeMedidaResposta } from '@/app/lib/definicoes'
import { Button } from '@/components/ui/Button'
import { ModalNovaPeca } from './modal-nova-peca'

type Props = {
  unidadesMedida: UnidadeMedidaResposta[]
  rotulo?: string
  size?: 'sm' | 'md' | 'lg'
}

/** Botao que abre o formulario de nova peca num drawer lateral. */
export function BotaoNovaPeca({
  unidadesMedida,
  rotulo = '+ Nova peca',
  size = 'md',
}: Props) {
  const [aberto, setAberto] = useState(false)

  return (
    <>
      <Button variant="primary" size={size} onClick={() => setAberto(true)}>
        {rotulo}
      </Button>
      {aberto && (
        <ModalNovaPeca unidadesMedida={unidadesMedida} onClose={() => setAberto(false)} />
      )}
    </>
  )
}
