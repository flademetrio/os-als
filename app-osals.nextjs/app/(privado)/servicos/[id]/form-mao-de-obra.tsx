'use client'

import { useEffect, useState, useTransition } from 'react'
import { lancarMaoDeObra } from '@/app/actions/custo'
import type { MaoDeObraReferencia, TecnicoReferencia } from '@/app/lib/definicoes'
import { centavosParaReais } from '@/app/lib/moeda'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const FUSO = 'America/Sao_Paulo'
const HORAS_DIA = 9
const HORAS_MEIO = 4.5

type ModoHoras = 'DIA' | 'MEIO' | 'CUSTOM'

function hojeLocal(): string {
  const h = new Date()
  return `${h.getFullYear()}-${String(h.getMonth() + 1).padStart(2, '0')}-${String(h.getDate()).padStart(2, '0')}`
}

/** Hora (HH:mm) de um instante ISO, no fuso de Brasilia. */
function horaBR(iso: string | null): string | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleTimeString('pt-BR', { timeZone: FUSO, hour: '2-digit', minute: '2-digit' })
}

/**
 * Lancamento de Mao de Obra: escolhe a data, ve os tecnicos que trabalharam nas
 * OS deste servico no dia (e as OS deles no dia, com o horario quando digitada),
 * seleciona os tecnicos e as horas (Dia/Meio dia/livre). Cria um custo por tecnico.
 */
