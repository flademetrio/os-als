'use client'

import { useActionState, useEffect } from 'react'
import {
  criarCategoriaCusto,
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

/** Drawer para cadastrar uma categoria de custo nova (sempre tipo LIVRE). */
export function ModalNovaCategoriaCusto({ aoFechar }: Props) {
  const [estado, dispatch, pendente] = useActionState(
    criarCategoriaCusto,
    ESTADO_INICIAL,
  )

  useEffect(() => {
    if (estado.sucesso) aoFechar()
  }, [estado.sucesso, aoFechar])

  return (
    <Modal open onClose={aoFechar} title="Nova categoria de custo" size="sm">
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
          placeholder="Ex.: Frete, Aluguel de equipamento"
          hint="Categorias criadas pelo admin sempre entram como tipo LIVRE."
          error={estado.errosCampos?.nome}
          fullWidth
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={aoFechar} disabled={pendente}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" loading={pendente}>
            {pendente ? 'Salvando...' : 'Criar categoria'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
