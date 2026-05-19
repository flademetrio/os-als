'use client'

import { useActionState, useEffect } from 'react'
import {
  atualizarTipoServico,
  type EstadoConfiguracao,
} from '@/app/actions/configuracao'
import type { TipoServicoResposta } from '@/app/lib/definicoes'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'

const ESTADO_INICIAL: EstadoConfiguracao = {}

export function ModalEdicaoTipoServico({
  tipo,
  aoFechar,
}: {
  tipo: TipoServicoResposta
  aoFechar: () => void
}) {
  const acao = atualizarTipoServico.bind(null, tipo.id)
  const [estado, dispatch, pendente] = useActionState(acao, ESTADO_INICIAL)

  useEffect(() => {
    if (estado.sucesso) {
      const t = setTimeout(aoFechar, 600)
      return () => clearTimeout(t)
    }
  }, [estado.sucesso, aoFechar])

  return (
    <Modal open onClose={aoFechar} title={`Editar: ${tipo.nome}`} size="sm">
      <form action={dispatch} className="space-y-4" id={`form-tipo-${tipo.id}`}>
        {estado.erro && (
          <Alert variant="danger" dismissible>
            {estado.erro}
          </Alert>
        )}
        {estado.sucesso && (
          <Alert variant="success" dismissible>
            Tipo atualizado.
          </Alert>
        )}

        <Input
          label="Nome"
          name="nome"
          defaultValue={tipo.nome}
          error={estado.errosCampos?.nome}
          required
          fullWidth
        />

        <Checkbox label="Ativo" name="ativo" defaultChecked={tipo.ativo} />

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
