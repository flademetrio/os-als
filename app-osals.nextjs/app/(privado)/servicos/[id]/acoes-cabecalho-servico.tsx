'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import {
  cancelarServico,
  excluirServico,
  finalizarServico,
  mudarStatusServico,
} from '@/app/actions/servico'
import type { ServicoResposta } from '@/app/lib/definicoes'
import { STATUS_INTERMEDIARIOS, badgeStatusServico } from '@/app/lib/esquemas/servico'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

/** Seta para baixo — indica que o badge abre um menu ao clicar. */
function ChevronBaixo() {
  return (
    <svg
      className="w-3.5 h-3.5 opacity-80"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 8l4 4 4-4" />
    </svg>
  )
}

/** Fecha o dropdown ao clicar fora do elemento referenciado. */
function useFecharFora(aberto: boolean, fechar: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!aberto) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) fechar()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [aberto, fechar])
  return ref
}

/**
 * Badge de status do servico. Clicar abre um menu para trocar entre os estados
 * intermediarios. Quando o servico esta encerrado, vira um badge estatico.
 */
export function StatusBadgeServico({ servico }: { servico: ServicoResposta }) {
  const encerrado = servico.status === 'CONCLUIDO' || servico.status === 'CANCELADO'
  const [aberto, setAberto] = useState(false)
  const [pendente, iniciar] = useTransition()
  const ref = useFecharFora(aberto, () => setAberto(false))

  if (encerrado) {
    return (
      <Badge variant={badgeStatusServico(servico.status)} dot size="sm">
        {servico.statusRotulo}
      </Badge>
    )
  }

  function selecionar(valor: string) {
    setAberto(false)
    if (valor !== servico.status) {
      iniciar(() => mudarStatusServico(servico.id, valor))
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setAberto((a) => !a)}
        disabled={pendente}
        aria-haspopup="listbox"
        aria-expanded={aberto}
        aria-label="Mudar status do servico"
        className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:opacity-60"
      >
        <Badge variant={badgeStatusServico(servico.status)} dot size="sm" className="cursor-pointer select-none">
          {servico.statusRotulo}
          <ChevronBaixo />
        </Badge>
      </button>

      {aberto && (
        <ul
          role="listbox"
          className="absolute left-0 z-20 mt-1 w-44 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
        >
          {STATUS_INTERMEDIARIOS.map((s) => (
            <li key={s.valor}>
              <button
                type="button"
                onClick={() => selecionar(s.valor)}
                className={[
                  'flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors hover:bg-slate-50',
                  s.valor === servico.status ? 'font-medium text-primary' : 'text-slate-700',
                ].join(' ')}
              >
                {s.rotulo}
                {s.valor === servico.status && (
                  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0l-3.5-3.5a1 1 0 111.4-1.4l2.8 2.8 6.8-6.8a1 1 0 011.4 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/**
 * Badge "Acoes" do servico. Clicar abre um menu com Finalizar / Cancelar /
 * Excluir (conforme estado e permissao); cada opcao abre um modal de
 * confirmacao. Nao renderiza nada quando nao ha acao disponivel.
 */
export function AcoesBadgeServico({
  servico,
  ehAdmin = false,
}: {
  servico: ServicoResposta
  ehAdmin?: boolean
}) {
  const encerrado = servico.status === 'CONCLUIDO' || servico.status === 'CANCELADO'
  const [aberto, setAberto] = useState(false)
  const [confirmar, setConfirmar] = useState<'finalizar' | 'cancelar' | 'excluir' | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [pendente, iniciar] = useTransition()
  const ref = useFecharFora(aberto, () => setAberto(false))

  const acoes: { valor: 'finalizar' | 'cancelar' | 'excluir'; rotulo: string; perigo: boolean }[] = [
    ...(encerrado
      ? []
      : [
          { valor: 'finalizar' as const, rotulo: 'Finalizar servico', perigo: false },
          { valor: 'cancelar' as const, rotulo: 'Cancelar servico', perigo: true },
        ]),
    ...(ehAdmin ? [{ valor: 'excluir' as const, rotulo: 'Excluir servico', perigo: true }] : []),
  ]

  if (acoes.length === 0) return null

  function executar(acao: () => Promise<void>) {
    iniciar(async () => {
      await acao()
      setConfirmar(null)
    })
  }

  return (
    <>
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setAberto((a) => !a)}
          disabled={pendente}
          aria-haspopup="menu"
          aria-expanded={aberto}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-2 py-0.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 disabled:opacity-60"
        >
          Acoes
          <ChevronBaixo />
        </button>

        {aberto && (
          <ul
            role="menu"
            className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
          >
            {acoes.map((a) => (
              <li key={a.valor}>
                <button
                  type="button"
                  onClick={() => {
                    setAberto(false)
                    setConfirmar(a.valor)
                  }}
                  className={[
                    'w-full px-3 py-2 text-left text-sm transition-colors hover:bg-slate-50',
                    a.perigo ? 'text-red-600' : 'text-slate-700',
                  ].join(' ')}
                >
                  {a.rotulo}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal
        open={confirmar === 'finalizar'}
        onClose={() => setConfirmar(null)}
        title="Finalizar servico"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmar(null)} disabled={pendente}>
              Voltar
            </Button>
            <Button
              variant="primary"
              loading={pendente}
              onClick={() => executar(() => finalizarServico(servico.id))}
            >
              Finalizar
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-700">
          Concluir o servico <strong>{servico.numeroFormatado}</strong>? Apos concluido
          ele nao pode ser reaberto nem editado.
        </p>
      </Modal>

      <Modal
        open={confirmar === 'cancelar'}
        onClose={() => setConfirmar(null)}
        title="Cancelar servico"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmar(null)} disabled={pendente}>
              Voltar
            </Button>
            <Button
              variant="danger"
              loading={pendente}
              onClick={() => executar(() => cancelarServico(servico.id))}
            >
              Cancelar servico
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-700">
          Cancelar o servico <strong>{servico.numeroFormatado}</strong>?
        </p>
      </Modal>

      <Modal
        open={confirmar === 'excluir'}
        onClose={() => {
          setConfirmar(null)
          setErro(null)
        }}
        title="Excluir servico"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmar(null)} disabled={pendente}>
              Voltar
            </Button>
            <Button
              variant="danger"
              loading={pendente}
              onClick={() =>
                iniciar(async () => {
                  const r = await excluirServico(servico.id)
                  if (r?.erro) setErro(r.erro)
                  // sucesso redireciona via Server Action (redirect)
                })
              }
            >
              Excluir permanentemente
            </Button>
          </>
        }
      >
        {erro && (
          <Alert variant="danger" className="mb-3">
            {erro}
          </Alert>
        )}
        <p className="text-sm text-slate-700">
          Excluir o servico <strong>{servico.numeroFormatado}</strong> e tudo o que
          depende dele (ordens de servico, anexos, lancamentos de custo)?{' '}
          <strong>Esta acao nao pode ser desfeita.</strong>
        </p>
      </Modal>
    </>
  )
}
