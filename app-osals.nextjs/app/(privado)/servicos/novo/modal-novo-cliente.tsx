'use client'

import { useActionState, useEffect, useState } from 'react'
import {
  criarClienteRetornando,
  type EstadoNovoClienteModal,
} from '@/app/actions/cliente'
import type { ClienteResposta } from '@/app/lib/definicoes'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { InputDocumento } from '@/components/ui/InputDocumento'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'

const ESTADO_INICIAL: EstadoNovoClienteModal = {}

type Props = {
  onCriado: (cliente: ClienteResposta) => void
  onClose: () => void
}

/** Drawer lateral para cadastrar um cliente sem sair do formulario de servico. */
export function ModalNovoCliente({ onCriado, onClose }: Props) {
  const [estado, dispatch, pendente] = useActionState(criarClienteRetornando, ESTADO_INICIAL)
  const [tipoPessoa, setTipoPessoa] = useState<'PF' | 'PJ'>('PJ')

  useEffect(() => {
    if (estado.cliente) onCriado(estado.cliente)
  }, [estado.cliente, onCriado])

  return (
    <Modal open onClose={onClose} title="Novo cliente" size="md">
      <form action={dispatch} className="space-y-4">
        {estado.erro && (
          <Alert variant="danger" dismissible>
            {estado.erro}
          </Alert>
        )}

        <Select
          label="Tipo de pessoa"
          name="tipoPessoa"
          required
          value={tipoPessoa}
          onChange={(e) => setTipoPessoa(e.target.value as 'PF' | 'PJ')}
          error={estado.errosCampos?.tipoPessoa}
          fullWidth
        >
          <option value="PJ">PJ — Pessoa Juridica</option>
          <option value="PF">PF — Pessoa Fisica</option>
        </Select>

        <InputDocumento tipoPessoa={tipoPessoa} error={estado.errosCampos?.documento} />

        <Input
          label={tipoPessoa === 'PJ' ? 'Razao social' : 'Nome completo'}
          name="nome"
          required
          error={estado.errosCampos?.nome}
          fullWidth
        />

        {tipoPessoa === 'PJ' && (
          <Input
            label="Nome fantasia"
            name="nomeFantasia"
            hint="Opcional"
            error={estado.errosCampos?.nomeFantasia}
            fullWidth
          />
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={pendente}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" loading={pendente}>
            {pendente ? 'Salvando...' : 'Criar cliente'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
