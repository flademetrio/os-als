'use client'

import Link from 'next/link'
import { useState } from 'react'
import type {
  AnexoServicoResposta,
  CategoriaCustoResposta,
  CobrancaResposta,
  ContatoClienteResposta,
  EquipamentoResumoDto,
  FaturamentoResposta,
  LancamentoCustoResposta,
  OrdemServicoResumoDto,
  ResumoFinanceiroServico,
  ServicoResposta,
  TecnicoResumoDto,
  TipoServicoResposta,
  VeiculoResumoDto,
} from '@/app/lib/definicoes'
import { badgeTipoServico } from '@/app/lib/esquemas/servico'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { AcoesBadgeServico, StatusBadgeServico } from './acoes-cabecalho-servico'
import { TabAnexos } from './tab-anexos'
import { TabCobranca } from './tab-cobranca'
import { TabCustos } from './tab-custos'
import { TabDados } from './tab-dados'
import { TabFaturamento } from './tab-faturamento'
import { TabOs } from './tab-os'

type AbaId = 'dados' | 'os' | 'custos' | 'cobranca' | 'faturamento' | 'anexos'

type AbaConfig = { id: AbaId; label: string; icon: React.ReactNode; count?: number }

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
  podeVerCustos: boolean
  podeAlterarCustos: boolean
  anexos: AnexoServicoResposta[]
  /** Cobranca/Faturamento — presentes quando o usuario tem FATURAMENTO_VER. */
  cobranca?: CobrancaResposta
  faturamento?: FaturamentoResposta
  podeVerFaturamento?: boolean
  podeAlterarFaturamento?: boolean
  ehGestor: boolean
  ehAdmin?: boolean
  podeEditarOs?: boolean
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
  podeVerCustos,
  podeAlterarCustos,
  anexos,
  cobranca,
  faturamento,
  podeVerFaturamento = false,
  podeAlterarFaturamento = false,
  ehGestor,
  ehAdmin = false,
  podeEditarOs = false,
}: Props) {
  const [aba, setAba] = useState<AbaId>('dados')

  const mostrarFaturamento = podeVerFaturamento && cobranca != null && faturamento != null

  const abas: AbaConfig[] = [
    { id: 'dados', label: 'Geral', icon: <IconeGeral /> },
    { id: 'os', label: 'Ordem De Servico', icon: <IconeOs />, count: ordens.length },
    ...(podeVerCustos
      ? [{ id: 'custos' as const, label: 'Custos', icon: <IconeCusto />, count: custos.length }]
      : []),
    ...(mostrarFaturamento
      ? [
          { id: 'cobranca' as const, label: 'Cobranca', icon: <IconeCobranca /> },
          {
            id: 'faturamento' as const,
            label: 'Faturamento',
            icon: <IconeFaturamento />,
            count: faturamento!.notas.length,
          },
        ]
      : []),
    { id: 'anexos', label: 'Anexos', icon: <IconeAnexo />, count: anexos.length },
  ]

  return (
    <Card padding="none">
      {/* Cabecalho do servico em duas linhas: identificacao e badges. As abas
          ficam logo abaixo, no mesmo card, deixando claro que sao partes do servico. */}
      <div className="px-5 pt-4 pb-4">
        {/* Linha 1 — cliente (esquerda) e numero do servico (direita) */}
        <div className="flex items-baseline justify-between gap-3">
          <Link
            href={`/clientes/${servico.clienteId}`}
            className="text-lg font-semibold text-primary hover:underline truncate"
          >
            {servico.clienteNome}
          </Link>
          <span className="text-sm font-mono text-slate-400 shrink-0">
            Servico {servico.numeroFormatado}
          </span>
        </div>

        {/* Linha 2 — status (clicavel), tipo, empresa e acoes (clicavel) */}
        <div className="flex items-center gap-2 mt-2.5 flex-wrap">
          <StatusBadgeServico servico={servico} />
          <Badge variant={badgeTipoServico(servico.tipoServicoNome)} size="sm">
            {servico.tipoServicoNome}
          </Badge>
          <Badge variant="default" size="sm">
            {servico.empresaRotulo}
          </Badge>
          <AcoesBadgeServico servico={servico} ehAdmin={ehAdmin} />
        </div>

        {servico.finalizadoEm && (
          <p className="text-xs text-slate-400 mt-2.5">
            Encerrado em {formatarDataHora(servico.finalizadoEm)}
            {servico.finalizadoPorNome ? ` por ${servico.finalizadoPorNome}` : ''}
          </p>
        )}
      </div>

      {/* Abas estilo "sistema" — a aba ativa se conecta ao painel de conteudo. */}
      <div className="px-5 bg-slate-50 border-t border-slate-200">
        <div className="flex items-end gap-1 overflow-x-auto pt-2" role="tablist">
          {abas.map((a) => {
            const ativa = a.id === aba
            return (
              <button
                key={a.id}
                type="button"
                role="tab"
                aria-selected={ativa}
                onClick={() => setAba(a.id)}
                className={[
                  'flex items-center gap-1.5 whitespace-nowrap rounded-t-lg px-3.5 py-2.5 text-sm transition-colors',
                  ativa
                    ? '-mb-px border border-b-white border-slate-200 bg-white font-medium text-primary'
                    : 'text-slate-500 hover:text-slate-700',
                ].join(' ')}
              >
                {a.icon}
                {a.label}
                {a.count !== undefined && (
                  <span className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-1.5 text-xs text-slate-600">
                    {a.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="border-t border-slate-200 p-5">
        {aba === 'dados' && <TabDados servico={servico} tipos={tipos} />}
        {aba === 'os' && (
          <TabOs
            servico={servico}
            ordens={ordens}
            ehGestor={ehGestor}
            ehAdmin={ehAdmin}
            podeEditarOs={podeEditarOs}
            podeAnexarFaturamento={podeAlterarFaturamento}
            tecnicos={tecnicos}
            veiculos={veiculos}
            equipamentos={equipamentos}
            contatos={contatos}
          />
        )}
        {aba === 'custos' && podeVerCustos && (
          <TabCustos
            servicoId={servico.id}
            podeAlterar={podeAlterarCustos}
            resumo={resumo}
            lancamentos={custos}
            categorias={categorias}
            tecnicos={tecnicos}
          />
        )}
        {aba === 'cobranca' && mostrarFaturamento && (
          <TabCobranca
            servicoId={servico.id}
            cobranca={cobranca!}
            podeAlterar={podeAlterarFaturamento}
          />
        )}
        {aba === 'faturamento' && mostrarFaturamento && (
          <TabFaturamento
            servicoId={servico.id}
            faturamento={faturamento!}
            podeAlterar={podeAlterarFaturamento}
            ehAdmin={ehAdmin}
          />
        )}
        {aba === 'anexos' && (
          <TabAnexos
            servicoId={servico.id}
            podeRemover={podeAlterarCustos || podeAlterarFaturamento}
            anexos={anexos}
          />
        )}
      </div>
    </Card>
  )
}

function formatarDataHora(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

const svgIcone = {
  className: 'w-4 h-4 shrink-0',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

function IconeGeral() {
  return (
    <svg {...svgIcone}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 9h8M8 13h8M8 17h5" />
    </svg>
  )
}

function IconeOs() {
  return (
    <svg {...svgIcone}>
      <rect x="6" y="3" width="12" height="18" rx="2" />
      <path d="M9 3.5h6v2h-6zM9 11h6M9 15h4" />
    </svg>
  )
}

function IconeCusto() {
  return (
    <svg {...svgIcone}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v8M9.5 9.5h3.5a1.5 1.5 0 010 3h-2a1.5 1.5 0 000 3H15" />
    </svg>
  )
}

function IconeAnexo() {
  return (
    <svg {...svgIcone}>
      <path d="M20 11l-8 8a4 4 0 01-6-6l8-8a2.5 2.5 0 014 4l-8 8a1 1 0 01-1.5-1.5l7-7" />
    </svg>
  )
}

function IconeCobranca() {
  return (
    <svg {...svgIcone}>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  )
}

function IconeFaturamento() {
  return (
    <svg {...svgIcone}>
      <path d="M7 3h7l4 4v14a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z" />
      <path d="M13 3v5h5M9 13h6M9 17h6" />
    </svg>
  )
}
