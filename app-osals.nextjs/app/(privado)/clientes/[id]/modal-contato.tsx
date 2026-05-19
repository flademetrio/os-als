'use client'

import { useActionState, useEffect } from 'react'
import {
  atualizarContato,
  criarContato,
  type EstadoContato,
} from '@/app/actions/contato'
import type { ContatoClienteResposta } from '@/app/lib/definicoes'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'

type Props = {
  clienteId: number
  contato: ContatoClienteResposta | null
  onClose: () => void
}

const ESTADO_INICIAL: EstadoContato = {}

export function ModalContato({ clienteId, contato, onClose }: Props) {
  const acao = contato
    ? atualizarContato.bind(null, clienteId, contato.id)
    : criarContato.bind(null, clienteId)
  const [estado, dispatch, pendente] = useActionState(acao, ESTADO_INICIAL)

  useEffect(() => {
    if (estado.sucesso) onClose()
  }, [estado.sucesso, onClose])

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={contato ? 'Editar contato' : 'Novo contato'}
      size="md"
    >
      <form action={dispatch} className="space-y-4">
        {estado.erro && (
          <Alert variant="danger" dismissible>
            {estado.erro}
          </Alert>
        )}

        <Input
          label="Nome"
          name="nome"
          defaultValue={contato?.nome ?? ''}
          required
          error={estado.errosCampos?.nome}
          fullWidth
        />
        <Input
          label="Funcao"
          name="funcao"
          defaultValue={contato?.funcao ?? ''}
          hint='Ex.: "Responsavel tecnico", "Diretor"'
          error={estado.errosCampos?.funcao}
          fullWidth
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Telefone"
            name="telefone"
            defaultValue={contato?.telefone ?? ''}
            error={estado.errosCampos?.telefone}
            fullWidth
          />
          <Input
            label="E-mail"
            name="email"
            type="email"
            defaultValue={contato?.email ?? ''}
            error={estado.errosCampos?.email}
            fullWidth
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={pendente}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" loading={pendente}>
            {pendente ? 'Salvando...' : contato ? 'Salvar alteracoes' : 'Criar contato'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
