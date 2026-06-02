'use client'

import { useActionState, useEffect } from 'react'
import {
  criarTipoServico,
  type EstadoConfiguracao,
} from '@/app/actions/configuracao'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'

const ESTADO_INICIAL: EstadoConfiguracao = {}

type Props = {
  aoFechar: () => void
}

/** Drawer para cadastrar um tipo de servico novo. */
export function ModalNovoTipoServico({ aoFechar }: Props) {
  const [estado, dispatch, pendente] = useActionState(
    criarTipoServico,
    ESTADO_INICIAL,
  )

  useEffect(() => {
    if (estado.sucesso) aoFechar()
  }, [estado.sucesso, aoFechar])

  return (
    <Modal open onClose={aoFechar} title="Novo tipo de servico" size="sm">
      <form action={dispatch} className="space-y-4">
        {estado.erro && (
          <Alert variant="danger" dismissible>
            {estado.erro}
          </Alert>
        )}

        <Input
          label="Nome"
          name="nome"
          required
          placeholder="Ex.: Diagnostico, Vistoria tecnica"
          error={estado.errosCampos?.nome}
          fullWidth
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={aoFechar} disabled={pendente}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" loading={pendente}>
            {pendente ? 'Salvando...' : 'Criar tipo'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
