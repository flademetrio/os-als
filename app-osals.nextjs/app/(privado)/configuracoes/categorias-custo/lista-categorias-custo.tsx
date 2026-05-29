'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { excluirCategoriaCusto } from '@/app/actions/configuracao'
import type { CategoriaCustoResposta, TipoLancamentoCusto } from '@/app/lib/definicoes'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
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
  const router = useRouter()
  const [editando, setEditando] = useState<CategoriaCustoResposta | null>(null)
  const [excluindo, setExcluindo] = useState<CategoriaCustoResposta | null>(null)
  const [erroExclusao, setErroExclusao] = useState<string | null>(null)
  const [pendente, iniciar] = useTransition()

  if (!categorias.length) {
    return <p className="text-sm text-slate-500">Nenhuma categoria cadastrada.</p>
  }

  function confirmarExclusao(c: CategoriaCustoResposta) {
    setErroExclusao(null)
    iniciar(async () => {
      const r = await excluirCategoriaCusto(c.id)
      if (r.erro) {
        setErroExclusao(r.erro)
      } else {
        setExcluindo(null)
        router.refresh()
      }
    })
  }

  function fecharConfirmacao() {
    if (pendente) return
    setExcluindo(null)
    setErroExclusao(null)
  }

  return (
    <>
      <ul className="divide-y divide-slate-100">
        {categorias.map((c) => {
          const podeExcluir = c.tipoLancamento === 'LIVRE'
          return (
            <li key={c.id} className="flex items-center justify-between gap-3 py-3">
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
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="sm" onClick={() => setEditando(c)}>
                  Editar
                </Button>
                {podeExcluir && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setErroExclusao(null)
                      setExcluindo(c)
                    }}
                  >
                    Apagar
                  </Button>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      {editando && (
        <ModalEdicaoCategoriaCusto
          categoria={editando}
          aoFechar={() => setEditando(null)}
        />
      )}

      <Modal
        open={excluindo !== null}
        onClose={fecharConfirmacao}
        title="Apagar categoria"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={fecharConfirmacao} disabled={pendente}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              loading={pendente}
              onClick={() => excluindo && confirmarExclusao(excluindo)}
            >
              Apagar
            </Button>
          </>
        }
      >
        {erroExclusao && (
          <Alert variant="danger" dismissible>
            {erroExclusao}
          </Alert>
        )}
        <p className="text-sm text-slate-700 mt-2">
          Apagar a categoria <strong>{excluindo?.nome}</strong>? A acao e
          irreversivel. Categorias com lancamentos historicos nao podem ser
          apagadas — use o desativar nesse caso.
        </p>
      </Modal>
    </>
  )
}
