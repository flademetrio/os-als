'use client'

import { useState } from 'react'
import type { VeiculoResposta } from '@/app/lib/definicoes'
import { inativarVeiculo, reativarVeiculo } from '@/app/actions/veiculo'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

export function AcoesCabecalhoVeiculo({ veiculo }: { veiculo: VeiculoResposta }) {
  const [confirmar, setConfirmar] = useState(false)
  const [pendente, setPendente] = useState(false)

  async function executar() {
    setPendente(true)
    try {
      if (veiculo.ativo) await inativarVeiculo(veiculo.id)
      else await reativarVeiculo(veiculo.id)
      setConfirmar(false)
    } finally {
      setPendente(false)
    }
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setConfirmar(true)}>
        {veiculo.ativo ? 'Inativar' : 'Reativar'}
      </Button>
      <Modal
        open={confirmar}
        onClose={() => setConfirmar(false)}
        title={veiculo.ativo ? 'Inativar veiculo' : 'Reativar veiculo'}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmar(false)} disabled={pendente}>Cancelar</Button>
            <Button variant={veiculo.ativo ? 'danger' : 'success'} onClick={executar} loading={pendente}>
              {veiculo.ativo ? 'Inativar' : 'Reativar'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-700">
          {veiculo.ativo
            ? `Inativar veiculo ${veiculo.placa}?`
            : `Reativar veiculo ${veiculo.placa}?`}
        </p>
      </Modal>
    </>
  )
}
