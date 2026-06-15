'use client'

import { useState, useTransition } from 'react'
import {
  excluirNota,
  fecharFaturamento,
  reabrirFaturamento,
} from '@/app/actions/faturamento'
import type { FaturamentoResposta, NotaFiscalResposta } from '@/app/lib/definicoes'
import { formatarDataIso } from '@/app/lib/data'
import { badgeStatusFaturamento } from '@/app/lib/esquemas/faturamento'
import { centavosParaReais } from '@/app/lib/moeda'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ModalNotaFiscal } from './modal-nota-fiscal'

type Props = {
  servicoId: number
  faturamento: FaturamentoResposta
  podeAlterar: boolean
  ehAdmin: boolean
}

export function TabFaturamento({ servicoId, faturamento, podeAlterar, ehAdmin }: Props) {
  const [modal, setModal] = useState<'novo' | NotaFiscalResposta | null>(null)
  const [excluir, setExcluir] = useState<NotaFiscalResposta | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [pendente, iniciar] = useTransition()

  const fechado = faturamento.status === 'FECHADO'
  const podeEditarNotas = podeAlterar && !fechado

  if (!faturamento.aplicavel) {
    return (
      <div className="py-8 text-center">
        <p className="text-slate-500">Faturamento nao se aplica a este servico.</p>
        <p className="text-xs text-slate-400 mt-2">
          Defina a cobranca como <strong>Cobrado</strong> na aba Cobranca para emitir notas fiscais.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {erro && (
        <Alert variant="danger" dismissible>
          {erro}
        </Alert>
      )}

      {/* Resumo: status, valor da cobranca, total das NFs e diferenca */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Resumo titulo="Status">
          <Badge variant={badgeStatusFaturamento(faturamento.status)} dot size="sm">
            {faturamento.statusRotulo}
          </Badge>
        </Resumo>
        <Resumo titulo="Valor da cobranca">
          <span className="text-sm font-medium text-slate-900">
            {faturamento.valorCobrancaCentavos != null
              ? centavosParaReais(faturamento.valorCobrancaCentavos)
              : '—'}
          </span>
        </Resumo>
        <Resumo titulo="Total das NFs">
          <span className="text-sm font-medium text-slate-900">
            {centavosParaReais(faturamento.totalNfCentavos)}
          </span>
        </Resumo>
        <Resumo titulo="Diferenca">
          <DiferencaBadge diferencaCentavos={faturamento.diferencaCentavos} />
        </Resumo>
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-slate-500">
          {faturamento.notas.length} {faturamento.notas.length === 1 ? 'nota fiscal' : 'notas fiscais'}
        </p>
        {podeEditarNotas && (
          <Button variant="primary" size="sm" onClick={() => setModal('novo')}>
            + Nota fiscal
          </Button>
        )}
      </div>

      {faturamento.notas.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-slate-500">Nenhuma nota fiscal lancada.</p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-slate-200 bg-slate-50">
                <th className="px-5 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Numero</th>
                <th className="px-5 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Emissao</th>
                <th className="px-5 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Valor</th>
                {podeEditarNotas && <th className="px-5 py-2.5 w-px" />}
              </tr>
            </thead>
            <tbody>
              {faturamento.notas.map((nf) => (
                <tr key={nf.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-2.5 text-slate-700 font-medium">{nf.numero}</td>
                  <td className="px-5 py-2.5 whitespace-nowrap text-slate-600">{formatarDataIso(nf.dataEmissao)}</td>
                  <td className="px-5 py-2.5 text-right font-medium text-slate-900">
                    {centavosParaReais(nf.valorCentavos)}
                  </td>
                  {podeEditarNotas && (
                    <td className="px-5 py-2.5 whitespace-nowrap text-right">
                      <button
                        type="button"
                        onClick={() => setModal(nf)}
                        className="text-xs text-primary hover:underline mr-3"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => setExcluir(nf)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Excluir
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-slate-200 bg-slate-50">
                <td className="px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wider" colSpan={2}>
                  Total
                </td>
                <td className="px-5 py-2.5 text-right font-semibold text-slate-900">
                  {centavosParaReais(faturamento.totalNfCentavos)}
                </td>
                {podeEditarNotas && <td />}
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Acoes de fechamento */}
      <div className="flex items-center justify-between gap-4 pt-1 flex-wrap">
        <div className="text-xs text-slate-500">
          {fechado ? (
            <>
              Fechado
              {faturamento.fechadoEm ? ` em ${formatarDataIso(faturamento.fechadoEm.slice(0, 10))}` : ''}
              {faturamento.fechadoPorNome ? ` por ${faturamento.fechadoPorNome}` : ''}
            </>
          ) : (
            'Para fechar, a soma das NFs precisa bater com o valor da cobranca.'
          )}
        </div>

        {fechado
          ? ehAdmin && (
              <Button
                variant="secondary"
                size="sm"
                loading={pendente}
                onClick={() =>
                  iniciar(async () => {
                    const r = await reabrirFaturamento(servicoId)
                    if (r?.erro) setErro(r.erro)
                  })
                }
              >
                Reabrir faturamento
              </Button>
            )
          : podeAlterar && (
              <Button
                variant="primary"
                size="sm"
                disabled={!faturamento.podeFechar}
                loading={pendente}
                onClick={() =>
                  iniciar(async () => {
                    const r = await fecharFaturamento(servicoId)
                    if (r?.erro) setErro(r.erro)
                  })
                }
              >
                Fechar faturamento
              </Button>
            )}
      </div>

      {modal && (
        <ModalNotaFiscal
          servicoId={servicoId}
          nota={modal === 'novo' ? null : modal}
          onClose={() => setModal(null)}
        />
      )}

      <Modal
        open={excluir != null}
        onClose={() => setExcluir(null)}
        title="Excluir nota fiscal"
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
                  await excluirNota(servicoId, alvo.id)
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
          Excluir a nota fiscal <strong>{excluir?.numero}</strong> no valor de{' '}
          <strong>{excluir ? centavosParaReais(excluir.valorCentavos) : ''}</strong>?
        </p>
      </Modal>
    </div>
  )
}

function Resumo({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">{titulo}</p>
      {children}
    </div>
  )
}

function DiferencaBadge({ diferencaCentavos }: { diferencaCentavos: number | null }) {
  if (diferencaCentavos == null) {
    return <span className="text-sm text-slate-400">—</span>
  }
  if (diferencaCentavos === 0) {
    return (
      <Badge variant="success" size="sm">
        Bate
      </Badge>
    )
  }
  if (diferencaCentavos > 0) {
    return (
      <Badge variant="warning" size="sm">
        Faltam {centavosParaReais(diferencaCentavos)}
      </Badge>
    )
  }
  return (
    <Badge variant="danger" size="sm">
      Excede {centavosParaReais(-diferencaCentavos)}
    </Badge>
  )
}
