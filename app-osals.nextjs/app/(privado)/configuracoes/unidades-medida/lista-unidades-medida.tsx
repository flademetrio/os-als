'use client'

import { useState, useTransition } from 'react'
import { removerUnidadeMedida } from '@/app/actions/configuracao'
import type { UnidadeMedidaResposta } from '@/app/lib/definicoes'
import { Button } from '@/components/ui/Button'
import { ModalCriacaoUnidade } from './modal-criacao-unidade'
import { ModalEdicaoUnidade } from './modal-edicao-unidade'

export function ListaUnidadesMedida({
  unidades,
}: {
  unidades: UnidadeMedidaResposta[]
}) {
  const [criando, setCriando] = useState(false)
  const [editando, setEditando] = useState<UnidadeMedidaResposta | null>(null)
  const [removendoId, setRemovendoId] = useState<number | null>(null)
  const [pendente, startTransition] = useTransition()

  function aoRemover(u: UnidadeMedidaResposta) {
    const ok = window.confirm(
      `Remover a unidade "${u.sigla} - ${u.nome}"? Esta acao nao pode ser desfeita.`,
    )
    if (!ok) return
    setRemovendoId(u.id)
    startTransition(async () => {
      try {
        await removerUnidadeMedida(u.id)
      } finally {
        setRemovendoId(null)
      }
    })
  }

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-slate-500">
          {unidades.length} unidade{unidades.length === 1 ? '' : 's'} cadastrada
          {unidades.length === 1 ? '' : 's'}.
        </p>
        <Button variant="primary" size="sm" onClick={() => setCriando(true)}>
          Nova unidade
        </Button>
      </div>

      {unidades.length === 0 ? (
        <p className="text-sm text-slate-500 py-4 text-center">
          Nenhuma unidade cadastrada.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {unidades.map((u) => (
            <li
              key={u.id}
              className="flex items-center justify-between gap-3 py-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-sm font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                  {u.sigla}
                </span>
                <span className="text-sm text-slate-900 truncate">{u.nome}</span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditando(u)}
                  disabled={pendente}
                >
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => aoRemover(u)}
                  disabled={pendente && removendoId === u.id}
                >
                  {pendente && removendoId === u.id ? 'Removendo...' : 'Remover'}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {criando && <ModalCriacaoUnidade aoFechar={() => setCriando(false)} />}
      {editando && (
        <ModalEdicaoUnidade
          unidade={editando}
          aoFechar={() => setEditando(null)}
        />
      )}
    </>
  )
}
