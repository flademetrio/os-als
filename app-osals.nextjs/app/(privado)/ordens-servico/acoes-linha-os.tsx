'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { StatusOrdemServico } from '@/app/lib/definicoes'

type Props = {
  id: number
  codigo: string
  status: StatusOrdemServico
}

/** Acoes em icone da linha da lista de OS: visualizar e imprimir direto (sem abrir). */
export function AcoesLinhaOs({ id, codigo, status }: Props) {
  const router = useRouter()
  const [imprimindo, setImprimindo] = useState(false)

  const encerrada = status === 'CONCLUIDA' || status === 'CANCELADA'

  async function imprimir() {
    setImprimindo(true)
    try {
      const resp = await fetch(`/api-proxy/ordens-servico/${id}/imprimir`, { method: 'POST' })
      if (!resp.ok) {
        const corpo = await resp.json().catch(() => null)
        alert(corpo?.mensagem ?? 'Falha ao gerar o PDF para impressao.')
        return
      }
      const blob = await resp.blob()
      const url = URL.createObjectURL(blob)

      // Carrega o PDF num iframe escondido e abre a caixa de impressao direto
      // (sem aba nova). Se o navegador bloquear, cai pra abrir em aba nova.
      const iframe = document.createElement('iframe')
      iframe.style.position = 'fixed'
      iframe.style.width = '0'
      iframe.style.height = '0'
      iframe.style.border = '0'
      iframe.style.right = '0'
      iframe.style.bottom = '0'
      iframe.src = url
      iframe.onload = () => {
        try {
          iframe.contentWindow?.focus()
          iframe.contentWindow?.print()
        } catch {
          window.open(url, '_blank', 'noopener,noreferrer')
        }
      }
      document.body.appendChild(iframe)
      setTimeout(() => {
        URL.revokeObjectURL(url)
        iframe.remove()
      }, 120_000)
      router.refresh()
    } catch {
      alert('Falha de conexao ao gerar o PDF.')
    } finally {
      setImprimindo(false)
    }
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/ordens-servico/${id}`}
        title="Visualizar"
        aria-label={`Visualizar OS ${codigo}`}
        className="p-1.5 rounded text-slate-500 hover:text-primary hover:bg-slate-100 transition-colors"
      >
        <IconeOlho />
      </Link>
      {!encerrada && (
        <button
          type="button"
          onClick={imprimir}
          disabled={imprimindo}
          title="Imprimir"
          aria-label={`Imprimir OS ${codigo}`}
          className="p-1.5 rounded text-slate-500 hover:text-primary hover:bg-slate-100 transition-colors disabled:opacity-50"
        >
          <IconeImpressora />
        </button>
      )}
    </div>
  )
}

function IconeOlho() {
  return (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function IconeImpressora() {
  return (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 9V3h12v6" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="7" rx="1" />
    </svg>
  )
}
