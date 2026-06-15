'use client'

import { useActionState, useState } from 'react'
import { salvarCobranca, type EstadoFaturamento } from '@/app/actions/faturamento'
import type { CobrancaResposta, TipoCobranca } from '@/app/lib/definicoes'
import { TIPO_COBRANCA_LABEL } from '@/app/lib/esquemas/faturamento'
import { centavosParaReais } from '@/app/lib/moeda'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'

const ESTADO_INICIAL: EstadoFaturamento = {}

type Props = {
  servicoId: number
  cobranca: CobrancaResposta
  podeAlterar: boolean
}

/** Centavos para string editavel em reais (sem prefixo): 29990 -> "299,90". */
function centavosParaCampo(centavos: number | null): string {
  if (centavos == null) return ''
  return (centavos / 100).toFixed(2).replace('.', ',')
}

export function TabCobranca({ servicoId, cobranca, podeAlterar }: Props) {
  const acao = salvarCobranca.bind(null, servicoId)
  const [estado, dispatch, pendente] = useActionState(acao, ESTADO_INICIAL)
  const [tipo, setTipo] = useState<TipoCobranca>(cobranca.tipo)

  if (!podeAlterar) {
    return (
      <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
        <Campo titulo="Tipo de cobranca" valor={cobranca.tipoRotulo} />
        <Campo
          titulo="Valor"
          valor={cobranca.valorCentavos != null ? centavosParaReais(cobranca.valorCentavos) : '—'}
        />
        <Campo titulo="Dias previstos" valor={cobranca.diasPrevistos?.toString() ?? '—'} />
        <Campo titulo="Qtde de pessoas" valor={cobranca.qtdePessoas?.toString() ?? '—'} />
        <div className="sm:col-span-2 lg:col-span-3">
          <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Observacoes
          </dt>
          <dd className="text-sm text-slate-700 whitespace-pre-wrap">{cobranca.obs || '—'}</dd>
        </div>
      </dl>
    )
  }

  return (
    <form action={dispatch} className="space-y-4 max-w-2xl">
      {estado.erro && (
        <Alert variant="danger" dismissible>
          {estado.erro}
        </Alert>
      )}
      {estado.sucesso && (
        <Alert variant="success" dismissible>
          Cobranca salva.
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Tipo de cobranca"
          name="tipo"
          required
          value={tipo}
          onChange={(e) => setTipo(e.target.value as TipoCobranca)}
          fullWidth
        >
          {(Object.keys(TIPO_COBRANCA_LABEL) as TipoCobranca[]).map((k) => (
            <option key={k} value={k}>
              {TIPO_COBRANCA_LABEL[k]}
            </option>
          ))}
        </Select>

        {tipo === 'COBRADO' && (
          <Input
            label="Valor cobrado (R$)"
            name="valorReais"
            required
            placeholder="Ex.: 1.250,00"
            defaultValue={centavosParaCampo(cobranca.valorCentavos)}
            error={estado.errosCampos?.valorReais}
            fullWidth
          />
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Dias previstos para o servico"
          name="diasPrevistos"
          type="number"
          min={0}
          defaultValue={cobranca.diasPrevistos?.toString() ?? ''}
          fullWidth
        />
        <Input
          label="Qtde de pessoas"
          name="qtdePessoas"
          type="number"
          min={0}
          defaultValue={cobranca.qtdePessoas?.toString() ?? ''}
          fullWidth
        />
      </div>

      <Textarea
        label="Observacoes"
        name="obs"
        rows={3}
        defaultValue={cobranca.obs ?? ''}
        fullWidth
      />

      <div className="flex items-center justify-end pt-1">
        <Button type="submit" variant="primary" loading={pendente}>
          {pendente ? 'Salvando...' : 'Salvar cobranca'}
        </Button>
      </div>
    </form>
  )
}

function Campo({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{titulo}</dt>
      <dd className="text-sm text-slate-700">{valor}</dd>
    </div>
  )
}
