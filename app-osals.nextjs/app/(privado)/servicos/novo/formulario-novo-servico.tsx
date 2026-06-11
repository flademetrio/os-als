'use client'

import Link from 'next/link'
import { useActionState, useState } from 'react'
import { criarServico, type EstadoServico } from '@/app/actions/servico'
import { EMPRESA_SERVICO_LABEL } from '@/app/lib/esquemas/servico'
import type { ClienteResumoDto, TipoServicoResposta } from '@/app/lib/definicoes'
import { ComboboxCliente } from '@/components/app/combobox-cliente'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'

const ESTADO_INICIAL: EstadoServico = {}

type Props = {
  clientes: ClienteResumoDto[]
  tipos: TipoServicoResposta[]
  /** Quando informado, "Cancelar" vira um botao que fecha o modal (em vez de Link). */
  onCancelar?: () => void
}

export function FormularioNovoServico({ clientes, tipos, onCancelar }: Props) {
  const [estado, dispatch, pendente] = useActionState(criarServico, ESTADO_INICIAL)
  const [clienteId, setClienteId] = useState<number | null>(null)

  return (
    <form action={dispatch} className="space-y-4">
      {estado.erro && (
        <Alert variant="danger" dismissible>
          {estado.erro}
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ComboboxCliente
          clientesIniciais={clientes}
          value={clienteId}
          onChange={setClienteId}
          error={estado.errosCampos?.clienteId}
        />
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

      <div className="sm:w-48">
        <Select
          label="Empresa"
          name="empresa"
          required
          defaultValue="ALS"
          hint="Empresa responsavel"
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
        {onCancelar ? (
          <Button type="button" variant="ghost" onClick={onCancelar} disabled={pendente}>
            Cancelar
          </Button>
        ) : (
          <Link href="/servicos">
            <Button type="button" variant="ghost">
              Cancelar
            </Button>
          </Link>
        )}
        <Button type="submit" variant="primary" loading={pendente}>
          {pendente ? 'Criando...' : 'Criar servico'}
        </Button>
      </div>
    </form>
  )
}
