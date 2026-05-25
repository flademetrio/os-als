'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useActionState, useEffect } from 'react'
import { atualizarPeca, criarPeca, type EstadoPeca } from '@/app/actions/peca'
import type { PecaResposta, UnidadeMedidaResposta } from '@/app/lib/definicoes'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'

const ESTADO_INICIAL: EstadoPeca = {}

type Props = {
  peca: PecaResposta | null
  unidadesMedida: UnidadeMedidaResposta[]
  /** Apenas no modo criar: quando informado, "Cancelar" fecha o modal. */
  onCancelar?: () => void
  /**
   * Apenas no modo criar: chamado apos criar a peca. Sem callback, navega
   * para o detalhe; com callback (drawer), o pai decide o destino.
   */
  onCriado?: (peca: PecaResposta) => void
}

export function FormularioPeca({ peca, unidadesMedida, onCancelar, onCriado }: Props) {
  const router = useRouter()
  const acao = peca ? atualizarPeca.bind(null, peca.id) : criarPeca
  const [estado, dispatch, pendente] = useActionState(acao, ESTADO_INICIAL)

  useEffect(() => {
    if (!estado.criado) return
    if (onCriado) onCriado(estado.criado)
    else router.push(`/pecas/${estado.criado.id}`)
  }, [estado.criado, onCriado, router])

  return (
    <form action={dispatch} className="space-y-4">
      {estado.erro && <Alert variant="danger" dismissible>{estado.erro}</Alert>}
      {estado.sucesso && <Alert variant="success" dismissible>Dados atualizados.</Alert>}

      <Input
        label="Nome"
        name="nome"
        defaultValue={peca?.nome ?? ''}
        required
        error={estado.errosCampos?.nome}
        fullWidth
      />

      <Textarea
        label="Descricao"
        name="descricao"
        defaultValue={peca?.descricao ?? ''}
        hint="Opcional — detalhes tecnicos da peca"
        rows={3}
        error={estado.errosCampos?.descricao}
        fullWidth
      />

      <Select
        label="Unidade de medida"
        name="unidadeMedidaId"
        defaultValue={peca?.unidadeMedidaId?.toString() ?? ''}
        error={estado.errosCampos?.unidadeMedidaId}
        fullWidth
      >
        <option value="">— Nao especificada</option>
        {unidadesMedida.map((u) => (
          <option key={u.id} value={u.id}>
            {u.sigla} — {u.nome}
          </option>
        ))}
      </Select>

      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancelar ? (
          <Button type="button" variant="ghost" onClick={onCancelar} disabled={pendente}>
            Cancelar
          </Button>
        ) : (
          <Link href="/pecas">
            <Button type="button" variant="ghost">Cancelar</Button>
          </Link>
        )}
        <Button type="submit" variant="primary" loading={pendente}>
          {pendente ? 'Salvando...' : peca ? 'Salvar alteracoes' : 'Criar peca'}
        </Button>
      </div>
    </form>
  )
}
