'use client'

import { useState } from 'react'
import type {
  ClienteResposta,
  ContatoClienteResposta,
  UnidadeResposta,
} from '@/app/lib/definicoes'
import { Card } from '@/components/ui/Card'
import { Tabs } from '@/components/ui/Tabs'
import { TabDados } from './tab-dados'
import { TabUnidades } from './tab-unidades'
import { TabContatos } from './tab-contatos'

type Props = {
  cliente: ClienteResposta
  unidades: UnidadeResposta[]
  contatos: ContatoClienteResposta[]
  podeInativarItens: boolean
}

export function DetalheCliente({ cliente, unidades, contatos, podeInativarItens }: Props) {
  const [tab, setTab] = useState<'dados' | 'unidades' | 'contatos'>('dados')

  return (
    <Card padding="none">
      <div className="px-5 pt-3">
        <Tabs
          tabs={[
            { id: 'dados', label: 'Dados' },
            { id: 'unidades', label: 'Unidades', count: unidades.length },
            { id: 'contatos', label: 'Contatos', count: contatos.length },
          ]}
          ativa={tab}
          onMudar={(id) => setTab(id as 'dados' | 'unidades' | 'contatos')}
        />
      </div>

      <div className="p-5">
        {tab === 'dados' && <TabDados cliente={cliente} />}
        {tab === 'unidades' && (
          <TabUnidades
            clienteId={cliente.id}
            unidades={unidades}
            podeInativarItens={podeInativarItens}
          />
        )}
        {tab === 'contatos' && (
          <TabContatos
            clienteId={cliente.id}
            contatos={contatos}
            podeRemover={podeInativarItens}
          />
        )}
      </div>
    </Card>
  )
}
