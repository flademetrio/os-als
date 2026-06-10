'use client'

import { useRouter } from 'next/navigation'
import { useActionState, useEffect } from 'react'
import { atualizarCliente, type EstadoAtualizacaoCliente } from '@/app/actions/cliente'
import type { ClienteResposta } from '@/app/lib/definicoes'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const ESTADO_INICIAL: EstadoAtualizacaoCliente = {}

export function TabDados({
  cliente,
  podeEditar = true,
}: {
  cliente: ClienteResposta
  podeEditar?: boolean
}) {
  const router = useRouter()
  const acaoVinculada = atualizarCliente.bind(null, cliente.id)
  const [estado, dispatch, pendente] = useActionState(acaoVinculada, ESTADO_INICIAL)

  useEffect(() => {
    if (estado.sucesso) router.push('/clientes')
  }, [estado.sucesso, router])

  return (
    <form action={dispatch} className="space-y-4 max-w-xl">
      {estado.erro && (
        <Alert variant="danger" dismissible>
          {estado.erro}
        </Alert>
      )}

      <Input
        label="Nome"
        name="nome"
        defaultValue={cliente.nome}
        required
        disabled={!podeEditar}
        error={estado.errosCampos?.nome}
        fullWidth
      />
      {cliente.tipoPessoa === 'PJ' && (
        <Input
          label="Nome fantasia"
          name="nomeFantasia"
          defaultValue={cliente.nomeFantasia ?? ''}
          hint="Opcional"
          disabled={!podeEditar}
          error={estado.errosCampos?.nomeFantasia}
          fullWidth
        />
      )}

      {podeEditar && (
        <div className="flex justify-end pt-2">
          <Button type="submit" variant="primary" loading={pendente} disabled={!cliente.ativo}>
            {pendente ? 'Salvando...' : 'Salvar alteracoes'}
          </Button>
        </div>
      )}

      {podeEditar && !cliente.ativo && (
        <p className="text-xs text-slate-500">
          Cliente inativo. Reative-o no topo da tela para editar.
        </p>
      )}
    </form>
  )
}
