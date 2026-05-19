'use client'

import { useActionState, useEffect } from 'react'
import {
  atualizarUnidade,
  criarUnidade,
  type EstadoUnidade,
} from '@/app/actions/unidade'
import type { UnidadeResposta } from '@/app/lib/definicoes'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'

type Props = {
  clienteId: number
  unidade: UnidadeResposta | null
  onClose: () => void
}

const ESTADO_INICIAL: EstadoUnidade = {}

export function ModalUnidade({ clienteId, unidade, onClose }: Props) {
  const acao = unidade
    ? atualizarUnidade.bind(null, clienteId, unidade.id)
    : criarUnidade.bind(null, clienteId)
  const [estado, dispatch, pendente] = useActionState(acao, ESTADO_INICIAL)

  // Fecha modal quando salva com sucesso
  useEffect(() => {
    if (estado.sucesso) onClose()
  }, [estado.sucesso, onClose])

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={unidade ? 'Editar unidade' : 'Nova unidade'}
      size="lg"
    >
      <form action={dispatch} className="space-y-4" id="form-unidade">
        {estado.erro && (
          <Alert variant="danger" dismissible>
            {estado.erro}
          </Alert>
        )}

        <Input
          label="Identificacao interna"
          name="identificacaoInterna"
          defaultValue={unidade?.identificacaoInterna ?? ''}
          required
          hint="Ex.: Matriz, Filial Centro, Loja 4"
          error={estado.errosCampos?.identificacaoInterna}
          fullWidth
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="CEP"
            name="cep"
            defaultValue={unidade?.cep ?? ''}
            placeholder="00000000"
            error={estado.errosCampos?.cep}
            fullWidth
          />
          <div className="sm:col-span-2">
            <Input
              label="Logradouro"
              name="logradouro"
              defaultValue={unidade?.logradouro ?? ''}
              error={estado.errosCampos?.logradouro}
              fullWidth
            />
          </div>
          <Input
            label="Numero"
            name="numero"
            defaultValue={unidade?.numero ?? ''}
            error={estado.errosCampos?.numero}
            fullWidth
          />
          <div className="sm:col-span-2">
            <Input
              label="Complemento"
              name="complemento"
              defaultValue={unidade?.complemento ?? ''}
              error={estado.errosCampos?.complemento}
              fullWidth
            />
          </div>
          <Input
            label="Bairro"
            name="bairro"
            defaultValue={unidade?.bairro ?? ''}
            error={estado.errosCampos?.bairro}
            fullWidth
          />
          <Input
            label="Cidade"
            name="cidade"
            defaultValue={unidade?.cidade ?? ''}
            error={estado.errosCampos?.cidade}
            fullWidth
          />
          <Input
            label="UF"
            name="estado"
            defaultValue={unidade?.estado ?? ''}
            placeholder="SP"
            maxLength={2}
            error={estado.errosCampos?.estado}
            fullWidth
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={pendente}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" loading={pendente}>
            {pendente ? 'Salvando...' : unidade ? 'Salvar alteracoes' : 'Criar unidade'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
