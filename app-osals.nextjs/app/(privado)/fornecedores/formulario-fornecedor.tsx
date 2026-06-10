'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import {
  atualizarFornecedor,
  criarFornecedor,
  type EstadoFornecedor,
} from '@/app/actions/fornecedor'
import type { FornecedorResposta } from '@/app/lib/definicoes'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

const ESTADO_INICIAL: EstadoFornecedor = {}

export function FormularioFornecedor({
  fornecedor,
  podeEditar = true,
}: {
  fornecedor: FornecedorResposta | null
  podeEditar?: boolean
}) {
  const acao = fornecedor ? atualizarFornecedor.bind(null, fornecedor.id) : criarFornecedor
  const [estado, dispatch, pendente] = useActionState(acao, ESTADO_INICIAL)

  return (
    <form action={dispatch} className="space-y-4">
      {estado.erro && <Alert variant="danger" dismissible>{estado.erro}</Alert>}
      {estado.sucesso && <Alert variant="success" dismissible>Dados atualizados.</Alert>}

      <Input
        label="Nome / Razao social"
        name="nome"
        defaultValue={fornecedor?.nome ?? ''}
        required
        disabled={!podeEditar}
        error={estado.errosCampos?.nome}
        fullWidth
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Select label="Tipo de pessoa" name="tipoPessoa" defaultValue={fornecedor?.tipoPessoa ?? ''} disabled={!podeEditar} fullWidth>
          <option value="">— Nao informado</option>
          <option value="PJ">PJ — Pessoa Juridica</option>
          <option value="PF">PF — Pessoa Fisica</option>
        </Select>
        <div className="sm:col-span-2">
          <Input
            label="Documento"
            name="documento"
            defaultValue={fornecedor?.documento ?? ''}
            placeholder="CPF (11) ou CNPJ (14) digitos"
            disabled={!podeEditar}
            error={estado.errosCampos?.documento}
            fullWidth
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Telefone"
          name="telefone"
          defaultValue={fornecedor?.telefone ?? ''}
          disabled={!podeEditar}
          error={estado.errosCampos?.telefone}
          fullWidth
        />
        <Input
          label="E-mail"
          name="email"
          type="email"
          defaultValue={fornecedor?.email ?? ''}
          disabled={!podeEditar}
          error={estado.errosCampos?.email}
          fullWidth
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Link href="/fornecedores">
          <Button type="button" variant="ghost">{podeEditar ? 'Cancelar' : 'Voltar'}</Button>
        </Link>
        {podeEditar && (
          <Button type="submit" variant="primary" loading={pendente}>
            {pendente ? 'Salvando...' : fornecedor ? 'Salvar alteracoes' : 'Criar fornecedor'}
          </Button>
        )}
      </div>
    </form>
  )
}
