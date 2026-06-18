'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type {
  ContatoClienteResposta,
  EquipamentoResumoDto,
  OrdemServicoResumoDto,
  ServicoResposta,
  TecnicoResumoDto,
  VeiculoResumoDto,
} from '@/app/lib/definicoes'
import { formatarDataIso } from '@/app/lib/data'
import { badgeStatusOs } from '@/app/lib/esquemas/ordem-servico'
import { imprimirOs } from '@/app/lib/imprimir-os'
import { Badge } from '@/components/ui/Badge'
import { BotaoAbrirOs } from './botao-abrir-os'
import { ModalDetalheOs } from './modal-detalhe-os'

type Props = {
  servico: ServicoResposta
  ordens: OrdemServicoResumoDto[]
  ehGestor: boolean
  ehAdmin?: boolean
  podeEditarOs?: boolean
  /** Perfil de faturamento pode anexar scan na OS mesmo sem gerenciar servico. */
  podeAnexarFaturamento?: boolean
  tecnicos: TecnicoResumoDto[]
  veiculos: VeiculoResumoDto[]
  equipamentos: EquipamentoResumoDto[]
  contatos: ContatoClienteResposta[]
}

/**
 * Lista as OS do servico, com a acao de abrir uma nova OS. Clicar numa
 * linha abre o detalhe da OS num modal lateral, sem sair da tela.
 */
export function TabOs({
  servico,
  ordens,
  ehGestor,
  ehAdmin = false,
  podeEditarOs = false,
  podeAnexarFaturamento = false,
  tecnicos,
  veiculos,
  equipamentos,
  contatos,
}: Props) {
  const router = useRouter()
  const [osAberta, setOsAberta] = useState<number | null>(null)
  const [imprimindoId, setImprimindoId] = useState<number | null>(null)

  const encerrado = servico.status === 'CONCLUIDO' || servico.status === 'CANCELADO'

  function fechar() {
    setOsAberta(null)
    // a OS pode ter mudado (impressa, concluida, cancelada) — atualiza a lista
    router.refresh()
  }

  async function imprimir(id: number) {
    setImprimindoId(id)
    try {
      await imprimirOs(id)
      router.refresh()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Falha ao imprimir.')
    } finally {
      setImprimindoId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          {ordens.length} {ordens.length === 1 ? 'ordem de servico' : 'ordens de servico'}
        </p>
        {!encerrado && (
          <BotaoAbrirOs
            servicoId={servico.id}
            descricaoServico={servico.descricao}
            tecnicos={tecnicos}
            veiculos={veiculos}
            equipamentos={equipamentos}
            contatos={contatos}
          />
        )}
      </div>

      {ordens.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-slate-500">Nenhuma OS aberta para este servico.</p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="pl-5 pr-2 py-2.5 text-left whitespace-nowrap">Codigo</th>
                <th className="px-2 py-2.5 text-left whitespace-nowrap">Data</th>
                <th className="px-3 py-2.5 text-left w-full">Atividade</th>
                <th className="pl-3 pr-2 py-2.5 text-left whitespace-nowrap">Status</th>
                <th className="pl-2 pr-5 py-2.5 text-left whitespace-nowrap">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {ordens.map((os) => (
                <tr
                  key={os.id}
                  onClick={() => setOsAberta(os.id)}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <td className="pl-5 pr-2 py-2.5 font-medium font-mono text-primary whitespace-nowrap">
                    {os.codigoExibicao}
                  </td>
                  <td className="px-2 py-2.5 text-slate-600 whitespace-nowrap">
                    {os.dataAgendada ? formatarDataIso(os.dataAgendada) : '—'}
                  </td>
                  <td className="px-3 py-2.5 text-slate-600 w-full">{os.descricaoAtividade}</td>
                  <td className="pl-3 pr-2 py-2.5 whitespace-nowrap">
                    <Badge variant={badgeStatusOs(os.status)} dot size="sm">
                      {os.statusRotulo}
                    </Badge>
                  </td>
                  <td className="pl-2 pr-5 py-2.5" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-start gap-1">
                      <button
                        type="button"
                        onClick={() => setOsAberta(os.id)}
                        title="Visualizar"
                        aria-label={`Visualizar OS ${os.codigoExibicao}`}
                        className="p-1.5 rounded text-slate-500 hover:text-primary hover:bg-slate-100 transition-colors"
                      >
                        <IconeOlho />
                      </button>
                      {os.status !== 'CONCLUIDA' && os.status !== 'CANCELADA' && (
                        <button
                          type="button"
                          onClick={() => imprimir(os.id)}
                          disabled={imprimindoId === os.id}
                          title="Imprimir"
                          aria-label={`Imprimir OS ${os.codigoExibicao}`}
                          className="p-1.5 rounded text-slate-500 hover:text-primary hover:bg-slate-100 transition-colors disabled:opacity-50"
                        >
                          <IconeImpressora />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {osAberta != null && (
        <ModalDetalheOs
          osId={osAberta}
          ehGestor={ehGestor}
          ehAdmin={ehAdmin}
          podeEditarOs={podeEditarOs}
          podeAnexarFaturamento={podeAnexarFaturamento}
          dadosEdicaoOs={{
            tecnicos,
            veiculos,
            equipamentos,
            contatos,
            descricaoServico: servico.descricao,
          }}
          onClose={fechar}
        />
      )}
    </div>
  )
}

function IconeOlho() {
  return (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function IconeImpressora() {
  return (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 9V3h12v6" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="7" rx="1" />
    </svg>
  )
}
