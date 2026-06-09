'use client'

import { useState, useTransition } from 'react'
import { excluirCusto } from '@/app/actions/custo'
import type {
  CategoriaCustoResposta,
  LancamentoCustoResposta,
  ResumoFinanceiroServico,
  TecnicoResumoDto,
} from '@/app/lib/definicoes'
import { formatarDataIso } from '@/app/lib/data'
import { centavosParaReais } from '@/app/lib/moeda'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ModalCusto } from './modal-custo'

type Props = {
  servicoId: number
  podeAlterar: boolean
  resumo: ResumoFinanceiroServico
  lancamentos: LancamentoCustoResposta[]
  categorias: CategoriaCustoResposta[]
  tecnicos: TecnicoResumoDto[]
}

export function TabCustos({
  servicoId,
  podeAlterar,
  lancamentos,
  categorias,
  tecnicos,
}: Props) {
  const [modal, setModal] = useState<'novo' | LancamentoCustoResposta | null>(null)
  const [excluir, setExcluir] = useState<LancamentoCustoResposta | null>(null)
  const [pendente, iniciar] = useTransition()

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-slate-500">
          {lancamentos.length} {lancamentos.length === 1 ? 'lancamento' : 'lancamentos'}
        </p>
        {podeAlterar && (
          <Button variant="primary" size="sm" onClick={() => setModal('novo')}>
            + Lancar custo
          </Button>
        )}
      </div>

      {lancamentos.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-slate-500">Nenhum custo lancado neste servico.</p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-slate-200 bg-slate-50">
                <th className="px-5 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Data</th>
                <th className="px-5 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Categoria</th>
                <th className="px-5 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Detalhe</th>
                <th className="px-5 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Valor</th>
                {podeAlterar && <th className="px-5 py-2.5 w-px" />}
              </tr>
            </thead>
            <tbody>
              {lancamentos.map((l) => (
                <tr key={l.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-2.5 whitespace-nowrap text-slate-600">{formatarDataIso(l.dataCusto)}</td>
                  <td className="px-5 py-2.5 text-slate-700">{l.categoriaNome}</td>
                  <td className="px-5 py-2.5 text-slate-600">{detalhe(l)}</td>
                  <td className="px-5 py-2.5 text-right font-medium text-slate-900">
                    {centavosParaReais(l.valorTotalCentavos)}
                  </td>
                  {podeAlterar && (
                    <td className="px-5 py-2.5 whitespace-nowrap text-right">
                      <button
                        type="button"
                        onClick={() => setModal(l)}
                        className="text-xs text-primary hover:underline mr-3"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => setExcluir(l)}
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

      {!podeAlterar && (
        <p className="text-xs text-slate-500">
          Servico encerrado — apenas gerente ou admin podem alterar os custos.
        </p>
      )}

      {modal && (
        <ModalCusto
          servicoId={servicoId}
          categorias={categorias}
          tecnicos={tecnicos}
          lancamento={modal === 'novo' ? null : modal}
          onClose={() => setModal(null)}
        />
      )}

      <Modal
        open={excluir != null}
        onClose={() => setExcluir(null)}
        title="Excluir custo"
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
                  await excluirCusto(servicoId, alvo.id)
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
          Excluir o lancamento de <strong>{excluir?.categoriaNome}</strong> no valor de{' '}
          <strong>{excluir ? centavosParaReais(excluir.valorTotalCentavos) : ''}</strong>?
        </p>
      </Modal>
    </div>
  )
}

function detalhe(l: LancamentoCustoResposta): string {
  if (l.tipoLancamento === 'ESTRUTURADO_MAO_OBRA') {
    const horas = l.horas != null ? `${String(l.horas).replace('.', ',')}h` : ''
    return [l.tecnicoNome, horas].filter(Boolean).join(' — ') || '-'
  }
  if (l.tipoLancamento === 'ESTRUTURADO_DESLOCAMENTO') {
    const km = l.km != null ? `${String(l.km).replace('.', ',')} km` : ''
    return [km, l.descricao].filter(Boolean).join(' · ') || '-'
  }
  return l.descricao || '-'
}
