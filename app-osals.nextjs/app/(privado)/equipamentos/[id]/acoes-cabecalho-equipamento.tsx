'use client'

import { useState } from 'react'
import { inativarEquipamento, reativarEquipamento } from '@/app/actions/equipamento'
import type { EquipamentoResposta } from '@/app/lib/definicoes'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

export function AcoesCabecalhoEquipamento({
  equipamento,
}: {
  equipamento: EquipamentoResposta
}) {
  const [confirmar, setConfirmar] = useState(false)
  const [pendente, setPendente] = useState(false)

  async function executar() {
    setPendente(true)
    try {
      if (equipamento.ativo) await inativarEquipamento(equipamento.id)
      else await reativarEquipamento(equipamento.id)
      setConfirmar(false)
    } finally {
      setPendente(false)
    }
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setConfirmar(true)}>
        {equipamento.ativo ? 'Inativar' : 'Reativar'}
      </Button>
      <Modal
        open={confirmar}
        onClose={() => setConfirmar(false)}
        title={equipamento.ativo ? 'Inativar equipamento' : 'Reativar equipamento'}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmar(false)} disabled={pendente}>
              Cancelar
            </Button>
            <Button
              variant={equipamento.ativo ? 'danger' : 'success'}
              onClick={executar}
              loading={pendente}
            >
              {equipamento.ativo ? 'Inativar' : 'Reativar'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-700">
          {equipamento.ativo
            ? `Inativar este equipamento? Ele para de aparecer nas listagens padrao.`
            : 'Reativar este equipamento?'}
        </p>
      </Modal>
    </>
  )
}
