'use client'

import type { ClienteResumoDto, TipoServicoResposta } from '@/app/lib/definicoes'
import { Modal } from '@/components/ui/Modal'
import { FormularioNovoServico } from './novo/formulario-novo-servico'

type Props = {
  clientes: ClienteResumoDto[]
  tipos: TipoServicoResposta[]
  onClose: () => void
}

/** Drawer lateral com o formulario de novo servico, aberto a partir da listagem. */
export function ModalNovoServico({ clientes, tipos, onClose }: Props) {
  return (
    <Modal open onClose={onClose} title="Novo servico" size="lg">
      <FormularioNovoServico clientes={clientes} tipos={tipos} onCancelar={onClose} />
    </Modal>
  )
}
