'use client'

import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'
import { FormularioNovoTecnico } from './novo/formulario-novo-tecnico'

type Props = {
  onClose: () => void
}

/** Drawer lateral com o formulario de novo tecnico. */
export function ModalNovoTecnico({ onClose }: Props) {
  const router = useRouter()

  return (
    <Modal open onClose={onClose} title="Novo tecnico" size="md">
      <FormularioNovoTecnico
        onCancelar={onClose}
        onCriado={() => {
          onClose()
          router.refresh()
        }}
      />
    </Modal>
  )
}
