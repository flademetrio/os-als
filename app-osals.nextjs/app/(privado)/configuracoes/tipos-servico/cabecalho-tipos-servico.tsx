'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { ModalNovoTipoServico } from './modal-novo-tipo-servico'

/** Cabecalho da pagina + botao "+ Novo tipo" (drawer). */
export function CabecalhoTiposServico() {
  const [novoAberto, setNovoAberto] = useState(false)

  return (
    <>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Tipos de servico</h1>
          <p className="text-sm text-slate-500 mt-1">
            Lista configuravel. Tipos sem servico vinculado podem ser excluidos.
            Caso contrario, use o desativar.
          </p>
        </div>
        <Button variant="primary" onClick={() => setNovoAberto(true)}>
          + Novo tipo
        </Button>
      </div>

      {novoAberto && <ModalNovoTipoServico aoFechar={() => setNovoAberto(false)} />}
    </>
  )
}
