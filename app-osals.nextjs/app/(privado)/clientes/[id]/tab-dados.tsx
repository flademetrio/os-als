'use client'

import { useActionState } from 'react'
import { atualizarCliente, type EstadoAtualizacaoCliente } from '@/app/actions/cliente'
import type { ClienteResposta } from '@/app/lib/definicoes'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const ESTADO_INICIAL: EstadoAtualizacaoCliente = {}

export function TabDados({ cliente }: { cliente: ClienteResposta }) {
  const acaoVinculada = atualizarCliente.bind(null, cliente.id)
  const [estado, dispatch, pendente] = useActionState(acaoVinculada, ESTADO_INICIAL)

  return (
    <form action={dispatch} className="space-y-4 max-w-xl">
      {estado.erro && (
        <Alert variant="danger" dismissible>
          {estado.erro}
        </Alert>
      )}
      {estado.sucesso && (
        <Alert variant="success" dismissible>
          Dados atualizados com sucesso.
        </Alert>
      )}

      <Input
        label="Nome"
        name="nome"
        defaultValue={cliente.nome}
        required
        error={estado.errosCampos?.nome}
        fullWidth
      />
      {cliente.tipoPessoa === 'PJ' && (
        <Input
          label="Nome fantasia"
          name="nomeFantasia"
          defaultValue={cliente.nomeFantasia ?? ''}
          hint="Opcional"
          error={estado.errosCampos?.nomeFantasia}
          fullWidth
        />
      )}

      <div className="flex justify-end pt-2">
        <Button type="submit" variant="primary" loading={pendente} disabled={!cliente.ativo}>
          {pendente ? 'Salvando...' : 'Salvar alteracoes'}
        </Button>
      </div>

      {!cliente.ativo && (
        <p className="text-xs text-slate-500">
          Cliente inativo. Reative-o no topo da tela para editar.
        </p>
      )}
    </form>
  )
}
