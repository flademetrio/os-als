'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { redefinirPorToken, type EstadoRedefinicao } from '@/app/actions/redefinicao'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const ESTADO_INICIAL: EstadoRedefinicao = {}

export function FormularioRedefinicao({ token }: { token: string }) {
  const acao = redefinirPorToken.bind(null, token)
  const [estado, dispatch, pendente] = useActionState(acao, ESTADO_INICIAL)

  if (estado.sucesso) {
    return (
      <div className="space-y-4 text-center">
        <Alert variant="success">Senha redefinida com sucesso.</Alert>
        <Link href="/login" className="text-primary hover:underline text-sm">
          Ir para o login
        </Link>
      </div>
    )
  }

  return (
    <form action={dispatch} className="space-y-4">
      {estado.erro && (
        <Alert variant="danger" dismissible>
          {estado.erro}
        </Alert>
      )}

      <Input
        label="Nova senha"
        name="novaSenha"
        type="password"
        required
        autoComplete="new-password"
        hint="Minimo 8 caracteres"
        error={estado.errosCampos?.novaSenha}
        fullWidth
      />

      <Input
        label="Confirmar nova senha"
        name="confirmar"
        type="password"
        required
        autoComplete="new-password"
        error={estado.errosCampos?.confirmar}
        fullWidth
      />

      <Button type="submit" variant="primary" size="lg" loading={pendente} fullWidth>
        {pendente ? 'Salvando...' : 'Redefinir senha'}
      </Button>
    </form>
  )
}
