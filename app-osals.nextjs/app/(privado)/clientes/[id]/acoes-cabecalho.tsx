'use client'

import { useState } from 'react'
import type { ClienteResposta } from '@/app/lib/definicoes'
import { inativarCliente, reativarCliente } from '@/app/actions/cliente'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

export function AcoesCabecalho({ cliente }: { cliente: ClienteResposta }) {
  const [confirmar, setConfirmar] = useState(false)
  const [pendente, setPendente] = useState(false)

  async function executar() {
    setPendente(true)
    try {
      if (cliente.ativo) {
        await inativarCliente(cliente.id)
      } else {
        await reativarCliente(cliente.id)
      }
      setConfirmar(false)
    } finally {
      setPendente(false)
    }
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      {cliente.ativo ? (
        <Button variant="ghost" size="sm" onClick={() => setConfirmar(true)}>
          Inativar
        </Button>
      ) : (
        <Button variant="ghost" size="sm" onClick={() => setConfirmar(true)}>
          Reativar
        </Button>
      )}

      <Modal
        open={confirmar}
        onClose={() => setConfirmar(false)}
        title={cliente.ativo ? 'Inativar cliente' : 'Reativar cliente'}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmar(false)} disabled={pendente}>
              Cancelar
            </Button>
            <Button
              variant={cliente.ativo ? 'danger' : 'success'}
              onClick={executar}
              loading={pendente}
            >
              {cliente.ativo ? 'Inativar' : 'Reativar'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-700">
          {cliente.ativo
            ? `Deseja inativar "${cliente.nome}"? Ele deixa de aparecer nas listagens padrao, mas o historico e preservado.`
            : `Deseja reativar "${cliente.nome}"?`}
        </p>
      </Modal>
    </div>
  )
}
