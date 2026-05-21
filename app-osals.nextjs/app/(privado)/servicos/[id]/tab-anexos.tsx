'use client'

import { useState, useTransition } from 'react'
import { anexarAoServico, removerAnexoServico } from '@/app/actions/anexo'
import type { AnexoServicoResposta } from '@/app/lib/definicoes'
import { UploadPDF } from '@/components/app/UploadPDF'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

type Props = {
  servicoId: number
  podeRemover: boolean
  anexos: AnexoServicoResposta[]
}

export function TabAnexos({ servicoId, podeRemover, anexos }: Props) {
  const [excluir, setExcluir] = useState<AnexoServicoResposta | null>(null)
  const [pendente, iniciar] = useTransition()
  const acao = anexarAoServico.bind(null, servicoId)

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-slate-200 p-4">
        <p className="text-sm font-medium text-slate-700 mb-2">Anexar novo PDF</p>
        <UploadPDF acao={acao} comDescricao rotuloBotao="Anexar" />
      </div>

      {anexos.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-slate-500">Nenhum anexo neste servico.</p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-slate-200 bg-slate-50">
                <th className="px-5 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Arquivo</th>
                <th className="px-5 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tamanho</th>
                <th className="px-5 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Enviado</th>
                {podeRemover && <th className="px-5 py-2.5 w-px" />}
              </tr>
            </thead>
            <tbody>
              {anexos.map((a) => (
                <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-2.5">
                    <a
                      href={`/api-proxy/anexos-servico/${a.id}/conteudo`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-medium"
                    >
                      {a.nomeArquivo}
                    </a>
                    {a.descricao && (
                      <span className="block text-xs text-slate-400">{a.descricao}</span>
                    )}
                  </td>
                  <td className="px-5 py-2.5 text-slate-600">{formatarTamanho(a.tamanhoBytes)}</td>
                  <td className="px-5 py-2.5 text-slate-600">
                    {formatarData(a.createdAt)}
                    {a.createdByNome ? ` · ${a.createdByNome}` : ''}
                  </td>
                  {podeRemover && (
                    <td className="px-5 py-2.5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setExcluir(a)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Excluir
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!podeRemover && anexos.length > 0 && (
        <p className="text-xs text-slate-500">
          Servico encerrado — apenas gerente ou admin podem remover anexos.
        </p>
      )}

      <Modal
        open={excluir != null}
        onClose={() => setExcluir(null)}
        title="Excluir anexo"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setExcluir(null)} disabled={pendente}>
              Voltar
            </Button>
            <Button
              variant="danger"
              loading={pendente}
              onClick={() => {
                const alvo = excluir
                if (!alvo) return
                iniciar(async () => {
                  await removerAnexoServico(servicoId, alvo.id)
                  setExcluir(null)
                })
              }}
            >
              Excluir
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-700">
          Excluir o anexo <strong>{excluir?.nomeArquivo}</strong>?
        </p>
      </Modal>
    </div>
  )
}

function formatarTamanho(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function formatarData(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('pt-BR')
}
