'use client'

import { useActionState, useEffect } from 'react'
import {
  criarUnidadeMedida,
  type EstadoConfiguracao,
} from '@/app/actions/configuracao'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'

const ESTADO_INICIAL: EstadoConfiguracao = {}

export function ModalCriacaoUnidade({ aoFechar }: { aoFechar: () => void }) {
  const [estado, dispatch, pendente] = useActionState(
    criarUnidadeMedida,
    ESTADO_INICIAL,
  )

  useEffect(() => {
    if (estado.sucesso) {
      const t = setTimeout(aoFechar, 600)
      return () => clearTimeout(t)
    }
  }, [estado.sucesso, aoFechar])

  return (
    <Modal open onClose={aoFechar} title="Nova unidade de medida" size="sm">
      <form action={dispatch} className="space-y-4">
        {estado.erro && (
          <Alert variant="danger" dismissible>
            {estado.erro}
          </Alert>
        )}
        {estado.sucesso && (
          <Alert variant="success" dismissible>
            Unidade criada.
          </Alert>
        )}

        <Input
          label="Sigla"
          name="sigla"
          placeholder="un"
          error={estado.errosCampos?.sigla}
          required
          maxLength={8}
          fullWidth
        />
        <Input
          label="Nome"
          name="nome"
          placeholder="Unidade"
          error={estado.errosCampos?.nome}
          required
          fullWidth
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={aoFechar}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" loading={pendente}>
            {pendente ? 'Salvando...' : 'Criar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
