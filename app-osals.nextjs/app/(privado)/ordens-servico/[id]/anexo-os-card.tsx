'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { anexarNaOs, removerAnexoOs } from '@/app/actions/anexo'
import type { AnexoOsResposta } from '@/app/lib/definicoes'
import { UploadPDF } from '@/components/app/UploadPDF'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'

type Props = {
  osId: number
  anexo: AnexoOsResposta | null
  podeAlterar: boolean
}

/** Anexo unico da OS — o scan do papel preenchido pela equipe. */
export function AnexoOsCard({ osId, anexo, podeAlterar }: Props) {
  const router = useRouter()
  const [confirmar, setConfirmar] = useState(false)
  const [substituindo, setSubstituindo] = useState(false)
  const [pendente, iniciar] = useTransition()
  const acao = anexarNaOs.bind(null, osId)

  return (
    <Card padding="md" title="Anexo (scan da OS preenchida)">
      {anexo ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <a
                href={`/api-proxy/ordens-servico/${osId}/anexo/conteudo`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                {anexo.nomeArquivo}
              </a>
              <p className="text-xs text-slate-400">
                {formatarTamanho(anexo.tamanhoBytes)} · enviado em {formatarData(anexo.createdAt)}
                {anexo.createdByNome ? ` por ${anexo.createdByNome}` : ''}
              </p>
            </div>
            {podeAlterar && (
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSubstituindo((v) => !v)}
                >
                  {substituindo ? 'Cancelar' : 'Substituir'}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirmar(true)}>
                  Remover
                </Button>
              </div>
            )}
          </div>
          {podeAlterar && substituindo && (
            <div className="rounded-lg border border-slate-200 p-3">
              <UploadPDF
                acao={acao}
                rotuloBotao="Substituir anexo"
                onSucesso={() => setSubstituindo(false)}
              />
            </div>
          )}
        </div>
      ) : podeAlterar ? (
        <UploadPDF acao={acao} rotuloBotao="Anexar scan" />
      ) : (
        <p className="text-sm text-slate-500">Nenhum anexo enviado.</p>
      )}

      <Modal
        open={confirmar}
        onClose={() => setConfirmar(false)}
        title="Remover anexo"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmar(false)} disabled={pendente}>
              Voltar
            </Button>
            <Button
              variant="danger"
              loading={pendente}
              onClick={() =>
                iniciar(async () => {
                  await removerAnexoOs(osId)
                  setConfirmar(false)
                  router.refresh()
                })
              }
            >
              Remover
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-700">Remover o anexo desta OS?</p>
      </Modal>
    </Card>
  )
}

function formatarTamanho(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function formatarData(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}
