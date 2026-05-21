'use client'

import { useState } from 'react'
import type {
  EquipamentoResumoDto,
  OrdemServicoResumoDto,
  ServicoResposta,
  TecnicoResumoDto,
  TipoServicoResposta,
  VeiculoResumoDto,
} from '@/app/lib/definicoes'
import { Card } from '@/components/ui/Card'
import { Tabs } from '@/components/ui/Tabs'
import { TabDados } from './tab-dados'
import { TabOs } from './tab-os'

type AbaId = 'dados' | 'os' | 'custos' | 'anexos'

type Props = {
  servico: ServicoResposta
  tipos: TipoServicoResposta[]
  ordens: OrdemServicoResumoDto[]
  tecnicos: TecnicoResumoDto[]
  veiculos: VeiculoResumoDto[]
  equipamentos: EquipamentoResumoDto[]
}

export function DetalheServico({
  servico,
  tipos,
  ordens,
  tecnicos,
  veiculos,
  equipamentos,
}: Props) {
  const [aba, setAba] = useState<AbaId>('dados')
  const encerrado = servico.status === 'CONCLUIDO' || servico.status === 'CANCELADO'

  return (
    <Card padding="none">
      <div className="px-5 pt-3">
        <Tabs
          tabs={[
            { id: 'dados', label: 'Dados' },
            { id: 'os', label: 'Ordens de servico', count: ordens.length },
            { id: 'custos', label: 'Custos' },
            { id: 'anexos', label: 'Anexos' },
          ]}
          ativa={aba}
          onMudar={(id) => setAba(id as AbaId)}
        />
      </div>

      <div className="p-5">
        {aba === 'dados' && <TabDados servico={servico} tipos={tipos} />}
        {aba === 'os' && (
          <TabOs
            servicoId={servico.id}
            servicoEncerrado={encerrado}
            ordens={ordens}
            tecnicos={tecnicos}
            veiculos={veiculos}
            equipamentos={equipamentos}
          />
        )}
        {aba === 'custos' && <EmBreve recurso="Custos" />}
        {aba === 'anexos' && <EmBreve recurso="Anexos" />}
      </div>
    </Card>
  )
}

function EmBreve({ recurso }: { recurso: string }) {
  return (
    <div className="py-10 text-center">
      <p className="text-slate-500">{recurso} estarao disponiveis em breve.</p>
    </div>
  )
}
