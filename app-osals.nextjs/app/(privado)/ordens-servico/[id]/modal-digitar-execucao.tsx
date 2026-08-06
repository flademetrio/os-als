'use client'

import { useActionState, useEffect, useState } from 'react'
import {
  digitarExecucaoOs,
  editarExecucaoOs,
  type EstadoOrdemServico,
} from '@/app/actions/ordem-servico'
import type { OrdemServicoResposta } from '@/app/lib/definicoes'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Textarea'

const ESTADO_INICIAL: EstadoOrdemServico = {}

/** Converte ISO (UTC) para datetime-local (hora local): "YYYY-MM-DDTHH:mm". */
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

/** Separa um instante ISO em {data, hora} local; usa os fallbacks se nao houver. */
function partes(iso: string | null, dataFallback: string, horaFallback: string) {
  const dl = paraDatetimeLocal(iso)
  if (dl) {
    const [data, hora] = dl.split('T')
    return { data, hora }
  }
  return { data: dataFallback, hora: horaFallback }
}

export function ModalDigitarExecucao({
  os,
  onClose,
  onConcluido,
  editar = false,
}: {
  os: OrdemServicoResposta
  /** Fecha o modal sem concluir (botao Cancelar / X). */
  onClose: () => void
  /** Chamado quando a execucao e salva com sucesso. */
  onConcluido: () => void
  /** Modo correcao (OS ja concluida): edita a execucao sem mudar o status. */
  editar?: boolean
}) {
  const acao = (editar ? editarExecucaoOs : digitarExecucaoOs).bind(null, os.id)
  const [estado, dispatch, pendente] = useActionState(acao, ESTADO_INICIAL)

  // Padrao: data da OS e expediente 07:00 / 17:00. Se ja houver execucao
  // digitada (reabertura), mantem os valores existentes.
  const diaAgendado = os.dataAgendada?.slice(0, 10) ?? hojeLocal()
  const ini = partes(os.horaInicioExecucao, diaAgendado, '07:00')
  const fim = partes(os.horaFimExecucao, diaAgendado, '17:00')

  const [dataInicio, setDataInicio] = useState(ini.data)
  const [horaInicio, setHoraInicio] = useState(ini.hora)
  const [dataFim, setDataFim] = useState(fim.data)
  const [horaFim, setHoraFim] = useState(fim.hora)

  // Valores combinados enviados ao backend (mesmo formato datetime-local).
  const inicioValor = dataInicio && horaInicio ? `${dataInicio}T${horaInicio}` : ''
  const fimValor = dataFim && horaFim ? `${dataFim}T${horaFim}` : ''

  function manha() {
    setHoraInicio('07:00')
    setHoraFim('12:00')
  }
  function tarde() {
    setHoraInicio('12:00')
    setHoraFim('17:00')
  }

  useEffect(() => {
    if (estado.sucesso) onConcluido()
  }, [estado.sucesso, onConcluido])

  return (
    <Modal
      open
      onClose={onClose}
      title={editar ? 'Editar execucao da OS' : 'Digitar execucao da OS'}
      size="lg"
    >
      <form action={dispatch} className="space-y-4">
        {estado.erro && (
          <Alert variant="danger" dismissible>
            {estado.erro}
          </Alert>
        )}
        <p className="text-xs text-slate-500">
          {editar
            ? 'Corrija os dados da execucao. A OS continua concluida.'
            : 'Lance os dados preenchidos pela equipe. Ao salvar, a OS e concluida.'}
        </p>

        {/* Valores combinados (data + hora) enviados ao backend. */}
        <input type="hidden" name="horaInicioExecucao" value={inicioValor} />
        <input type="hidden" name="horaFimExecucao" value={fimValor} />

        {/* Atalhos de periodo */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-slate-500">Atalhos:</span>
          <button
            type="button"
            onClick={manha}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-primary hover:text-primary"
          >
            Manha (07:00–12:00)
          </button>
          <button
            type="button"
            onClick={tarde}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-primary hover:text-primary"
          >
            Tarde (12:00–17:00)
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Data de inicio"
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            error={estado.errosCampos?.horaInicioExecucao}
            fullWidth
          />
          <Input
            label="Hora de inicio"
            type="time"
            value={horaInicio}
            onChange={(e) => setHoraInicio(e.target.value)}
            fullWidth
          />
          <Input
            label="Data de termino"
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            error={estado.errosCampos?.horaFimExecucao}
            fullWidth
          />
          <Input
            label="Hora de termino"
            type="time"
            value={horaFim}
            onChange={(e) => setHoraFim(e.target.value)}
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
            {pendente ? 'Salvando...' : editar ? 'Salvar' : 'Concluir OS'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
