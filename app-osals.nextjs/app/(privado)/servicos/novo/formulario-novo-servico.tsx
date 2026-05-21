'use client'

import Link from 'next/link'
import { useActionState, useState } from 'react'
import { criarServico, type EstadoServico } from '@/app/actions/servico'
import type {
  ClienteResposta,
  ClienteResumoDto,
  TipoServicoResposta,
} from '@/app/lib/definicoes'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { ComboboxCliente } from './combobox-cliente'
import { ModalNovoCliente } from './modal-novo-cliente'

const ESTADO_INICIAL: EstadoServico = {}

type Props = {
  clientes: ClienteResumoDto[]
  tipos: TipoServicoResposta[]
}

export function FormularioNovoServico({ clientes: clientesIniciais, tipos }: Props) {
  const [estado, dispatch, pendente] = useActionState(criarServico, ESTADO_INICIAL)
  const [clientes, setClientes] = useState(clientesIniciais)
  const [clienteId, setClienteId] = useState<number | null>(null)
  const [modalNovoCliente, setModalNovoCliente] = useState(false)

  /** Cliente recem-criado pelo modal: entra no topo da lista e ja fica selecionado. */
  function clienteCriado(c: ClienteResposta) {
    const novo: ClienteResumoDto = {
      id: c.id,
      tipoPessoa: c.tipoPessoa,
      documento: c.documento,
      nome: c.nome,
      nomeFantasia: c.nomeFantasia,
      ativo: true,
    }
    setClientes((lista) => [novo, ...lista.filter((x) => x.id !== c.id)])
    setClienteId(c.id)
    setModalNovoCliente(false)
  }

  return (
    <>
      <form action={dispatch} className="space-y-4">
        {estado.erro && (
          <Alert variant="danger" dismissible>
            {estado.erro}
          </Alert>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ComboboxCliente
            clientes={clientes}
            value={clienteId}
            onChange={setClienteId}
            onNovoCliente={() => setModalNovoCliente(true)}
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

      {modalNovoCliente && (
        <ModalNovoCliente
          onCriado={clienteCriado}
          onClose={() => setModalNovoCliente(false)}
        />
      )}
    </>
  )
}
