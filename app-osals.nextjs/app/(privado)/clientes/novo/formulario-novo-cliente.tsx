'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useState } from 'react'
import {
  criarClienteRetornando,
  type EstadoNovoClienteModal,
} from '@/app/actions/cliente'
import type { ClienteResposta } from '@/app/lib/definicoes'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { InputDocumento } from '@/components/ui/InputDocumento'
import { Select } from '@/components/ui/Select'

const ESTADO_INICIAL: EstadoNovoClienteModal = {}

type Props = {
  /** Quando informado, "Cancelar" vira um botao que fecha o modal (em vez de Link). */
  onCancelar?: () => void
  /**
   * Chamado apos criar o cliente. Quando informado (drawer), o pai decide o
   * que fazer (ex.: fechar o modal); sem ele, navega para o detalhe do cliente.
   */
  onCriado?: (cliente: ClienteResposta) => void
}

export function FormularioNovoCliente({ onCancelar, onCriado }: Props = {}) {
  const router = useRouter()
  const [estado, dispatch, pendente] = useActionState(criarClienteRetornando, ESTADO_INICIAL)
  const [tipoPessoa, setTipoPessoa] = useState<'PF' | 'PJ'>('PJ')

  useEffect(() => {
    if (!estado.cliente) return
    if (onCriado) {
      onCriado(estado.cliente)
    } else {
      router.push(`/clientes/${estado.cliente.id}`)
    }
  }, [estado.cliente, onCriado, router])

  return (
    <form action={dispatch} className="space-y-4">
      {estado.erro && (
        <Alert variant="danger" dismissible>
          {estado.erro}
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Select
          label="Tipo de pessoa"
          name="tipoPessoa"
          required
          value={tipoPessoa}
          onChange={(e) => setTipoPessoa(e.target.value as 'PF' | 'PJ')}
          error={estado.errosCampos?.tipoPessoa}
          fullWidth
        >
          <option value="PJ">PJ — Pessoa Juridica</option>
          <option value="PF">PF — Pessoa Fisica</option>
        </Select>

        <div className="sm:col-span-2">
          <InputDocumento
            tipoPessoa={tipoPessoa}
            error={estado.errosCampos?.documento}
          />
        </div>
      </div>

      <Input
        label={tipoPessoa === 'PJ' ? 'Razao social' : 'Nome completo'}
        name="nome"
        required
        error={estado.errosCampos?.nome}
        fullWidth
      />

      {tipoPessoa === 'PJ' && (
        <Input
          label="Nome fantasia"
          name="nomeFantasia"
          hint="Opcional"
          error={estado.errosCampos?.nomeFantasia}
          fullWidth
        />
      )}

      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancelar ? (
          <Button type="button" variant="ghost" onClick={onCancelar} disabled={pendente}>
            Cancelar
          </Button>
        ) : (
          <Link href="/clientes">
            <Button type="button" variant="ghost">
              Cancelar
            </Button>
          </Link>
        )}
        <Button type="submit" variant="primary" loading={pendente}>
          {pendente ? 'Salvando...' : 'Criar cliente'}
        </Button>
      </div>
    </form>
  )
}
