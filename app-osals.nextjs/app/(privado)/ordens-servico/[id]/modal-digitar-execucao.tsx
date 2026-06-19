'use client'

import { useActionState, useEffect } from 'react'
import { digitarExecucaoOs, type EstadoOrdemServico } from '@/app/actions/ordem-servico'
import type { OrdemServicoResposta } from '@/app/lib/definicoes'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Textarea'

const ESTADO_INICIAL: EstadoOrdemServico = {}

/** Converte ISO (UTC) para o formato aceito por input datetime-local (hora local). */
function paraDatetimeLocal(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const ajuste = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return ajuste.toISOString().slice(0, 16)
}

/** Data de hoje no fuso local (YYYY-MM-DD) — fallback quando a OS nao tem data agendada. */
function hojeLocal(): string {
  const h = new Date()
  return `${h.getFullYear()}-${String(h.getMonth() + 1).padStart(2, '0')}-${String(h.getDate()).padStart(2, '0')}`
}

export function ModalDigitarExecucao({
  os,
  onClose,
  onConcluido,
}: {
  os: OrdemServicoResposta
  /** Fecha o modal sem concluir (botao Cancelar / X). */
  onClose: () => void
  /** Chamado quando a execucao e salva com sucesso (a OS e concluida). */
  onConcluido: () => void
}) {
  const acao = digitarExecucaoOs.bind(null, os.id)
  const [estado, dispatch, pendente] = useActionState(acao, ESTADO_INICIAL)

  // Pre-preenche com a data agendada da OS e o expediente padrao (07:00 / 17:00).
  // Se ja houver hora digitada (reabertura), mantem o valor existente.
  const diaAgendado = os.dataAgendada?.slice(0, 10) ?? hojeLocal()
  const inicioPadrao = os.horaInicioExecucao
    ? paraDatetimeLocal(os.horaInicioExecucao)
    : `${diaAgendado}T07:00`
  const fimPadrao = os.horaFimExecucao
    ? paraDatetimeLocal(os.horaFimExecucao)
    : `${diaAgendado}T17:00`

  useEffect(() => {
    if (estado.sucesso) onConcluido()
  }, [estado.sucesso, onConcluido])

  return (
    <Modal open onClose={onClose} title="Digitar execucao da OS" size="lg">
      <form action={dispatch} className="space-y-4">
        {estado.erro && (
          <Alert variant="danger" dismissible>
            {estado.erro}
          </Alert>
        )}
        <p className="text-xs text-slate-500">
          Lance os dados preenchidos pela equipe. Ao salvar, a OS e concluida.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Hora de inicio"
            name="horaInicioExecucao"
            type="datetime-local"
            defaultValue={inicioPadrao}
            error={estado.errosCampos?.horaInicioExecucao}
            fullWidth
          />
          <Input
            label="Hora de fim"
            name="horaFimExecucao"
            type="datetime-local"
            defaultValue={fimPadrao}
            error={estado.errosCampos?.horaFimExecucao}
            fullWidth
          />
        </div>

        <Textarea
          label="O que foi feito"
          name="oQueFoiFeito"
          required
          rows={4}
          defaultValue={os.oQueFoiFeito ?? ''}
          error={estado.errosCampos?.oQueFoiFeito}
          fullWidth
        />
        <Textarea
          label="Observacoes"
          name="observacoes"
          rows={2}
          defaultValue={os.observacoes ?? ''}
          error={estado.errosCampos?.observacoes}
          fullWidth
        />
        <Textarea
          label="Impedimentos"
          name="impedimentos"
          rows={2}
          defaultValue={os.impedimentos ?? ''}
          error={estado.errosCampos?.impedimentos}
          fullWidth
        />

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={pendente}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" loading={pendente}>
            {pendente ? 'Salvando...' : 'Concluir OS'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
