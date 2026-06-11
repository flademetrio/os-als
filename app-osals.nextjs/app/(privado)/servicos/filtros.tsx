'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { EMPRESA_SERVICO_LABEL } from '@/app/lib/esquemas/servico'
import { Input } from '@/components/ui/Input'
import { SearchBar } from '@/components/ui/SearchBar'
import { Select } from '@/components/ui/Select'

/** Opcoes do filtro de situacao. "andamento" cobre abertos + em execucao. */
export const OPCOES_SITUACAO: { valor: string; rotulo: string }[] = [
  { valor: 'andamento', rotulo: 'Em andamento' },
  { valor: 'EM_ABERTO', rotulo: 'Em aberto' },
  { valor: 'EM_EXECUCAO', rotulo: 'Em execucao' },
  { valor: 'AGUARDANDO', rotulo: 'Aguardando' },
  { valor: 'CONCLUIDO', rotulo: 'Concluido' },
  { valor: 'CANCELADO', rotulo: 'Cancelado' },
  { valor: 'todos', rotulo: 'Todos' },
]

type Props = {
  busca: string
  situacao: string
  empresa: string
  inicio: string
  fim: string
}

/** Barra de filtros da listagem de servicos — compacta, em uma linha. */
export function FiltrosServicos({ busca: buscaInicial, situacao, empresa, inicio, fim }: Props) {
  const router = useRouter()
  const params = useSearchParams()
  const [busca, setBusca] = useState(buscaInicial)

  function navegar(mut: (p: URLSearchParams) => void) {
    const next = new URLSearchParams(params.toString())
    mut(next)
    next.set('pagina', '0')
    router.push(`/servicos?${next.toString()}`)
  }

  function definir(chave: string, valor: string) {
    navegar((p) => {
      if (valor) p.set(chave, valor)
      else p.delete(chave)
    })
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex-1 min-w-[220px]">
        <SearchBar
          placeholder="Buscar por numero do servico ou cliente..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') definir('busca', busca.trim())
          }}
          onBlur={() => definir('busca', busca.trim())}
          fullWidth
        />
      </div>
      <div className="w-44">
        <Select
          label="Situacao"
          value={situacao}
          onChange={(e) => definir('situacao', e.target.value)}
          fullWidth
        >
          {OPCOES_SITUACAO.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.rotulo}
            </option>
          ))}
        </Select>
      </div>
      <div className="w-36">
        <Select
          label="Empresa"
          value={empresa}
          onChange={(e) => definir('empresa', e.target.value)}
          fullWidth
        >
          <option value="">Todas</option>
          {Object.entries(EMPRESA_SERVICO_LABEL).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Select>
      </div>
      <div className="w-40">
        <Input
          label="Inicio de"
          type="date"
          value={inicio}
          onChange={(e) => definir('inicio', e.target.value)}
          fullWidth
        />
      </div>
      <div className="w-40">
        <Input
          label="Inicio ate"
          type="date"
          value={fim}
          onChange={(e) => definir('fim', e.target.value)}
          fullWidth
        />
      </div>
    </div>
  )
}
