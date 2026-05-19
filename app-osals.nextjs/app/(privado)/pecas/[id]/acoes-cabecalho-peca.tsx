'use client'

import { useState } from 'react'
import { inativarPeca, reativarPeca } from '@/app/actions/peca'
import type { PecaResposta } from '@/app/lib/definicoes'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

export function AcoesCabecalhoPeca({ peca }: { peca: PecaResposta }) {
  const [confirmar, setConfirmar] = useState(false)
  const [pendente, setPendente] = useState(false)

  async function executar() {
    setPendente(true)
    try {
      if (peca.ativo) await inativarPeca(peca.id)
      else await reativarPeca(peca.id)
      setConfirmar(false)
    } finally {
      setPendente(false)
    }
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setConfirmar(true)}>
        {peca.ativo ? 'Inativar' : 'Reativar'}
      </Button>
      <Modal
        open={confirmar}
        onClose={() => setConfirmar(false)}
        title={peca.ativo ? 'Inativar peca' : 'Reativar peca'}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmar(false)} disabled={pendente}>Cancelar</Button>
            <Button variant={peca.ativo ? 'danger' : 'success'} onClick={executar} loading={pendente}>
              {peca.ativo ? 'Inativar' : 'Reativar'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-700">
          {peca.ativo ? `Inativar peca "${peca.nome}"?` : `Reativar peca "${peca.nome}"?`}
        </p>
      </Modal>
    </>
  )
}
