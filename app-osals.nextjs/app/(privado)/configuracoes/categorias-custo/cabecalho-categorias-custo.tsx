'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { ModalNovaCategoriaCusto } from './modal-nova-categoria-custo'

/** Cabecalho da pagina + botao "+ Nova categoria" (drawer). */
export function CabecalhoCategoriasCusto() {
  const [novoAberto, setNovoAberto] = useState(false)

  return (
    <>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Categorias de custo</h1>
          <p className="text-sm text-slate-500 mt-1">
            Categorias novas entram como tipo LIVRE. As duas estruturadas (Mao de obra
            e Deslocamento) sao do sistema — podem ser renomeadas ou desativadas, mas
            nao excluidas.
          </p>
        </div>
        <Button variant="primary" onClick={() => setNovoAberto(true)}>
          + Nova categoria
        </Button>
      </div>

      {novoAberto && <ModalNovaCategoriaCusto aoFechar={() => setNovoAberto(false)} />}
    </>
  )
}
