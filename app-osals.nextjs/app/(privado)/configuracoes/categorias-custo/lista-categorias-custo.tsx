'use client'

import { useState } from 'react'
import type { CategoriaCustoResposta, TipoLancamentoCusto } from '@/app/lib/definicoes'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ModalEdicaoCategoriaCusto } from './modal-edicao-categoria-custo'

const LABEL_TIPO: Record<TipoLancamentoCusto, string> = {
  ESTRUTURADO_MAO_OBRA: 'Mao de obra',
  ESTRUTURADO_DESLOCAMENTO: 'Deslocamento',
  LIVRE: 'Livre',
}

export function ListaCategoriasCusto({
  categorias,
}: {
  categorias: CategoriaCustoResposta[]
}) {
  const [editando, setEditando] = useState<CategoriaCustoResposta | null>(null)

  if (!categorias.length) {
    return <p className="text-sm text-slate-500">Nenhuma categoria cadastrada.</p>
  }

  return (
    <>
      <ul className="divide-y divide-slate-100">
        {categorias.map((c) => (
          <li
            key={c.id}
            className="flex items-center justify-between gap-3 py-3"
          >
            <div className="flex items-center gap-3 min-w-0 flex-wrap">
              <span className="text-sm font-medium text-slate-900 truncate">
                {c.nome}
              </span>
              <Badge variant="info" size="sm">
                {LABEL_TIPO[c.tipoLancamento]}
              </Badge>
              <span className="text-xs text-slate-400 font-mono">{c.codigo}</span>
              <Badge variant={c.ativo ? 'success' : 'default'} size="sm" dot>
                {c.ativo ? 'Ativa' : 'Inativa'}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditando(c)}
            >
              Editar
            </Button>
          </li>
        ))}
      </ul>

      {editando && (
        <ModalEdicaoCategoriaCusto
          categoria={editando}
          aoFechar={() => setEditando(null)}
        />
      )}
    </>
  )
}
