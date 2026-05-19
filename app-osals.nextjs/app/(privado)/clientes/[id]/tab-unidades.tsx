'use client'

import { useState } from 'react'
import type { UnidadeResposta } from '@/app/lib/definicoes'
import { inativarUnidade } from '@/app/actions/unidade'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ModalUnidade } from './modal-unidade'

type Props = {
  clienteId: number
  unidades: UnidadeResposta[]
  podeInativarItens: boolean
}

export function TabUnidades({ clienteId, unidades, podeInativarItens }: Props) {
  const [modalNova, setModalNova] = useState(false)
  const [modalEdicao, setModalEdicao] = useState<UnidadeResposta | null>(null)

  async function inativar(u: UnidadeResposta) {
    if (!confirm(`Inativar unidade "${u.identificacaoInterna}"?`)) return
    await inativarUnidade(clienteId, u.id)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {unidades.length} {unidades.length === 1 ? 'unidade cadastrada' : 'unidades cadastradas'}
        </p>
        <Button size="sm" onClick={() => setModalNova(true)}>
          + Nova unidade
        </Button>
      </div>

      {unidades.length === 0 ? (
        <div className="border border-dashed border-slate-200 rounded-lg p-8 text-center">
          <p className="text-sm text-slate-500">Nenhuma unidade cadastrada.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {unidades.map((u) => (
            <div
              key={u.id}
              className={[
                'border rounded-lg p-4',
                u.ativo ? 'border-slate-200 bg-white' : 'border-slate-200 bg-slate-50',
              ].join(' ')}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-slate-900">{u.identificacaoInterna}</h3>
                    {!u.ativo && (
                      <Badge variant="default" size="sm">
                        Inativa
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-600">{formatarEndereco(u)}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="xs" variant="outline" onClick={() => setModalEdicao(u)}>
                    Editar
                  </Button>
                  {podeInativarItens && u.ativo && (
                    <Button size="xs" variant="ghost" onClick={() => inativar(u)}>
                      Inativar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalNova && (
        <ModalUnidade
          clienteId={clienteId}
          unidade={null}
          onClose={() => setModalNova(false)}
        />
      )}
      {modalEdicao && (
        <ModalUnidade
          clienteId={clienteId}
          unidade={modalEdicao}
          onClose={() => setModalEdicao(null)}
        />
      )}
    </div>
  )
}

function formatarEndereco(u: UnidadeResposta): string {
  const partes: string[] = []
  if (u.logradouro) {
    partes.push(u.logradouro + (u.numero ? ', ' + u.numero : ''))
  }
  if (u.complemento) partes.push(u.complemento)
  if (u.bairro) partes.push(u.bairro)
  if (u.cidade) partes.push(u.cidade + (u.estado ? '/' + u.estado : ''))
  if (u.cep) partes.push('CEP ' + formatarCep(u.cep))
  return partes.length ? partes.join(' · ') : 'Sem endereco cadastrado'
}

function formatarCep(cep: string): string {
  return cep.length === 8 ? `${cep.slice(0, 5)}-${cep.slice(5)}` : cep
}
