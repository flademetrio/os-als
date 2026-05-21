'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { cancelarOrdemServico } from '@/app/actions/ordem-servico'
import type { OrdemServicoResposta } from '@/app/lib/definicoes'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ModalDigitarExecucao } from './modal-digitar-execucao'

type Props = {
  os: OrdemServicoResposta
  /**
   * Chamado quando a OS e concluida pela digitacao de execucao. Em modal
   * (detalhe da OS dentro do servico), fecha o drawer; sem callback, navega
   * para a tela do servico.
   */
  onConcluido?: () => void
}

export function AcoesOs({ os, onConcluido }: Props) {
  const router = useRouter()
  const [confirmarCancelar, setConfirmarCancelar] = useState(false)
  const [digitando, setDigitando] = useState(false)
  const [imprimindo, setImprimindo] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [pendente, iniciar] = useTransition()

  const encerrada = os.status === 'CONCLUIDA' || os.status === 'CANCELADA'
  const podeDigitar = os.status === 'IMPRESSA' || os.status === 'PENDENTE_DIGITACAO'

  /** Apos concluir a OS: fecha o modal de digitacao e leva o usuario ao servico. */
  function execucaoConcluida() {
    setDigitando(false)
    if (onConcluido) {
      onConcluido()
    } else {
      router.push(`/servicos/${os.servicoId}`)
    }
  }

  async function imprimir() {
    setErro(null)
    setImprimindo(true)
    try {
      const resp = await fetch(`/api-proxy/ordens-servico/${os.id}/imprimir`, {
        method: 'POST',
      })
      if (!resp.ok) {
        const corpo = await resp.json().catch(() => null)
        setErro(corpo?.mensagem ?? 'Falha ao gerar o PDF.')
        return
      }
      const blob = await resp.blob()
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank', 'noopener,noreferrer')
      setTimeout(() => URL.revokeObjectURL(url), 60_000)
      router.refresh()
    } catch {
      setErro('Falha de conexao ao gerar o PDF.')
    } finally {
      setImprimindo(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-2 shrink-0">
      <div className="flex items-center gap-2">
        {!encerrada && (
          <Button variant="secondary" size="sm" onClick={imprimir} loading={imprimindo}>
            Imprimir
          </Button>
        )}
        {podeDigitar && (
          <Button variant="primary" size="sm" onClick={() => setDigitando(true)}>
            Digitar execucao
          </Button>
        )}
        {!encerrada && (
          <Button variant="ghost" size="sm" onClick={() => setConfirmarCancelar(true)}>
            Cancelar OS
          </Button>
        )}
      </div>
      {erro && (
        <Alert variant="danger" dismissible>
          {erro}
        </Alert>
      )}

      {digitando && (
        <ModalDigitarExecucao
          os={os}
          onClose={() => setDigitando(false)}
          onConcluido={execucaoConcluida}
        />
      )}

      <Modal
        open={confirmarCancelar}
        onClose={() => setConfirmarCancelar(false)}
        title="Cancelar OS"
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setConfirmarCancelar(false)}
              disabled={pendente}
            >
              Voltar
            </Button>
            <Button
              variant="danger"
              loading={pendente}
              onClick={() =>
                iniciar(async () => {
                  await cancelarOrdemServico(os.id)
                  setConfirmarCancelar(false)
                })
              }
            >
              Cancelar OS
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-700">
          Cancelar a OS <strong>{os.codigoExibicao}</strong>? Esta acao e irreversivel.
        </p>
      </Modal>
    </div>
  )
}
