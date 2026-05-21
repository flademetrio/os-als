'use client'

import { useState } from 'react'
import type {
  EquipamentoResumoDto,
  TecnicoResumoDto,
  VeiculoResumoDto,
} from '@/app/lib/definicoes'
import { Button } from '@/components/ui/Button'
import { ModalAbrirOs } from './modal-abrir-os'

type Props = {
  servicoId: number
  tecnicos: TecnicoResumoDto[]
  veiculos: VeiculoResumoDto[]
  equipamentos: EquipamentoResumoDto[]
}

/** Botao do cabecalho do servico para abrir uma nova OS — sempre visivel. */
export function BotaoAbrirOs({ servicoId, tecnicos, veiculos, equipamentos }: Props) {
  const [aberto, setAberto] = useState(false)

  return (
    <>
      <Button variant="primary" size="sm" onClick={() => setAberto(true)}>
        + Nova OS
      </Button>
      {aberto && (
        <ModalAbrirOs
          servicoId={servicoId}
          tecnicos={tecnicos}
          veiculos={veiculos}
          equipamentos={equipamentos}
          onClose={() => setAberto(false)}
        />
      )}
    </>
  )
}
