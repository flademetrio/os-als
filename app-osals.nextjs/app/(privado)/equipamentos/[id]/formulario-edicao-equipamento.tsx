'use client'

import { useRouter } from 'next/navigation'
import { useActionState, useEffect } from 'react'
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
  podeEditar = true,
}: {
  equipamento: EquipamentoResposta
  podeEditar?: boolean
}) {
  const router = useRouter()
  const acao = atualizarEquipamento.bind(null, equipamento.id)
  const [estado, dispatch, pendente] = useActionState(acao, ESTADO_INICIAL)

  useEffect(() => {
    if (estado.sucesso) router.push('/equipamentos')
  }, [estado.sucesso, router])

  return (
    <form action={dispatch} className="space-y-4">
      {estado.erro && <Alert variant="danger" dismissible>{estado.erro}</Alert>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Marca" name="marca" defaultValue={equipamento.marca ?? ''} disabled={!podeEditar} fullWidth />
        <Input label="Modelo" name="modelo" defaultValue={equipamento.modelo ?? ''} disabled={!podeEditar} fullWidth />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Numero de serie"
          name="numeroSerie"
          defaultValue={equipamento.numeroSerie ?? ''}
          disabled={!podeEditar}
          fullWidth
        />
        <Select label="Tipo" name="tipo" required defaultValue={equipamento.tipo} disabled={!podeEditar} fullWidth>
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
          disabled={!podeEditar}
          fullWidth
        />
        <Input
          label="Capacidade (TR)"
          name="capacidadeTr"
          defaultValue={equipamento.capacidadeTr?.toString().replace('.', ',') ?? ''}
          disabled={!podeEditar}
          fullWidth
        />
      </div>

      <Input
        label="Localizacao interna"
        name="localizacaoInterna"
        defaultValue={equipamento.localizacaoInterna ?? ''}
        disabled={!podeEditar}
        fullWidth
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Data de instalacao"
          name="dataInstalacao"
          type="date"
          defaultValue={equipamento.dataInstalacao ?? ''}
          disabled={!podeEditar}
          fullWidth
        />
        <Input
          label="Ultima manutencao"
          name="dataUltimaManutencao"
          type="date"
          defaultValue={equipamento.dataUltimaManutencao ?? ''}
          disabled={!podeEditar}
          fullWidth
        />
      </div>

      <Select label="Status" name="status" defaultValue={equipamento.status} disabled={!podeEditar} fullWidth>
        <option value="ATIVO">Ativo</option>
        <option value="EM_MANUTENCAO">Em manutencao</option>
        <option value="DESATIVADO">Desativado</option>
      </Select>

      {podeEditar && (
        <div className="flex justify-end pt-2">
          <Button type="submit" variant="primary" loading={pendente} disabled={!equipamento.ativo}>
            {pendente ? 'Salvando...' : 'Salvar alteracoes'}
          </Button>
        </div>
      )}
      {podeEditar && !equipamento.ativo && (
        <p className="text-xs text-slate-500">Equipamento inativo. Reative-o para editar.</p>
      )}
    </form>
  )
}
