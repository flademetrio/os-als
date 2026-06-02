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
import { badgeStatusOs } from '@/app/lib/esquemas/ordem-servico'
import { Badge } from '@/components/ui/Badge'
import { BotaoAbrirOs } from './botao-abrir-os'
import { ModalDetalheOs } from './modal-detalhe-os'

type Props = {
  servico: ServicoResposta
  ordens: OrdemServicoResumoDto[]
  ehGestor: boolean
  ehAdmin?: boolean
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
  tecnicos,
  veiculos,
  equipamentos,
  contatos,
}: Props) {
  const router = useRouter()
  const [osAberta, setOsAberta] = useState<number | null>(null)

  const encerrado = servico.status === 'CONCLUIDO' || servico.status === 'CANCELADO'

  function fechar() {
    setOsAberta(null)
    // a OS pode ter mudado (impressa, concluida, cancelada) — atualiza a lista
    router.refresh()
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
              <tr className="border-y border-slate-200 bg-slate-50">
                <th className="px-5 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Codigo</th>
                <th className="px-5 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Atividade</th>
                <th className="px-5 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {ordens.map((os) => (
                <tr
                  key={os.id}
                  onClick={() => setOsAberta(os.id)}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <td className="px-5 py-2.5 font-medium font-mono text-primary">
                    {os.codigoExibicao}
                  </td>
                  <td className="px-5 py-2.5 text-slate-600">
                    <span className="block truncate max-w-md">{os.descricaoAtividade}</span>
                  </td>
                  <td className="px-5 py-2.5">
                    <Badge variant={badgeStatusOs(os.status)} dot size="sm">
                      {os.statusRotulo}
                    </Badge>
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
          onClose={fechar}
        />
      )}
    </div>
  )
}
