'use client'

import { useActionState, useEffect } from 'react'
import { adicionarNota, editarNota, type EstadoFaturamento } from '@/app/actions/faturamento'
import type { NotaFiscalResposta } from '@/app/lib/definicoes'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'

const ESTADO_INICIAL: EstadoFaturamento = {}

type Props = {
  servicoId: number
  /** Quando informado, edita a NF existente em vez de adicionar uma nova. */
  nota: NotaFiscalResposta | null
  onClose: () => void
}

function centavosParaCampo(centavos: number | null): string {
  if (centavos == null) return ''
  return (centavos / 100).toFixed(2).replace('.', ',')
}

export function ModalNotaFiscal({ servicoId, nota, onClose }: Props) {
  const editando = nota != null
  const acao = editando
    ? editarNota.bind(null, servicoId, nota.id)
    : adicionarNota.bind(null, servicoId)
  const [estado, dispatch, pendente] = useActionState(acao, ESTADO_INICIAL)

  const hoje = new Date()
  const dataHoje = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`

  useEffect(() => {
    if (estado.sucesso) onClose()
  }, [estado.sucesso, onClose])

  return (
    <Modal open onClose={onClose} title={editando ? 'Editar nota fiscal' : 'Adicionar nota fiscal'} size="md">
      <form action={dispatch} className="space-y-4">
        {estado.erro && (
          <Alert variant="danger" dismissible>
            {estado.erro}
          </Alert>
        )}

        <Input
          label="Numero da NF"
          name="numero"
          required
          defaultValue={nota?.numero ?? ''}
          error={estado.errosCampos?.numero}
          fullWidth
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Data de emissao"
            name="dataEmissao"
            type="date"
            required
            defaultValue={nota?.dataEmissao ?? dataHoje}
            error={estado.errosCampos?.dataEmissao}
            fullWidth
          />
          <Input
            label="Valor (R$)"
            name="valorReais"
            required
            placeholder="Ex.: 1.250,00"
            defaultValue={centavosParaCampo(nota?.valorCentavos ?? null)}
            error={estado.errosCampos?.valorReais}
            fullWidth
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={pendente}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" loading={pendente}>
            {pendente ? 'Salvando...' : editando ? 'Salvar' : 'Adicionar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
