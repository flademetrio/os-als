'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import type { AnexoOsResposta, OrdemServicoResposta } from '@/app/lib/definicoes'
import { badgeStatusOs } from '@/app/lib/esquemas/ordem-servico'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { AcoesOs, type DadosEdicaoOs } from '../../ordens-servico/[id]/acoes-os'
import { AnexoOsCard } from '../../ordens-servico/[id]/anexo-os-card'

type RespostaProxy = { os: OrdemServicoResposta; anexo: AnexoOsResposta | null }

type Props = {
  osId: number
  ehGestor: boolean
  ehAdmin?: boolean
  /** Permissao ORDEM_SERVICO_EDITAR — habilita o botao Editar. */
  podeEditarOs?: boolean
  /** Perfil de faturamento pode anexar scan na OS mesmo sem gerenciar servico. */
  podeAnexarFaturamento?: boolean
  /** Listas-candidatas para o modal de edicao da OS. */
  dadosEdicaoOs?: DadosEdicaoOs
  onClose: () => void
}

/** Modal (drawer) com o detalhe completo de uma OS, aberto a partir do Servico. */
export function ModalDetalheOs({
  osId,
  ehGestor,
  ehAdmin = false,
  podeEditarOs = false,
  podeAnexarFaturamento = false,
  dadosEdicaoOs,
  onClose,
}: Props) {
  const [dados, setDados] = useState<RespostaProxy | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  const carregar = useCallback(() => {
    fetch(`/api-proxy/ordens-servico/${osId}`)
      .then(async (r) => {
        if (!r.ok) {
          const corpo = await r.json().catch(() => null)
          throw new Error(corpo?.erro ?? 'Falha ao carregar a OS.')
        }
        return r.json() as Promise<RespostaProxy>
      })
      .then((d) => setDados(d))
      .catch((e) => setErro(e.message))
  }, [osId])

  useEffect(() => {
    carregar()
  }, [carregar])

  const os = dados?.os
  const encerrada = os?.status === 'CONCLUIDA' || os?.status === 'CANCELADA'

  return (
    <Modal
      open
      onClose={onClose}
      title={os ? `OS ${os.codigoExibicao}` : 'Ordem de servico'}
      size="grande"
    >
      {erro && <Alert variant="danger">{erro}</Alert>}

      {!dados && !erro && (
        <p className="text-sm text-slate-500 py-6 text-center">Carregando OS...</p>
      )}

      {os && (
        <div className="space-y-5">
          {/* Cabecalho — status, identificacao e acoes */}
          <div className="flex items-start justify-between gap-4 flex-wrap rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="min-w-0">
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
              <p className="text-sm font-medium text-slate-800 mt-2">{os.clienteNome}</p>
              <p className="text-xs text-slate-500">
                {os.tipoServicoNome} · Servico {os.servicoNumeroFormatado}
              </p>
              {os.dataAgendada && (
                <p className="text-xs font-medium text-slate-600 mt-1">
                  Agendada para {dataSimples(os.dataAgendada)}
                </p>
              )}
              <p className="text-xs text-slate-400 mt-1">
                Aberta em {dataHora(os.dataAbertura)}
                {os.dataImpressao ? ` · Impressa em ${dataHora(os.dataImpressao)}` : ''}
              </p>
            </div>
            <AcoesOs
              os={os}
              ehAdmin={ehAdmin}
              podeEditar={podeEditarOs}
              dadosEdicao={dadosEdicaoOs}
              onEditado={carregar}
              onConcluido={onClose}
            />
          </div>

          {/* Dados — grade de 2 colunas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Bloco titulo="Atividade prevista" largo>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">
                {os.descricaoAtividade}
              </p>
            </Bloco>

            <Bloco titulo={`Tecnicos (${os.tecnicos.length})`}>
              <Lista itens={os.tecnicos.map((t) => primeiroNome(t.nome))} />
            </Bloco>

            <Bloco titulo={`Veiculos (${os.veiculos.length})`}>
              <Lista
                itens={os.veiculos.map((v) =>
                  [v.placa, v.marca, v.modelo].filter(Boolean).join(' '),
                )}
              />
            </Bloco>

            <Bloco titulo={`Equipamentos atendidos (${os.equipamentos.length})`} largo>
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
            </Bloco>

            <Bloco titulo={`Contatos do cliente (${os.contatos.length})`} largo>
              <Lista
                itens={os.contatos.map((c) =>
                  [
                    [c.nome, c.funcao].filter(Boolean).join(' — '),
                    c.telefone,
                  ]
                    .filter(Boolean)
                    .join(' · '),
                )}
              />
            </Bloco>

            {os.status === 'CONCLUIDA' && (
              <Bloco titulo="Execucao" largo>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-slate-700">
                  <Linha rotulo="Hora inicio" valor={dataHora(os.horaInicioExecucao)} />
                  <Linha rotulo="Hora fim" valor={dataHora(os.horaFimExecucao)} />
                  <div className="sm:col-span-2">
                    <Linha rotulo="O que foi feito" valor={os.oQueFoiFeito ?? '-'} />
                  </div>
                  {os.observacoes && (
                    <div className="sm:col-span-2">
                      <Linha rotulo="Observacoes" valor={os.observacoes} />
                    </div>
                  )}
                  {os.impedimentos && (
                    <div className="sm:col-span-2">
                      <Linha rotulo="Impedimentos" valor={os.impedimentos} />
                    </div>
                  )}
                </div>
              </Bloco>
            )}
          </div>

          <AnexoOsCard
            osId={os.id}
            anexo={dados.anexo}
            podeAlterar={!encerrada || ehGestor || podeAnexarFaturamento}
          />
        </div>
      )}
    </Modal>
  )
}

function Bloco({
  titulo,
  largo,
  children,
}: {
  titulo: string
  largo?: boolean
  children: React.ReactNode
}) {
  return (
    <div
      className={[
        'rounded-xl border border-slate-200 p-3',
        largo ? 'sm:col-span-2' : '',
      ].join(' ')}
    >
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
        {titulo}
      </p>
      {children}
    </div>
  )
}

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <p className="whitespace-pre-wrap">
      <span className="text-slate-500">{rotulo}: </span>
      {valor}
    </p>
  )
}

function Lista({ itens }: { itens: string[] }) {
  if (itens.length === 0) {
    return <p className="text-sm text-slate-400">Nenhum.</p>
  }
  return (
    <ul className="text-sm text-slate-700 space-y-0.5">
      {itens.map((t, i) => (
        <li key={i} className="flex gap-1.5">
          <span className="text-slate-300">•</span>
          <span>{t}</span>
        </li>
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

/** Converte uma data ISO (AAAA-MM-DD) para DD/MM/AAAA. */
function dataSimples(iso: string): string {
  const [ano, mes, dia] = iso.split('-')
  return dia && mes && ano ? `${dia}/${mes}/${ano}` : iso
}

/** Primeiro nome do tecnico (descarta sobrenomes). */
function primeiroNome(nome: string): string {
  return nome.trim().split(/\s+/)[0]
}
