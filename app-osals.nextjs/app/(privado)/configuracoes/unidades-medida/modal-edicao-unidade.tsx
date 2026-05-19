'use client'

import { useActionState, useEffect } from 'react'
import {
  atualizarUnidadeMedida,
  type EstadoConfiguracao,
} from '@/app/actions/configuracao'
import type { UnidadeMedidaResposta } from '@/app/lib/definicoes'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'

const ESTADO_INICIAL: EstadoConfiguracao = {}

export function ModalEdicaoUnidade({
  unidade,
  aoFechar,
}: {
  unidade: UnidadeMedidaResposta
  aoFechar: () => void
}) {
  const acao = atualizarUnidadeMedida.bind(null, unidade.id)
  const [estado, dispatch, pendente] = useActionState(acao, ESTADO_INICIAL)

  useEffect(() => {
    if (estado.sucesso) {
      const t = setTimeout(aoFechar, 600)
      return () => clearTimeout(t)
    }
  }, [estado.sucesso, aoFechar])

  return (
    <Modal open onClose={aoFechar} title={`Editar: ${unidade.sigla}`} size="sm">
      <form action={dispatch} className="space-y-4">
        {estado.erro && (
          <Alert variant="danger" dismissible>
            {estado.erro}
          </Alert>
        )}
        {estado.sucesso && (
          <Alert variant="success" dismissible>
            Unidade atualizada.
          </Alert>
        )}

        <Input
          label="Sigla"
          name="sigla"
          defaultValue={unidade.sigla}
          error={estado.errosCampos?.sigla}
          required
          maxLength={8}
          fullWidth
        />
        <Input
          label="Nome"
          name="nome"
          defaultValue={unidade.nome}
          error={estado.errosCampos?.nome}
          required
          fullWidth
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={aoFechar}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" loading={pendente}>
            {pendente ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
