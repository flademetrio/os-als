'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useActionState, useEffect } from 'react'
import { criarTecnico, type EstadoTecnico } from '@/app/actions/tecnico'
import type { TecnicoResposta } from '@/app/lib/definicoes'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const ESTADO_INICIAL: EstadoTecnico = {}

type Props = {
  /** Quando informado, "Cancelar" fecha o modal em vez de navegar. */
  onCancelar?: () => void
  /** Sem callback, navega para o detalhe; com callback, o pai decide. */
  onCriado?: (tecnico: TecnicoResposta) => void
}

export function FormularioNovoTecnico({ onCancelar, onCriado }: Props = {}) {
  const router = useRouter()
  const [estado, dispatch, pendente] = useActionState(criarTecnico, ESTADO_INICIAL)

  useEffect(() => {
    if (!estado.criado) return
    if (onCriado) onCriado(estado.criado)
    else router.push(`/tecnicos/${estado.criado.id}`)
  }, [estado.criado, onCriado, router])

  return (
    <form action={dispatch} className="space-y-4">
      {estado.erro && <Alert variant="danger" dismissible>{estado.erro}</Alert>}

      <Input
        label="Nome completo"
        name="nome"
        required
        error={estado.errosCampos?.nome}
        fullWidth
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="E-mail"
          name="email"
          type="email"
          required
          autoComplete="off"
          hint="Sera usado para login"
          error={estado.errosCampos?.email}
          fullWidth
        />
        <Input
          label="Senha inicial"
          name="senha"
          type="password"
          required
          autoComplete="new-password"
          hint="Min. 8 caracteres"
          error={estado.errosCampos?.senha}
          fullWidth
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Valor/hora (R$)"
          name="valorHoraReais"
          required
          placeholder="45,00"
          hint='Use virgula como decimal. Ex.: "45,00"'
          error={estado.errosCampos?.valorHoraReais}
          fullWidth
        />
        <Input
          label="Telefone"
          name="telefone"
          error={estado.errosCampos?.telefone}
          fullWidth
        />
      </div>

      <Input
        label="Especialidade"
        name="especialidade"
        hint="Ex.: Refrigeracao residencial, Chiller industrial..."
        error={estado.errosCampos?.especialidade}
        fullWidth
      />

      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancelar ? (
          <Button type="button" variant="ghost" onClick={onCancelar} disabled={pendente}>
            Cancelar
          </Button>
        ) : (
          <Link href="/tecnicos">
            <Button type="button" variant="ghost">Cancelar</Button>
          </Link>
        )}
        <Button type="submit" variant="primary" loading={pendente}>
          {pendente ? 'Salvando...' : 'Criar tecnico'}
        </Button>
      </div>
    </form>
  )
}
