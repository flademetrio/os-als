'use client'

import { useActionState } from 'react'
import {
  atualizarValorKm,
  type EstadoConfiguracao,
} from '@/app/actions/configuracao'
import type { ConfiguracaoResposta } from '@/app/lib/definicoes'
import { centavosParaReais } from '@/app/lib/moeda'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const ESTADO_INICIAL: EstadoConfiguracao = {}

export function FormularioValorKm({
  configuracao,
}: {
  configuracao: ConfiguracaoResposta
}) {
  const [estado, dispatch, pendente] = useActionState(
    atualizarValorKm,
    ESTADO_INICIAL,
  )
  const centavos = Number(configuracao.valor || '0')
  const valorReaisInicial = (centavos / 100)
    .toFixed(2)
    .replace('.', ',')

  return (
    <form action={dispatch} className="space-y-4">
      {estado.erro && (
        <Alert variant="danger" dismissible>
          {estado.erro}
        </Alert>
      )}
      {estado.sucesso && (
        <Alert variant="success" dismissible>
          Valor por km atualizado.
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] items-end gap-3">
        <Input
          label="Valor por km (R$)"
          name="valorReais"
          defaultValue={valorReaisInicial}
          placeholder="2,50"
          error={estado.errosCampos?.valorReais}
          hint={`Atual: ${centavosParaReais(centavos)}`}
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
