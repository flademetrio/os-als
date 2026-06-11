'use client'

import { useActionState, useEffect } from 'react'
import { atualizarServico, type EstadoServico } from '@/app/actions/servico'
import { EMPRESA_SERVICO_LABEL } from '@/app/lib/esquemas/servico'
import type { ServicoResposta, TipoServicoResposta } from '@/app/lib/definicoes'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'

const ESTADO_INICIAL: EstadoServico = {}

type Props = {
  servico: ServicoResposta
  tipos: TipoServicoResposta[]
  onClose: () => void
}

export function ModalEditarServico({ servico, tipos, onClose }: Props) {
  const acao = atualizarServico.bind(null, servico.id)
  const [estado, dispatch, pendente] = useActionState(acao, ESTADO_INICIAL)

  useEffect(() => {
    if (estado.sucesso) onClose()
  }, [estado.sucesso, onClose])

  return (
    <Modal open onClose={onClose} title="Editar servico" size="lg">
      <form action={dispatch} className="space-y-4">
        {estado.erro && (
          <Alert variant="danger" dismissible>
            {estado.erro}
          </Alert>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Cliente" value={servico.clienteNome} fullWidth disabled readOnly />
          <Select
            label="Tipo de servico"
            name="tipoServicoId"
            required
            defaultValue={String(servico.tipoServicoId)}
            error={estado.errosCampos?.tipoServicoId}
            fullWidth
          >
            {tipos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome}
              </option>
            ))}
          </Select>
        </div>

        <Textarea
          label="Descricao"
          name="descricao"
          required
          rows={4}
          defaultValue={servico.descricao}
          error={estado.errosCampos?.descricao}
          fullWidth
        />

        <div className="sm:w-48">
          <Select
            label="Empresa"
            name="empresa"
            required
            defaultValue={servico.empresa}
            error={estado.errosCampos?.empresa}
            fullWidth
          >
            {Object.entries(EMPRESA_SERVICO_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Data de inicio prevista"
            name="dataInicioPrevista"
            type="date"
            defaultValue={servico.dataInicioPrevista ?? ''}
            error={estado.errosCampos?.dataInicioPrevista}
            fullWidth
          />
          <Input
            label="Data de fim prevista"
            name="dataFimPrevista"
            type="date"
            defaultValue={servico.dataFimPrevista ?? ''}
            error={estado.errosCampos?.dataFimPrevista}
            fullWidth
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={pendente}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" loading={pendente}>
            {pendente ? 'Salvando...' : 'Salvar alteracoes'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