export function FormMaoDeObra({
  servicoId,
  categoriaId,
  onClose,
}: {
  servicoId: number
  categoriaId: number
  onClose: () => void
}) {
  const [data, setData] = useState<string>(hojeLocal())
  const [ref, setRef] = useState<MaoDeObraReferencia | null>(null)
  const [carregando, setCarregando] = useState(false)
  const [erroRef, setErroRef] = useState<string | null>(null)
  const [selecionados, setSelecionados] = useState<Set<number>>(new Set())
  const [modoHoras, setModoHoras] = useState<ModoHoras>('DIA')
  const [horasCustom, setHorasCustom] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [pendente, iniciar] = useTransition()

  useEffect(() => {
    if (!data) return
    let ativo = true

    const carregar = async () => {
      setCarregando(true)
      setErroRef(null)
      try {
        const r = await fetch(`/api-proxy/servicos/${servicoId}/mao-de-obra-referencia?data=${data}`)
        if (!r.ok) {
          const b = (await r.json().catch(() => null)) as { erro?: string } | null
          throw new Error(b?.erro ?? 'Falha ao carregar a referencia.')
        }
        const d = (await r.json()) as MaoDeObraReferencia
        if (!ativo) return
        setRef(d)
        setSelecionados(new Set(d.tecnicos.map((t) => t.tecnicoId)))
      } catch (e) {
        if (!ativo) return
        setRef({ tecnicos: [] })
        setErroRef(e instanceof Error ? e.message : 'Falha ao carregar a referencia.')
      } finally {
        if (ativo) setCarregando(false)
      }
    }

    void carregar()
    return () => {
      ativo = false
    }
  }, [servicoId, data])

  const horas =
    modoHoras === 'DIA' ? HORAS_DIA : modoHoras === 'MEIO' ? HORAS_MEIO : Number(horasCustom.replace(',', '.'))
  const horasValidas = Number.isFinite(horas) && horas > 0

  const tecnicos = ref?.tecnicos ?? []
  const totalCentavos = tecnicos
    .filter((t) => selecionados.has(t.tecnicoId))
    .reduce((s, t) => s + Math.round(t.valorHoraCentavos * (horasValidas ? horas : 0)), 0)

  function alternar(id: number) {
    setSelecionados((prev) => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  function salvar() {
    setErro(null)
    if (selecionados.size === 0) {
      setErro('Selecione ao menos um tecnico.')
      return
    }
    if (!horasValidas) {
      setErro('Informe as horas trabalhadas.')
      return
    }
    iniciar(async () => {
      const r = await lancarMaoDeObra(servicoId, {
        categoriaCustoId: categoriaId,
        dataCusto: data,
        tecnicoIds: [...selecionados],
        horas,
      })
      if (r?.erro) setErro(r.erro)
      else onClose()
    })
  }

  return (
    <div className="space-y-4">
      {erro && (
        <Alert variant="danger" dismissible>
          {erro}
        </Alert>
      )}

      <Input
        label="Data do trabalho"
        type="date"
        value={data}
        onChange={(e) => setData(e.target.value)}
        fullWidth
      />

      <div>
        <span className="block text-sm font-medium text-slate-700 mb-1.5">Horas trabalhadas</span>
        <div className="flex flex-wrap gap-2">
          <BotaoPreset ativo={modoHoras === 'DIA'} onClick={() => setModoHoras('DIA')}>
            Dia (9h)
          </BotaoPreset>
          <BotaoPreset ativo={modoHoras === 'MEIO'} onClick={() => setModoHoras('MEIO')}>
            Meio dia (4:30)
          </BotaoPreset>
          <BotaoPreset ativo={modoHoras === 'CUSTOM'} onClick={() => setModoHoras('CUSTOM')}>
            Nº de horas
          </BotaoPreset>
        </div>
        {modoHoras === 'CUSTOM' && (
          <div className="mt-2">
            <Input
              name="horasCustom"
              value={horasCustom}
              onChange={(e) => setHorasCustom(e.target.value)}
              placeholder="Ex.: 2,5"
              fullWidth
            />
          </div>
        )}
      </div>

      <div>
        <span className="block text-sm font-medium text-slate-700 mb-1.5">
          Técnicos que trabalharam neste dia
        </span>
        {carregando ? (
          <p className="text-sm text-slate-400 py-3">Carregando referência...</p>
        ) : tecnicos.length === 0 ? (
          <p className="text-sm text-slate-500 py-3">
            Nenhuma OS deste serviço com técnicos agendada para esse dia. Escolha uma data com OS
            agendada.
          </p>
        ) : (
          <div className="space-y-2">
            {tecnicos.map((t) => (
              <CardTecnico
                key={t.tecnicoId}
                tecnico={t}
                selecionado={selecionados.has(t.tecnicoId)}
                horas={horasValidas ? horas : 0}
                onToggle={() => alternar(t.tecnicoId)}
              />
            ))}
          </div>
        )}
        {erroRef && <p className="text-xs text-amber-600 mt-1">{erroRef}</p>}
      </div>

      {tecnicos.length > 0 && (
        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
          <span className="text-slate-500">
            {selecionados.size} técnico(s) × {String(horas).replace('.', ',')}h
          </span>
          <span className="font-semibold text-slate-900">Total: {centavosParaReais(totalCentavos)}</span>
        </div>
      )}

      <p className="text-xs text-slate-500">
        Cria um único custo de Mão de Obra somando os técnicos (valor = Σ valor/hora × horas); o
        detalhe fica com os nomes separados por vírgula.
      </p>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onClose} disabled={pendente}>
          Cancelar
        </Button>
        <Button
          type="button"
          variant="primary"
          loading={pendente}
          onClick={salvar}
          disabled={selecionados.size === 0 || !horasValidas}
        >
          {pendente ? 'Lançando...' : 'Lançar'}
        </Button>
      </div>
    </div>
  )
}

function BotaoPreset({
  ativo,
  onClick,
  children,
}: {
  ativo: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
        ativo
          ? 'border-primary bg-primary-light text-primary'
          : 'border-slate-300 text-slate-600 hover:border-primary hover:text-primary',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

function CardTecnico({
  tecnico,
  selecionado,
  horas,
  onToggle,
}: {
  tecnico: TecnicoReferencia
  selecionado: boolean
  horas: number
  onToggle: () => void
}) {
  const subtotal = Math.round(tecnico.valorHoraCentavos * horas)
  return (
    <label
      className={[
        'flex gap-3 rounded-lg border p-3 cursor-pointer transition-colors',
        selecionado ? 'border-primary bg-primary-light' : 'border-slate-200 hover:border-slate-300',
      ].join(' ')}
    >
      <input
        type="checkbox"
        checked={selecionado}
        onChange={onToggle}
        className="mt-0.5 h-4 w-4 shrink-0 accent-sky-600"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium text-slate-900">{tecnico.nome}</span>
          <span className="text-xs text-slate-500 shrink-0">
            {centavosParaReais(tecnico.valorHoraCentavos)}/h
            {selecionado && horas > 0 ? ` · ${centavosParaReais(subtotal)}` : ''}
          </span>
        </div>
        <ul className="mt-1 space-y-0.5">
          {tecnico.ordens.map((o) => {
            const ini = horaBR(o.horaInicioExecucao)
            const fim = horaBR(o.horaFimExecucao)
            return (
              <li key={o.osId} className="text-xs text-slate-500 truncate">
                <span className="font-mono">{o.codigoExibicao}</span>
                {o.desteServico ? ' (este serviço)' : ` · ${o.clienteNome}`}
                {ini && fim ? ` — trabalhou ${ini}–${fim}` : ' — sem digitação'}
              </li>
            )
          })}
        </ul>
      </div>
    </label>
  )
}
