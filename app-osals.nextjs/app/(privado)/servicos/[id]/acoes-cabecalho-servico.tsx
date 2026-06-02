'use client'

import { useState, useTransition } from 'react'
import {
  cancelarServico,
  excluirServico,
  finalizarServico,
  mudarStatusServico,
} from '@/app/actions/servico'
import type { ServicoResposta } from '@/app/lib/definicoes'
import { STATUS_INTERMEDIARIOS } from '@/app/lib/esquemas/servico'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'

type Props = {
  servico: ServicoResposta
  /** Habilita exclusao permanente do servico. */
  ehAdmin?: boolean
}

export function AcoesCabecalhoServico({ servico, ehAdmin = false }: Props) {
  const [confirmar, setConfirmar] =
    useState<'finalizar' | 'cancelar' | 'excluir' | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [pendente, iniciar] = useTransition()

  const encerrado = servico.status === 'CONCLUIDO' || servico.status === 'CANCELADO'

  // Encerrado: so admin ve o painel (com botao de excluir).
  if (encerrado && !ehAdmin) {
    return null
  }

  function executar(acao: () => Promise<void>) {
    iniciar(async () => {
      await acao()
      setConfirmar(null)
    })
  }

  return (
    <div className="w-full sm:w-48 shrink-0 rounded-lg border border-slate-200 bg-slate-50 p-2.5 flex flex-col justify-center gap-1.5">
      {!encerrado && (
        <>
          <div>
            <label
              htmlFor="status-servico"
              className="block text-[10px] uppercase tracking-wider text-slate-400 mb-0.5"
            >
              Status
            </label>
            <Select
              id="status-servico"
              fullWidth
              value={servico.status}
              onChange={(e) =>
                iniciar(() => mudarStatusServico(servico.id, e.target.value))
              }
              disabled={pendente}
              aria-label="Mudar status do servico"
              className="!py-1 !text-xs"
            >
              {STATUS_INTERMEDIARIOS.map((s) => (
                <option key={s.valor} value={s.valor}>
                  {s.rotulo}
                </option>
              ))}
            </Select>
          </div>

          {/* Botoes na vertical — discretos, mesmo tamanho, so muda a cor */}
          <Button
            variant="primary"
            size="xs"
            fullWidth
            onClick={() => setConfirmar('finalizar')}
          >
            Finalizar
          </Button>
          <Button
            variant="danger"
            size="xs"
            fullWidth
            onClick={() => setConfirmar('cancelar')}
          >
            Cancelar servico
          </Button>
        </>
      )}

      {ehAdmin && (
        <Button
          variant="danger"
          size="xs"
          fullWidth
          onClick={() => setConfirmar('excluir')}
        >
          Excluir
        </Button>
      )}

      {erro && (
        <Alert variant="danger" dismissible>
          {erro}
        </Alert>
      )}

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
          Cancelar o servico <strong>{servico.numeroFormatado}</strong>?
        </p>
      </Modal>

      <Modal
        open={confirmar === 'excluir'}
        onClose={() => setConfirmar(null)}
        title="Excluir servico"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmar(null)} disabled={pendente}>
              Voltar
            </Button>
            <Button
              variant="danger"
              loading={pendente}
              onClick={() =>
                iniciar(async () => {
                  const r = await excluirServico(servico.id)
                  if (r?.erro) {
                    setErro(r.erro)
                    setConfirmar(null)
                  }
                  // sucesso redireciona via Server Action (redirect)
                })
              }
            >
              Excluir permanentemente
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-700">
          Excluir o servico <strong>{servico.numeroFormatado}</strong> e tudo o que
          depende dele (ordens de servico, anexos, lancamentos de custo)?{' '}
          <strong>Esta acao nao pode ser desfeita.</strong>
        </p>
      </Modal>
    </div>
  )
}
