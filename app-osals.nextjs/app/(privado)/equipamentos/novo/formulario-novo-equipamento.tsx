'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useState } from 'react'
import { criarEquipamento, type EstadoEquipamento } from '@/app/actions/equipamento'
import type {
  ClienteResumoDto,
  EquipamentoResposta,
  UnidadeResposta,
} from '@/app/lib/definicoes'
import { TIPOS_EQUIPAMENTO_LABEL } from '@/app/lib/esquemas/equipamento'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

const ESTADO_INICIAL: EstadoEquipamento = {}

type Props = {
  clientes: ClienteResumoDto[]
  /** Quando informado, "Cancelar" fecha o modal em vez de navegar. */
  onCancelar?: () => void
  /**
   * Chamado apos criar o equipamento. Sem callback, navega para o detalhe;
   * com callback (drawer), o pai decide (ex.: fechar e atualizar a lista).
   */
  onCriado?: (equipamento: EquipamentoResposta) => void
}

export function FormularioNovoEquipamento({ clientes, onCancelar, onCriado }: Props) {
  const router = useRouter()
  const [estado, dispatch, pendente] = useActionState(criarEquipamento, ESTADO_INICIAL)
  const [clienteId, setClienteId] = useState<string>('')
  const [unidades, setUnidades] = useState<UnidadeResposta[]>([])
  const [carregandoUnidades, setCarregandoUnidades] = useState(false)

  useEffect(() => {
    if (!estado.criado) return
    if (onCriado) onCriado(estado.criado)
    else router.push(`/equipamentos/${estado.criado.id}`)
  }, [estado.criado, onCriado, router])

  // Carrega unidades quando cliente muda (chamada client-side via fetch ao back)
  useEffect(() => {
    if (!clienteId) {
      setUnidades([])
      return
    }
    setCarregandoUnidades(true)
    fetch(`/api-proxy/clientes/${clienteId}/unidades?apenasAtivas=true`, {
      credentials: 'include',
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setUnidades(d))
      .catch(() => setUnidades([]))
      .finally(() => setCarregandoUnidades(false))
  }, [clienteId])

  return (
    <form action={dispatch} className="space-y-4">
      {estado.erro && <Alert variant="danger" dismissible>{estado.erro}</Alert>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Cliente"
          name="clienteId"
          required
          value={clienteId}
          onChange={(e) => setClienteId(e.target.value)}
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
          label="Unidade"
          name="unidadeId"
          required
          disabled={!clienteId || carregandoUnidades}
          error={estado.errosCampos?.unidadeId}
          fullWidth
        >
          <option value="">
            {!clienteId
              ? '— Escolha o cliente primeiro'
              : carregandoUnidades
              ? '— Carregando...'
              : unidades.length === 0
              ? '— Nenhuma unidade ativa'
              : '— Selecione'}
          </option>
          {unidades.map((u) => (
            <option key={u.id} value={u.id}>
              {u.identificacaoInterna}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Marca" name="marca" error={estado.errosCampos?.marca} fullWidth />
        <Input label="Modelo" name="modelo" error={estado.errosCampos?.modelo} fullWidth />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Numero de serie"
          name="numeroSerie"
          error={estado.errosCampos?.numeroSerie}
          fullWidth
        />
        <Select label="Tipo" name="tipo" required error={estado.errosCampos?.tipo} fullWidth>
          <option value="">— Selecione</option>
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
          error={estado.errosCampos?.capacidadeBtus}
          fullWidth
        />
        <Input
          label="Capacidade (TR)"
          name="capacidadeTr"
          placeholder="Ex.: 1,5"
          error={estado.errosCampos?.capacidadeTr}
          fullWidth
        />
      </div>

      <Input
        label="Localizacao interna"
        name="localizacaoInterna"
        hint='Ex.: "Sala 305 - parede norte"'
        error={estado.errosCampos?.localizacaoInterna}
        fullWidth
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Data de instalacao"
          name="dataInstalacao"
          type="date"
          error={estado.errosCampos?.dataInstalacao}
          fullWidth
        />
        <Input
          label="Ultima manutencao"
          name="dataUltimaManutencao"
          type="date"
          error={estado.errosCampos?.dataUltimaManutencao}
          fullWidth
        />
      </div>

      <Select label="Status" name="status" defaultValue="ATIVO" fullWidth>
        <option value="ATIVO">Ativo</option>
        <option value="EM_MANUTENCAO">Em manutencao</option>
        <option value="DESATIVADO">Desativado</option>
      </Select>

      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancelar ? (
          <Button type="button" variant="ghost" onClick={onCancelar} disabled={pendente}>
            Cancelar
          </Button>
        ) : (
          <Link href="/equipamentos">
            <Button type="button" variant="ghost">Cancelar</Button>
          </Link>
        )}
        <Button type="submit" variant="primary" loading={pendente}>
          {pendente ? 'Salvando...' : 'Criar equipamento'}
        </Button>
      </div>
    </form>
  )
}
