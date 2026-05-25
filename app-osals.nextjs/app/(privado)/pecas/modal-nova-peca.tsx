'use client'

import { useRouter } from 'next/navigation'
import type { UnidadeMedidaResposta } from '@/app/lib/definicoes'
import { Modal } from '@/components/ui/Modal'
import { FormularioPeca } from './formulario-peca'

type Props = {
  unidadesMedida: UnidadeMedidaResposta[]
  onClose: () => void
}

/** Drawer lateral com o formulario de nova peca. */
export function ModalNovaPeca({ unidadesMedida, onClose }: Props) {
  const router = useRouter()

  return (
    <Modal open onClose={onClose} title="Nova peca" size="md">
      <FormularioPeca
        peca={null}
        unidadesMedida={unidadesMedida}
        onCancelar={onClose}
        onCriado={() => {
          onClose()
          router.refresh()
        }}
      />
    </Modal>
  )
}
