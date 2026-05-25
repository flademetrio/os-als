'use client'

import { useRouter } from 'next/navigation'
import type { ClienteResumoDto } from '@/app/lib/definicoes'
import { Modal } from '@/components/ui/Modal'
import { FormularioNovoEquipamento } from './novo/formulario-novo-equipamento'

type Props = {
  clientes: ClienteResumoDto[]
  onClose: () => void
}

/** Drawer lateral com o formulario de novo equipamento. */
export function ModalNovoEquipamento({ clientes, onClose }: Props) {
  const router = useRouter()

  return (
    <Modal open onClose={onClose} title="Novo equipamento" size="lg">
      <FormularioNovoEquipamento
        clientes={clientes}
        onCancelar={onClose}
        onCriado={() => {
          onClose()
          router.refresh()
        }}
      />
    </Modal>
  )
}
