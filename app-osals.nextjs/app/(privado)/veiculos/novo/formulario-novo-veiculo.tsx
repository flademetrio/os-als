'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { criarVeiculo, type EstadoVeiculo } from '@/app/actions/veiculo'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

const ESTADO_INICIAL: EstadoVeiculo = {}

export function FormularioNovoVeiculo() {
  const [estado, dispatch, pendente] = useActionState(criarVeiculo, ESTADO_INICIAL)

  return (
    <form action={dispatch} className="space-y-4">
      {estado.erro && <Alert variant="danger" dismissible>{estado.erro}</Alert>}

      <Input
        label="Placa"
        name="placa"
        required
        placeholder="AAA0A00 ou AAA0000"
        error={estado.errosCampos?.placa}
        fullWidth
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Marca" name="marca" error={estado.errosCampos?.marca} fullWidth />
        <Input label="Modelo" name="modelo" error={estado.errosCampos?.modelo} fullWidth />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Ano"
          name="ano"
          type="number"
          min={1980}
          max={2100}
          error={estado.errosCampos?.ano}
          fullWidth
        />
        <Select label="Status" name="status" fullWidth defaultValue="ATIVO">
          <option value="ATIVO">Ativo</option>
          <option value="MANUTENCAO">Em manutencao</option>
          <option value="INATIVO">Inativo</option>
        </Select>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Link href="/veiculos">
          <Button type="button" variant="ghost">Cancelar</Button>
        </Link>
        <Button type="submit" variant="primary" loading={pendente}>
          {pendente ? 'Salvando...' : 'Criar veiculo'}
        </Button>
      </div>
    </form>
  )
}
