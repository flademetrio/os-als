'use client'

import { useActionState, useEffect, useState } from 'react'
import {
  inativarTecnico,
  reativarTecnico,
  redefinirSenhaTecnico,
  type EstadoTecnico,
} from '@/app/actions/tecnico'
import type { TecnicoResposta } from '@/app/lib/definicoes'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'

const ESTADO_INICIAL: EstadoTecnico = {}

export function AcoesCabecalhoTecnico({ tecnico }: { tecnico: TecnicoResposta }) {
  const [confirmar, setConfirmar] = useState<'status' | 'senha' | null>(null)
  const [pendenteStatus, setPendenteStatus] = useState(false)

  const acaoSenha = redefinirSenhaTecnico.bind(null, tecnico.id)
  const [estadoSenha, dispatchSenha, pendenteSenha] = useActionState(acaoSenha, ESTADO_INICIAL)

  useEffect(() => {
    if (estadoSenha.sucesso) setConfirmar(null)
  }, [estadoSenha.sucesso])

  async function executarStatus() {
    setPendenteStatus(true)
    try {
      if (tecnico.ativo) await inativarTecnico(tecnico.id)
      else await reativarTecnico(tecnico.id)
      setConfirmar(null)
    } finally {
      setPendenteStatus(false)
    }
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      <Button variant="outline" size="sm" onClick={() => setConfirmar('senha')}>
        Redefinir senha
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setConfirmar('status')}>
        {tecnico.ativo ? 'Inativar' : 'Reativar'}
      </Button>

      <Modal
        open={confirmar === 'status'}
        onClose={() => setConfirmar(null)}
        title={tecnico.ativo ? 'Inativar tecnico' : 'Reativar tecnico'}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmar(null)} disabled={pendenteStatus}>
              Cancelar
            </Button>
            <Button
              variant={tecnico.ativo ? 'danger' : 'success'}
              onClick={executarStatus}
              loading={pendenteStatus}
            >
              {tecnico.ativo ? 'Inativar' : 'Reativar'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-700">
          {tecnico.ativo
            ? `Inativar "${tecnico.nome}"? As sessoes vigentes serao invalidadas.`
            : `Reativar "${tecnico.nome}"?`}
        </p>
      </Modal>

      <Modal
        open={confirmar === 'senha'}
        onClose={() => setConfirmar(null)}
        title="Redefinir senha"
        size="sm"
      >
        <form action={dispatchSenha} className="space-y-4">
          {estadoSenha.erro && <Alert variant="danger" dismissible>{estadoSenha.erro}</Alert>}
          <p className="text-sm text-slate-600">
            Define uma nova senha para <strong>{tecnico.nome}</strong>. As sessoes vigentes serao
            invalidadas (logout forcado).
          </p>
          <Input
            label="Nova senha"
            name="novaSenha"
            type="password"
            required
            autoComplete="new-password"
            hint="Min. 8 caracteres"
            error={estadoSenha.errosCampos?.novaSenha}
            fullWidth
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setConfirmar(null)} disabled={pendenteSenha}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" loading={pendenteSenha}>
              {pendenteSenha ? 'Salvando...' : 'Redefinir senha'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
