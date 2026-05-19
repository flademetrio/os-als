'use client'

import { useState } from 'react'
import { inativarFornecedor, reativarFornecedor } from '@/app/actions/fornecedor'
import type { FornecedorResposta } from '@/app/lib/definicoes'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

export function AcoesCabecalhoFornecedor({ fornecedor }: { fornecedor: FornecedorResposta }) {
  const [confirmar, setConfirmar] = useState(false)
  const [pendente, setPendente] = useState(false)

  async function executar() {
    setPendente(true)
    try {
      if (fornecedor.ativo) await inativarFornecedor(fornecedor.id)
      else await reativarFornecedor(fornecedor.id)
      setConfirmar(false)
    } finally {
      setPendente(false)
    }
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setConfirmar(true)}>
        {fornecedor.ativo ? 'Inativar' : 'Reativar'}
      </Button>
      <Modal
        open={confirmar}
        onClose={() => setConfirmar(false)}
        title={fornecedor.ativo ? 'Inativar fornecedor' : 'Reativar fornecedor'}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmar(false)} disabled={pendente}>Cancelar</Button>
            <Button variant={fornecedor.ativo ? 'danger' : 'success'} onClick={executar} loading={pendente}>
              {fornecedor.ativo ? 'Inativar' : 'Reativar'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-700">
          {fornecedor.ativo ? `Inativar "${fornecedor.nome}"?` : `Reativar "${fornecedor.nome}"?`}
        </p>
      </Modal>
    </>
  )
}
