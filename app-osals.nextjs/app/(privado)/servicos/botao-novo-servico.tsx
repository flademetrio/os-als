'use client'

import { useState } from 'react'
import type { ClienteResumoDto, TipoServicoResposta } from '@/app/lib/definicoes'
import { Button } from '@/components/ui/Button'
import { ModalNovoServico } from './modal-novo-servico'

type Props = {
  clientes: ClienteResumoDto[]
  tipos: TipoServicoResposta[]
  rotulo?: string
  size?: 'sm' | 'md' | 'lg'
}

/** Botao que abre o formulario de novo servico num drawer lateral. */
export function BotaoNovoServico({
  clientes,
  tipos,
  rotulo = '+ Novo servico',
  size,
}: Props) {
  const [aberto, setAberto] = useState(false)

  return (
    <>
      <Button variant="primary" size={size} onClick={() => setAberto(true)}>
        {rotulo}
      </Button>
      {aberto && (
        <ModalNovoServico
          clientes={clientes}
          tipos={tipos}
          onClose={() => setAberto(false)}
        />
      )}
    </>
  )
}
