'use client'

import { useActionState, useEffect } from 'react'
import {
  atualizarCategoriaCusto,
  type EstadoConfiguracao,
} from '@/app/actions/configuracao'
import type { CategoriaCustoResposta } from '@/app/lib/definicoes'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'

const ESTADO_INICIAL: EstadoConfiguracao = {}

export function ModalEdicaoCategoriaCusto({
  categoria,
  aoFechar,
}: {
  categoria: CategoriaCustoResposta
  aoFechar: () => void
}) {
  const acao = atualizarCategoriaCusto.bind(null, categoria.id)
  const [estado, dispatch, pendente] = useActionState(acao, ESTADO_INICIAL)

  useEffect(() => {
    if (estado.sucesso) {
      const t = setTimeout(aoFechar, 600)
      return () => clearTimeout(t)
    }
  }, [estado.sucesso, aoFechar])

  return (
    <Modal open onClose={aoFechar} title={`Editar: ${categoria.nome}`} size="sm">
      <form action={dispatch} className="space-y-4">
        {estado.erro && (
          <Alert variant="danger" dismissible>
            {estado.erro}
          </Alert>
        )}
        {estado.sucesso && (
          <Alert variant="success" dismissible>
            Categoria atualizada.
          </Alert>
        )}

        <Input
          label="Nome"
          name="nome"
          defaultValue={categoria.nome}
          error={estado.errosCampos?.nome}
          required
          fullWidth
        />

        <div className="text-xs text-slate-500 space-y-1">
          <p>
            Codigo: <span className="font-mono text-slate-700">{categoria.codigo}</span>{' '}
            <span className="text-slate-400">(imutavel)</span>
          </p>
          <p>
            Tipo de lancamento:{' '}
            <span className="font-medium text-slate-700">{categoria.tipoLancamento}</span>{' '}
            <span className="text-slate-400">(imutavel)</span>
          </p>
        </div>

        <Checkbox label="Ativa" name="ativo" defaultChecked={categoria.ativo} />

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
