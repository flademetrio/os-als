'use client'

import { useRouter } from 'next/navigation'
import { useActionState, useEffect } from 'react'
import { atualizarVeiculo, type EstadoVeiculo } from '@/app/actions/veiculo'
import type { VeiculoResposta } from '@/app/lib/definicoes'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

const ESTADO_INICIAL: EstadoVeiculo = {}

export function FormularioEdicaoVeiculo({ veiculo }: { veiculo: VeiculoResposta }) {
  const router = useRouter()
  const acao = atualizarVeiculo.bind(null, veiculo.id)
  const [estado, dispatch, pendente] = useActionState(acao, ESTADO_INICIAL)

  useEffect(() => {
    if (estado.sucesso) router.push('/veiculos')
  }, [estado.sucesso, router])

  return (
    <form action={dispatch} className="space-y-4">
      {estado.erro && <Alert variant="danger" dismissible>{estado.erro}</Alert>}

      <Input
        label="Placa"
        name="placa"
        defaultValue={veiculo.placa}
        required
        error={estado.errosCampos?.placa}
        fullWidth
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Marca" name="marca" defaultValue={veiculo.marca ?? ''} error={estado.errosCampos?.marca} fullWidth />
        <Input label="Modelo" name="modelo" defaultValue={veiculo.modelo ?? ''} error={estado.errosCampos?.modelo} fullWidth />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Ano"
          name="ano"
          type="number"
          defaultValue={veiculo.ano ?? ''}
          error={estado.errosCampos?.ano}
          fullWidth
        />
        <Select label="Status" name="status" defaultValue={veiculo.status} fullWidth>
          <option value="ATIVO">Ativo</option>
          <option value="MANUTENCAO">Em manutencao</option>
          <option value="INATIVO">Inativo</option>
        </Select>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" variant="primary" loading={pendente} disabled={!veiculo.ativo}>
          {pendente ? 'Salvando...' : 'Salvar alteracoes'}
        </Button>
      </div>
      {!veiculo.ativo && <p className="text-xs text-slate-500">Veiculo inativo. Reative-o para editar.</p>}
    </form>
  )
}
