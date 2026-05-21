'use client'

import Link from 'next/link'
import { useState } from 'react'
import type {
  EquipamentoResumoDto,
  OrdemServicoResumoDto,
  TecnicoResumoDto,
  VeiculoResumoDto,
} from '@/app/lib/definicoes'
import { badgeStatusOs } from '@/app/lib/esquemas/ordem-servico'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ModalAbrirOs } from './modal-abrir-os'

type Props = {
  servicoId: number
  servicoEncerrado: boolean
  ordens: OrdemServicoResumoDto[]
  tecnicos: TecnicoResumoDto[]
  veiculos: VeiculoResumoDto[]
  equipamentos: EquipamentoResumoDto[]
}

export function TabOs({
  servicoId,
  servicoEncerrado,
  ordens,
  tecnicos,
  veiculos,
  equipamentos,
}: Props) {
  const [modalAberto, setModalAberto] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-slate-500">
          {ordens.length} {ordens.length === 1 ? 'ordem de servico' : 'ordens de servico'}
        </p>
        {!servicoEncerrado && (
          <Button variant="primary" size="sm" onClick={() => setModalAberto(true)}>
            + Abrir OS
          </Button>
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
                <tr key={os.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-2.5">
                    <Link
                      href={`/ordens-servico/${os.id}`}
                      className="text-primary hover:underline font-medium font-mono"
                    >
                      {os.codigoExibicao}
                    </Link>
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

      {modalAberto && (
        <ModalAbrirOs
          servicoId={servicoId}
          tecnicos={tecnicos}
          veiculos={veiculos}
          equipamentos={equipamentos}
          onClose={() => setModalAberto(false)}
        />
      )}
    </div>
  )
}
