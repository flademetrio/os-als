'use client'

import { useState } from 'react'
import type { ServicoResposta, TipoServicoResposta } from '@/app/lib/definicoes'
import { Card } from '@/components/ui/Card'
import { Tabs } from '@/components/ui/Tabs'
import { TabDados } from './tab-dados'

type AbaId = 'dados' | 'os' | 'custos' | 'anexos'

type Props = {
  servico: ServicoResposta
  tipos: TipoServicoResposta[]
}

export function DetalheServico({ servico, tipos }: Props) {
  const [aba, setAba] = useState<AbaId>('dados')

  return (
    <Card padding="none">
      <div className="px-5 pt-3">
        <Tabs
          tabs={[
            { id: 'dados', label: 'Dados' },
            { id: 'os', label: 'Ordens de servico' },
            { id: 'custos', label: 'Custos' },
            { id: 'anexos', label: 'Anexos' },
          ]}
          ativa={aba}
          onMudar={(id) => setAba(id as AbaId)}
        />
      </div>

      <div className="p-5">
        {aba === 'dados' && <TabDados servico={servico} tipos={tipos} />}
        {aba === 'os' && <EmBreve recurso="Ordens de servico" />}
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
