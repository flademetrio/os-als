'use client'

import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'
import { FormularioNovoVeiculo } from './novo/formulario-novo-veiculo'

type Props = {
  onClose: () => void
}

/** Drawer lateral com o formulario de novo veiculo. */
export function ModalNovoVeiculo({ onClose }: Props) {
  const router = useRouter()

  return (
    <Modal open onClose={onClose} title="Novo veiculo" size="md">
      <FormularioNovoVeiculo
        onCancelar={onClose}
        onCriado={() => {
          onClose()
          router.refresh()
        }}
      />
    </Modal>
  )
}
