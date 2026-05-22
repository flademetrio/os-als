'use client'

import { useState } from 'react'
import type {
  AnexoServicoResposta,
  CategoriaCustoResposta,
  ContatoClienteResposta,
  EquipamentoResumoDto,
  LancamentoCustoResposta,
  OrdemServicoResumoDto,
  ResumoFinanceiroServico,
  ServicoResposta,
  TecnicoResumoDto,
  TipoServicoResposta,
  VeiculoResumoDto,
} from '@/app/lib/definicoes'
import { Card } from '@/components/ui/Card'
import { Tabs } from '@/components/ui/Tabs'
import { TabAnexos } from './tab-anexos'
import { TabCustos } from './tab-custos'
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
  contatos: ContatoClienteResposta[]
  custos: LancamentoCustoResposta[]
  resumo: ResumoFinanceiroServico
  categorias: CategoriaCustoResposta[]
  podeAlterarCustos: boolean
  anexos: AnexoServicoResposta[]
  ehGestor: boolean
}

export function DetalheServico({
  servico,
  tipos,
  ordens,
  tecnicos,
  veiculos,
  equipamentos,
  contatos,
  custos,
  resumo,
  categorias,
  podeAlterarCustos,
  anexos,
  ehGestor,
}: Props) {
  const [aba, setAba] = useState<AbaId>('dados')

  return (
    <Card padding="none">
      <div className="px-5 pt-3">
        <Tabs
          tabs={[
            { id: 'dados', label: 'Informacoes' },
            { id: 'os', label: 'Ordem De Servico', count: ordens.length },
            { id: 'custos', label: 'Custos', count: custos.length },
            { id: 'anexos', label: 'Anexos', count: anexos.length },
          ]}
          ativa={aba}
          onMudar={(id) => setAba(id as AbaId)}
        />
      </div>

      <div className="p-5">
        {aba === 'dados' && <TabDados servico={servico} tipos={tipos} />}
        {aba === 'os' && (
          <TabOs
            servico={servico}
            ordens={ordens}
            ehGestor={ehGestor}
            tecnicos={tecnicos}
            veiculos={veiculos}
            equipamentos={equipamentos}
            contatos={contatos}
          />
        )}
        {aba === 'custos' && (
          <TabCustos
            servicoId={servico.id}
            podeAlterar={podeAlterarCustos}
            resumo={resumo}
            lancamentos={custos}
            categorias={categorias}
            tecnicos={tecnicos}
          />
        )}
        {aba === 'anexos' && (
          <TabAnexos
            servicoId={servico.id}
            podeRemover={podeAlterarCustos}
            anexos={anexos}
          />
        )}
      </div>
    </Card>
  )
}
