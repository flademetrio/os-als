'use client'

import { useState } from 'react'
import type { TipoServicoResposta } from '@/app/lib/definicoes'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ModalEdicaoTipoServico } from './modal-edicao-tipo-servico'

export function ListaTiposServico({ tipos }: { tipos: TipoServicoResposta[] }) {
  const [editando, setEditando] = useState<TipoServicoResposta | null>(null)

  if (!tipos.length) {
    return <p className="text-sm text-slate-500">Nenhum tipo cadastrado.</p>
  }

  return (
    <>
      <ul className="divide-y divide-slate-100">
        {tipos.map((t) => (
          <li
            key={t.id}
            className="flex items-center justify-between gap-3 py-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-sm font-medium text-slate-900 truncate">
                {t.nome}
              </span>
              <Badge variant={t.ativo ? 'success' : 'default'} size="sm" dot>
                {t.ativo ? 'Ativo' : 'Inativo'}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditando(t)}
            >
              Editar
            </Button>
          </li>
        ))}
      </ul>

      {editando && (
        <ModalEdicaoTipoServico
          tipo={editando}
          aoFechar={() => setEditando(null)}
        />
      )}
    </>
  )
}
