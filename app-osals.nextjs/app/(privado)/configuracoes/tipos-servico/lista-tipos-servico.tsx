'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { excluirTipoServico } from '@/app/actions/configuracao'
import type { TipoServicoResposta } from '@/app/lib/definicoes'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ModalEdicaoTipoServico } from './modal-edicao-tipo-servico'

export function ListaTiposServico({ tipos }: { tipos: TipoServicoResposta[] }) {
  const router = useRouter()
  const [editando, setEditando] = useState<TipoServicoResposta | null>(null)
  const [excluindo, setExcluindo] = useState<TipoServicoResposta | null>(null)
  const [erroExclusao, setErroExclusao] = useState<string | null>(null)
  const [pendente, iniciar] = useTransition()

  if (!tipos.length) {
    return <p className="text-sm text-slate-500">Nenhum tipo cadastrado.</p>
  }

  function confirmarExclusao(t: TipoServicoResposta) {
    setErroExclusao(null)
    iniciar(async () => {
      const r = await excluirTipoServico(t.id)
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
            <div className="flex items-center gap-1 shrink-0">
              <Button variant="ghost" size="sm" onClick={() => setEditando(t)}>
                Editar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setErroExclusao(null)
                  setExcluindo(t)
                }}
              >
                Apagar
              </Button>
            </div>
          </li>
        ))}
      </ul>

      {editando && (
        <ModalEdicaoTipoServico
          tipo={editando}
          aoFechar={() => setEditando(null)}
        />
      )}

      <Modal
        open={excluindo !== null}
        onClose={fecharConfirmacao}
        title="Apagar tipo de servico"
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
          Apagar o tipo <strong>{excluindo?.nome}</strong>? A acao e irreversivel.
          Tipos com servico vinculado nao podem ser apagados — use o desativar
          nesse caso.
        </p>
      </Modal>
    </>
  )
}
