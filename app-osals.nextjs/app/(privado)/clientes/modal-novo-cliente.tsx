'use client'

import { Modal } from '@/components/ui/Modal'
import { FormularioNovoCliente } from './novo/formulario-novo-cliente'

type Props = {
  onClose: () => void
}

/** Drawer lateral com o formulario de novo cliente, aberto a partir da listagem. */
export function ModalNovoCliente({ onClose }: Props) {
  return (
    <Modal open onClose={onClose} title="Novo cliente" size="md">
      <FormularioNovoCliente onCancelar={onClose} />
    </Modal>
  )
}
