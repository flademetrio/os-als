'use client'

import { useActionState } from 'react'
import { atualizarServico, type EstadoServico } from '@/app/actions/servico'
import type { ServicoResposta, TipoServicoResposta } from '@/app/lib/definicoes'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'

const ESTADO_INICIAL: EstadoServico = {}

type Props = {
  servico: ServicoResposta
  tipos: TipoServicoResposta[]
}

export function TabDados({ servico, tipos }: Props) {
  const acao = atualizarServico.bind(null, servico.id)
  const [estado, dispatch, pendente] = useActionState(acao, ESTADO_INICIAL)

  const encerrado = servico.status === 'CONCLUIDO' || servico.status === 'CANCELADO'

  return (
    <form action={dispatch} className="space-y-4">
      {estado.erro && (
        <Alert variant="danger" dismissible>
          {estado.erro}
        </Alert>
      )}
      {estado.sucesso && (
        <Alert variant="success" dismissible>
          Dados atualizados.
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
          disabled={encerrado}
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
        disabled={encerrado}
        fullWidth
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Data de inicio prevista"
          name="dataInicioPrevista"
          type="date"
          defaultValue={servico.dataInicioPrevista ?? ''}
          error={estado.errosCampos?.dataInicioPrevista}
          disabled={encerrado}
          fullWidth
        />
        <Input
          label="Data de fim prevista"
          name="dataFimPrevista"
          type="date"
          defaultValue={servico.dataFimPrevista ?? ''}
          error={estado.errosCampos?.dataFimPrevista}
          disabled={encerrado}
          fullWidth
        />
      </div>

      {!encerrado && (
        <div className="flex justify-end pt-2">
          <Button type="submit" variant="primary" loading={pendente}>
            {pendente ? 'Salvando...' : 'Salvar alteracoes'}
          </Button>
        </div>
      )}
      {encerrado && (
        <p className="text-xs text-slate-500">
          Servico {servico.statusRotulo.toLowerCase()} — os dados nao podem mais ser editados.
        </p>
      )}
    </form>
  )
}
