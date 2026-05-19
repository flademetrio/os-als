'use client'

import { useActionState } from 'react'
import { atualizarEquipamento, type EstadoEquipamento } from '@/app/actions/equipamento'
import type { EquipamentoResposta } from '@/app/lib/definicoes'
import { TIPOS_EQUIPAMENTO_LABEL } from '@/app/lib/esquemas/equipamento'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

const ESTADO_INICIAL: EstadoEquipamento = {}

export function FormularioEdicaoEquipamento({
  equipamento,
}: {
  equipamento: EquipamentoResposta
}) {
  const acao = atualizarEquipamento.bind(null, equipamento.id)
  const [estado, dispatch, pendente] = useActionState(acao, ESTADO_INICIAL)

  return (
    <form action={dispatch} className="space-y-4">
      {estado.erro && <Alert variant="danger" dismissible>{estado.erro}</Alert>}
      {estado.sucesso && <Alert variant="success" dismissible>Dados atualizados.</Alert>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Marca" name="marca" defaultValue={equipamento.marca ?? ''} fullWidth />
        <Input label="Modelo" name="modelo" defaultValue={equipamento.modelo ?? ''} fullWidth />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Numero de serie"
          name="numeroSerie"
          defaultValue={equipamento.numeroSerie ?? ''}
          fullWidth
        />
        <Select label="Tipo" name="tipo" required defaultValue={equipamento.tipo} fullWidth>
          {Object.entries(TIPOS_EQUIPAMENTO_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Capacidade (BTUs)"
          name="capacidadeBtus"
          type="number"
          min={0}
          defaultValue={equipamento.capacidadeBtus ?? ''}
          fullWidth
        />
        <Input
          label="Capacidade (TR)"
          name="capacidadeTr"
          defaultValue={equipamento.capacidadeTr?.toString().replace('.', ',') ?? ''}
          fullWidth
        />
      </div>

      <Input
        label="Localizacao interna"
        name="localizacaoInterna"
        defaultValue={equipamento.localizacaoInterna ?? ''}
        fullWidth
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Data de instalacao"
          name="dataInstalacao"
          type="date"
          defaultValue={equipamento.dataInstalacao ?? ''}
          fullWidth
        />
        <Input
          label="Ultima manutencao"
          name="dataUltimaManutencao"
          type="date"
          defaultValue={equipamento.dataUltimaManutencao ?? ''}
          fullWidth
        />
      </div>

      <Select label="Status" name="status" defaultValue={equipamento.status} fullWidth>
        <option value="ATIVO">Ativo</option>
        <option value="EM_MANUTENCAO">Em manutencao</option>
        <option value="DESATIVADO">Desativado</option>
      </Select>

      <div className="flex justify-end pt-2">
        <Button type="submit" variant="primary" loading={pendente} disabled={!equipamento.ativo}>
          {pendente ? 'Salvando...' : 'Salvar alteracoes'}
        </Button>
      </div>
      {!equipamento.ativo && (
        <p className="text-xs text-slate-500">Equipamento inativo. Reative-o para editar.</p>
      )}
    </form>
  )
}
