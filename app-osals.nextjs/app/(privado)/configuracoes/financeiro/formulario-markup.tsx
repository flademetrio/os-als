'use client'

import { useActionState } from 'react'
import {
  atualizarConfiguracao,
  type EstadoConfiguracao,
} from '@/app/actions/configuracao'
import type { ConfiguracaoResposta } from '@/app/lib/definicoes'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const ESTADO_INICIAL: EstadoConfiguracao = {}

export function FormularioMarkup({
  configuracao,
}: {
  configuracao: ConfiguracaoResposta
}) {
  const acao = atualizarConfiguracao.bind(null, configuracao.chave)
  const [estado, dispatch, pendente] = useActionState(acao, ESTADO_INICIAL)

  return (
    <form action={dispatch} className="space-y-4">
      {estado.erro && (
        <Alert variant="danger" dismissible>
          {estado.erro}
        </Alert>
      )}
      {estado.sucesso && (
        <Alert variant="success" dismissible>
          Markup atualizado.
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] items-end gap-3">
        <Input
          label="Markup (%)"
          name="valor"
          type="number"
          step="0.01"
          min={0}
          defaultValue={configuracao.valor}
          error={estado.errosCampos?.valor}
          fullWidth
        />
        <Button type="submit" variant="primary" loading={pendente}>
          {pendente ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>

      {configuracao.updatedAt && (
        <p className="text-xs text-slate-400">
          Ultima alteracao em {new Date(configuracao.updatedAt).toLocaleString('pt-BR')}
          {configuracao.updatedByNome && ` por ${configuracao.updatedByNome}`}.
        </p>
      )}
    </form>
  )
}
