'use client'

import { useState } from 'react'
import type { ServicoResposta, TipoServicoResposta } from '@/app/lib/definicoes'
import { Button } from '@/components/ui/Button'
import { ModalEditarServico } from './modal-editar-servico'

type Props = {
  servico: ServicoResposta
  tipos: TipoServicoResposta[]
}

/** Exibe os dados do servico como texto. A edicao acontece via modal. */
export function TabDados({ servico, tipos }: Props) {
  const [editando, setEditando] = useState(false)
  const encerrado = servico.status === 'CONCLUIDO' || servico.status === 'CANCELADO'

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-sm font-semibold text-slate-700">Dados do servico</h2>
        {!encerrado && (
          <Button variant="secondary" size="sm" onClick={() => setEditando(true)}>
            Editar
          </Button>
        )}
      </div>

      <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
        <Campo titulo="Cliente" valor={servico.clienteNome} />
        <Campo titulo="Tipo de servico" valor={servico.tipoServicoNome} />
        <Campo titulo="Status" valor={servico.statusRotulo} />
        <Campo titulo="Data de inicio prevista" valor={formatarData(servico.dataInicioPrevista)} />
        <Campo titulo="Data de fim prevista" valor={formatarData(servico.dataFimPrevista)} />
        <Campo titulo="Criado em" valor={formatarDataHora(servico.createdAt)} />
        <div className="sm:col-span-2 lg:col-span-3">
          <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Descricao
          </dt>
          <dd className="text-sm text-slate-700 whitespace-pre-wrap">{servico.descricao}</dd>
        </div>
      </dl>

      {encerrado && (
        <p className="text-xs text-slate-500">
          Servico {servico.statusRotulo.toLowerCase()} — os dados nao podem mais ser editados.
        </p>
      )}

      {editando && (
        <ModalEditarServico
          servico={servico}
          tipos={tipos}
          onClose={() => setEditando(false)}
        />
      )}
    </div>
  )
}

function Campo({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
        {titulo}
      </dt>
      <dd className="text-sm text-slate-700">{valor}</dd>
    </div>
  )
}

function formatarData(iso: string | null): string {
  if (!iso) return '-'
  const [ano, mes, dia] = iso.split('-')
  return dia && mes && ano ? `${dia}/${mes}/${ano}` : iso
}

function formatarDataHora(iso: string | null): string {
  if (!iso) return '-'
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}
