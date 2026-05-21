'use client'

import { useState, useTransition } from 'react'
import {
  cancelarServico,
  finalizarServico,
  mudarStatusServico,
} from '@/app/actions/servico'
import type { ServicoResposta } from '@/app/lib/definicoes'
import { STATUS_INTERMEDIARIOS } from '@/app/lib/esquemas/servico'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'

export function AcoesCabecalhoServico({ servico }: { servico: ServicoResposta }) {
  const [confirmar, setConfirmar] = useState<'finalizar' | 'cancelar' | null>(null)
  const [pendente, iniciar] = useTransition()

  const encerrado = servico.status === 'CONCLUIDO' || servico.status === 'CANCELADO'

  if (encerrado) {
    return null
  }

  function executar(acao: () => Promise<void>) {
    iniciar(async () => {
      await acao()
      setConfirmar(null)
    })
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      <Select
        value={servico.status}
        onChange={(e) =>
          iniciar(() => mudarStatusServico(servico.id, e.target.value))
        }
        disabled={pendente}
        aria-label="Mudar status"
      >
        {STATUS_INTERMEDIARIOS.map((s) => (
          <option key={s.valor} value={s.valor}>
            {s.rotulo}
          </option>
        ))}
      </Select>

      <Button variant="ghost" size="sm" onClick={() => setConfirmar('cancelar')}>
        Cancelar servico
      </Button>
      <Button variant="primary" size="sm" onClick={() => setConfirmar('finalizar')}>
        Finalizar
      </Button>

      <Modal
        open={confirmar === 'finalizar'}
        onClose={() => setConfirmar(null)}
        title="Finalizar servico"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmar(null)} disabled={pendente}>
              Voltar
            </Button>
            <Button
              variant="primary"
              loading={pendente}
              onClick={() => executar(() => finalizarServico(servico.id))}
            >
              Finalizar
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-700">
          Concluir o servico <strong>{servico.numeroFormatado}</strong>? Apos concluido
          ele nao pode ser reaberto nem editado.
        </p>
      </Modal>

      <Modal
        open={confirmar === 'cancelar'}
        onClose={() => setConfirmar(null)}
        title="Cancelar servico"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmar(null)} disabled={pendente}>
              Voltar
            </Button>
            <Button
              variant="danger"
              loading={pendente}
              onClick={() => executar(() => cancelarServico(servico.id))}
            >
              Cancelar servico
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-700">
          Cancelar o servico <strong>{servico.numeroFormatado}</strong>? Esta acao e
          irreversivel.
        </p>
      </Modal>
    </div>
  )
}
