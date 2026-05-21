'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { criarServico, type EstadoServico } from '@/app/actions/servico'
import type { ClienteResumoDto, TipoServicoResposta } from '@/app/lib/definicoes'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'

const ESTADO_INICIAL: EstadoServico = {}

type Props = {
  clientes: ClienteResumoDto[]
  tipos: TipoServicoResposta[]
}

export function FormularioNovoServico({ clientes, tipos }: Props) {
  const [estado, dispatch, pendente] = useActionState(criarServico, ESTADO_INICIAL)

  return (
    <form action={dispatch} className="space-y-4">
      {estado.erro && (
        <Alert variant="danger" dismissible>
          {estado.erro}
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Cliente"
          name="clienteId"
          required
          error={estado.errosCampos?.clienteId}
          fullWidth
        >
          <option value="">— Selecione</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </Select>
        <Select
          label="Tipo de servico"
          name="tipoServicoId"
          required
          error={estado.errosCampos?.tipoServicoId}
          fullWidth
        >
          <option value="">— Selecione</option>
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
        hint="O que sera feito neste servico"
        error={estado.errosCampos?.descricao}
        fullWidth
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Data de inicio prevista"
          name="dataInicioPrevista"
          type="date"
          error={estado.errosCampos?.dataInicioPrevista}
          fullWidth
        />
        <Input
          label="Data de fim prevista"
          name="dataFimPrevista"
          type="date"
          error={estado.errosCampos?.dataFimPrevista}
          fullWidth
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Link href="/servicos">
          <Button type="button" variant="ghost">
            Cancelar
          </Button>
        </Link>
        <Button type="submit" variant="primary" loading={pendente}>
          {pendente ? 'Criando...' : 'Criar servico'}
        </Button>
      </div>
    </form>
  )
}
