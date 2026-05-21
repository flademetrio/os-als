'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { AnexoOsResposta, OrdemServicoResposta } from '@/app/lib/definicoes'
import { badgeStatusOs } from '@/app/lib/esquemas/ordem-servico'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { AcoesOs } from '../../ordens-servico/[id]/acoes-os'
import { AnexoOsCard } from '../../ordens-servico/[id]/anexo-os-card'

type RespostaProxy = { os: OrdemServicoResposta; anexo: AnexoOsResposta | null }

type Props = {
  osId: number
  ehGestor: boolean
  onClose: () => void
}

/** Modal (drawer) com o detalhe completo de uma OS, aberto a partir do Servico. */
export function ModalDetalheOs({ osId, ehGestor, onClose }: Props) {
  const [dados, setDados] = useState<RespostaProxy | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    let ativo = true
    fetch(`/api-proxy/ordens-servico/${osId}`)
      .then(async (r) => {
        if (!r.ok) {
          const corpo = await r.json().catch(() => null)
          throw new Error(corpo?.erro ?? 'Falha ao carregar a OS.')
        }
        return r.json() as Promise<RespostaProxy>
      })
      .then((d) => ativo && setDados(d))
      .catch((e) => ativo && setErro(e.message))
    return () => {
      ativo = false
    }
  }, [osId])

  const os = dados?.os
  const encerrada = os?.status === 'CONCLUIDA' || os?.status === 'CANCELADA'

  return (
    <Modal
      open
      onClose={onClose}
      title={os ? `OS ${os.codigoExibicao}` : 'Ordem de servico'}
      size="lg"
    >
      {erro && <Alert variant="danger">{erro}</Alert>}

      {!dados && !erro && (
        <p className="text-sm text-slate-500 py-6 text-center">Carregando OS...</p>
      )}

      {os && (
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={badgeStatusOs(os.status)} dot>
                  {os.statusRotulo}
                </Badge>
                <Link
                  href={`/ordens-servico/${os.id}`}
                  className="text-xs text-primary hover:underline"
                >
                  abrir em pagina inteira →
                </Link>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                {os.clienteNome} · {os.tipoServicoNome} · Servico {os.servicoNumeroFormatado}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Aberta em {dataHora(os.dataAbertura)}
                {os.dataImpressao ? ` · Impressa em ${dataHora(os.dataImpressao)}` : ''}
              </p>
            </div>
            <AcoesOs os={os} />
          </div>

          <Secao titulo="Atividade prevista">
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{os.descricaoAtividade}</p>
          </Secao>

          <Secao titulo="Tecnicos">
            <Lista
              itens={os.tecnicos.map((t) =>
                t.especialidade ? `${t.nome} — ${t.especialidade}` : t.nome,
              )}
            />
          </Secao>

          <Secao titulo="Veiculos">
            <Lista
              itens={os.veiculos.map((v) =>
                [v.placa, v.marca, v.modelo].filter(Boolean).join(' '),
              )}
            />
          </Secao>

          <Secao titulo="Equipamentos atendidos">
            <Lista
              itens={os.equipamentos.map((e) =>
                [
                  [e.marca, e.modelo].filter(Boolean).join(' ') || `Equipamento #${e.id}`,
                  e.localizacaoInterna,
                ]
                  .filter(Boolean)
                  .join(' — '),
              )}
            />
          </Secao>

          {os.status === 'CONCLUIDA' && (
            <Secao titulo="Execucao">
              <div className="text-sm text-slate-700 space-y-1">
                <p>
                  <span className="text-slate-500">Periodo: </span>
                  {dataHora(os.horaInicioExecucao)} — {dataHora(os.horaFimExecucao)}
                </p>
                <p className="whitespace-pre-wrap">
                  <span className="text-slate-500">O que foi feito: </span>
                  {os.oQueFoiFeito ?? '-'}
                </p>
                {os.observacoes && (
                  <p className="whitespace-pre-wrap">
                    <span className="text-slate-500">Observacoes: </span>
                    {os.observacoes}
                  </p>
                )}
                {os.impedimentos && (
                  <p className="whitespace-pre-wrap">
                    <span className="text-slate-500">Impedimentos: </span>
                    {os.impedimentos}
                  </p>
                )}
              </div>
            </Secao>
          )}

          <AnexoOsCard
            osId={os.id}
            anexo={dados.anexo}
            podeAlterar={!encerrada || ehGestor}
          />
        </div>
      )}
    </Modal>
  )
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
        {titulo}
      </p>
      {children}
    </div>
  )
}

function Lista({ itens }: { itens: string[] }) {
  if (itens.length === 0) {
    return <p className="text-sm text-slate-400">-</p>
  }
  return (
    <ul className="text-sm text-slate-700 list-disc list-inside">
      {itens.map((t, i) => (
        <li key={i}>{t}</li>
      ))}
    </ul>
  )
}

function dataHora(iso: string | null): string {
  if (!iso) return '-'
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}
