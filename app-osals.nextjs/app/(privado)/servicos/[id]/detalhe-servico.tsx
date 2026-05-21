'use client'

import { useState } from 'react'
import type {
  AnexoServicoResposta,
  CategoriaCustoResposta,
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
  custos: LancamentoCustoResposta[]
  resumo: ResumoFinanceiroServico
  categorias: CategoriaCustoResposta[]
  podeAlterarCustos: boolean
  anexos: AnexoServicoResposta[]
}

export function DetalheServico({
  servico,
  tipos,
  ordens,
  tecnicos,
  veiculos,
  equipamentos,
  custos,
  resumo,
  categorias,
  podeAlterarCustos,
  anexos,
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
            servicoId={servico.id}
            servicoEncerrado={encerrado}
            ordens={ordens}
            tecnicos={tecnicos}
            veiculos={veiculos}
            equipamentos={equipamentos}
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
