'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { ClienteResposta, ClienteResumoDto } from '@/app/lib/definicoes'
import { ModalNovoClienteEmbutido } from './modal-novo-cliente-embutido'

type Props = {
  /** Lista inicial de clientes disponiveis para selecao. */
  clientesIniciais: ClienteResumoDto[]
  /** Id do cliente selecionado. */
  value: number | null
  /** Notificado quando o usuario seleciona um cliente. */
  onChange: (id: number) => void
  /** Mensagem de erro abaixo do campo. */
  error?: string
  /** Texto do rotulo (default "Cliente"). */
  label?: string
  /** Marca como obrigatorio (default true) — afeta o asterisco visual. */
  required?: boolean
  /**
   * Esconde a acao "+ Novo cliente" do rodape do dropdown. Default true.
   */
  permitirCriar?: boolean
}

/**
 * Select de cliente com busca embutida (por nome, nome fantasia ou
 * documento) e cadastro rapido via drawer. O valor selecionado e
 * submetido pelo formulario num input oculto chamado "clienteId".
 *
 * Padrao do projeto para qualquer formulario que precise escolher um
 * cliente — usa-se em vez de um Select nativo.
 */
export function ComboboxCliente({
  clientesIniciais,
  value,
  onChange,
  error,
  label = 'Cliente',
  required = true,
  permitirCriar = true,
}: Props) {
  const [clientes, setClientes] = useState(clientesIniciais)
  const [aberto, setAberto] = useState(false)
  const [busca, setBusca] = useState('')
  const [modalNovo, setModalNovo] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Re-sincroniza se o pai trocar a lista (recarregamento, refresh etc.).
  useEffect(() => {
    setClientes(clientesIniciais)
  }, [clientesIniciais])

  const selecionado = clientes.find((c) => c.id === value) ?? null

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    if (!termo) return clientes
    const digitos = termo.replace(/\D/g, '')
    return clientes.filter(
      (c) =>
        c.nome.toLowerCase().includes(termo) ||
        (c.nomeFantasia ?? '').toLowerCase().includes(termo) ||
        (digitos !== '' && c.documento.replace(/\D/g, '').includes(digitos)),
    )
  }, [clientes, busca])

  // Fechar dropdown ao clicar fora.
  useEffect(() => {
    if (!aberto) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [aberto])

  function selecionar(id: number) {
    onChange(id)
    setAberto(false)
    setBusca('')
  }

  /** Cliente recem-criado entra no topo da lista e ja fica selecionado. */
  function clienteCriado(c: ClienteResposta) {
    const novo: ClienteResumoDto = {
      id: c.id,
      tipoPessoa: c.tipoPessoa,
      documento: c.documento,
      nome: c.nome,
      nomeFantasia: c.nomeFantasia,
      ativo: true,
    }
    setClientes((lista) => [novo, ...lista.filter((x) => x.id !== c.id)])
    onChange(c.id)
    setModalNovo(false)
  }

  return (
    <>
      <div className="w-full">
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>

        <div className="relative" ref={ref}>
          <button
            type="button"
            onClick={() => setAberto((a) => !a)}
            className={[
              'flex w-full items-center justify-between rounded-lg border bg-white text-sm transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
              'pl-3 pr-2 py-2 text-left',
              error ? 'border-red-400 focus:ring-red-400' : 'border-slate-300',
            ].join(' ')}
          >
            <span className={selecionado ? 'text-slate-900 truncate' : 'text-slate-400'}>
              {selecionado ? selecionado.nome : '— Selecione'}
            </span>
            <svg
              className="w-5 h-5 text-slate-500 shrink-0"
              fill="none"
              viewBox="0 0 20 20"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 8l4 4 4-4" />
            </svg>
          </button>

          {aberto && (
            <div className="absolute z-20 mt-1 w-full bg-white rounded-lg border border-slate-200 shadow-lg overflow-hidden">
              <div className="p-2 border-b border-slate-100">
                <input
                  autoFocus
                  type="search"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar por nome ou documento..."
                  className="block w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <ul className="max-h-56 overflow-y-auto py-1">
                {filtrados.length === 0 ? (
                  <li className="px-3 py-2 text-sm text-slate-400">
                    Nenhum cliente encontrado.
                  </li>
                ) : (
                  filtrados.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => selecionar(c.id)}
                        className={[
                          'w-full text-left px-3 py-2 transition-colors hover:bg-slate-50',
                          c.id === value ? 'bg-slate-50' : '',
                        ].join(' ')}
                      >
                        <span
                          className={[
                            'block text-sm leading-tight',
                            c.id === value
                              ? 'font-medium text-primary'
                              : 'text-slate-700',
                          ].join(' ')}
                        >
                          {c.nome}
                        </span>
                        {c.nomeFantasia && c.nomeFantasia !== c.nome && (
                          <span className="block text-xs text-slate-400 leading-tight truncate">
                            {c.nomeFantasia}
                          </span>
                        )}
                      </button>
                    </li>
                  ))
                )}
              </ul>

              {permitirCriar && (
                <div className="border-t border-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAberto(false)
                      setModalNovo(true)
                    }}
                    className="w-full text-left px-3 py-2 text-sm font-medium text-primary rounded-md hover:bg-slate-50 transition-colors"
                  >
                    + Novo cliente
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <input type="hidden" name="clienteId" value={value ?? ''} />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>

      {modalNovo && (
        <ModalNovoClienteEmbutido
          onCriado={clienteCriado}
          onClose={() => setModalNovo(false)}
        />
      )}
    </>
  )
}
