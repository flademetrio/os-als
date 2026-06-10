'use client'

import { useState } from 'react'
import type { ContatoClienteResposta } from '@/app/lib/definicoes'
import { removerContato } from '@/app/actions/contato'
import { Button } from '@/components/ui/Button'
import { ModalContato } from './modal-contato'

type Props = {
  clienteId: number
  contatos: ContatoClienteResposta[]
  podeGerenciar: boolean
}

export function TabContatos({ clienteId, contatos, podeGerenciar }: Props) {
  const [modalNovo, setModalNovo] = useState(false)
  const [modalEdicao, setModalEdicao] = useState<ContatoClienteResposta | null>(null)

  async function remover(c: ContatoClienteResposta) {
    if (!confirm(`Remover contato "${c.nome}"?`)) return
    await removerContato(clienteId, c.id)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {contatos.length} {contatos.length === 1 ? 'contato cadastrado' : 'contatos cadastrados'}
        </p>
        {podeGerenciar && (
          <Button size="sm" onClick={() => setModalNovo(true)}>
            + Novo contato
          </Button>
        )}
      </div>

      {contatos.length === 0 ? (
        <div className="border border-dashed border-slate-200 rounded-lg p-8 text-center">
          <p className="text-sm text-slate-500">Nenhum contato cadastrado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {contatos.map((c) => (
            <div key={c.id} className="border border-slate-200 rounded-lg p-4 bg-white">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-slate-900">{c.nome}</h3>
                  {c.funcao && <p className="text-xs text-slate-500 mt-0.5">{c.funcao}</p>}
                  <div className="text-sm text-slate-600 mt-1 space-x-3">
                    {c.telefone && <span>📞 {c.telefone}</span>}
                    {c.email && <span>✉ {c.email}</span>}
                  </div>
                </div>
                {podeGerenciar && (
                  <div className="flex gap-2 shrink-0">
                    <Button size="xs" variant="outline" onClick={() => setModalEdicao(c)}>
                      Editar
                    </Button>
                    <Button size="xs" variant="ghost" onClick={() => remover(c)}>
                      Remover
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {modalNovo && (
        <ModalContato
          clienteId={clienteId}
          contato={null}
          onClose={() => setModalNovo(false)}
        />
      )}
      {modalEdicao && (
        <ModalContato
          clienteId={clienteId}
          contato={modalEdicao}
          onClose={() => setModalEdicao(null)}
        />
      )}
    </div>
  )
}
