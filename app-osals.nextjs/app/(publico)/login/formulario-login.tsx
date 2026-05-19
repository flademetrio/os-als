'use client'

import { useActionState } from 'react'
import { entrar, type EstadoLogin } from '@/app/actions/auth/entrar'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const ESTADO_INICIAL: EstadoLogin = {}

export function FormularioLogin() {
  const [estado, dispatch, pendente] = useActionState(entrar, ESTADO_INICIAL)

  return (
    <form action={dispatch} className="space-y-4">
      {estado.erro && (
        <Alert variant="danger" dismissible>
          {estado.erro}
        </Alert>
      )}

      <Input
        label="Email"
        name="email"
        type="email"
        required
        autoComplete="username"
        error={estado.errosCampos?.email}
        fullWidth
      />

      <Input
        label="Senha"
        name="senha"
        type="password"
        required
        autoComplete="current-password"
        error={estado.errosCampos?.senha}
        fullWidth
      />

      <Button type="submit" variant="primary" size="lg" loading={pendente} fullWidth>
        {pendente ? 'Entrando...' : 'Entrar'}
      </Button>
    </form>
  )
}
