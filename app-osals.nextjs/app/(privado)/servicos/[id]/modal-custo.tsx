'use client'

import { useActionState, useEffect, useState } from 'react'
import { editarCusto, lancarCusto, type EstadoCusto } from '@/app/actions/custo'
import type {
  CategoriaCustoResposta,
  LancamentoCustoResposta,
  TecnicoResumoDto,
} from '@/app/lib/definicoes'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'

const ESTADO_INICIAL: EstadoCusto = {}

type Props = {
  servicoId: number
  categorias: CategoriaCustoResposta[]
  tecnicos: TecnicoResumoDto[]
  /** Quando informado, o modal edita o lancamento existente. */
  lancamento: LancamentoCustoResposta | null
  onClose: () => void
}

/** Centavos para string editavel em reais (sem prefixo): 29990 -> "299,90". */
function centavosParaCampo(centavos: number | null): string {
  if (centavos == null) return ''
  return (centavos / 100).toFixed(2).replace('.', ',')
}

export function ModalCusto({ servicoId, categorias, tecnicos, lancamento, onClose }: Props) {
  const editando = lancamento != null
  const acao = editando
    ? editarCusto.bind(null, servicoId, lancamento.id)
    : lancarCusto.bind(null, servicoId)
  const [estado, dispatch, pendente] = useActionState(acao, ESTADO_INICIAL)

  const [categoriaId, setCategoriaId] = useState<string>(
    lancamento ? String(lancamento.categoriaCustoId) : '',
  )

  useEffect(() => {
    if (estado.sucesso) onClose()
  }, [estado.sucesso, onClose])

  const categoria = categorias.find((c) => String(c.id) === categoriaId)
  const tipo = categoria?.tipoLancamento

  return (
    <Modal
      open
      onClose={onClose}
      title={editando ? 'Editar custo' : 'Lancar custo'}
      size="md"
    >
      <form action={dispatch} className="space-y-4">
        {estado.erro && (
          <Alert variant="danger" dismissible>
            {estado.erro}
          </Alert>
        )}

        <Select
          label="Categoria"
          name="categoriaCustoId"
          required
          value={categoriaId}
          onChange={(e) => setCategoriaId(e.target.value)}
          error={estado.errosCampos?.categoriaCustoId}
          disabled={editando}
          fullWidth
        >
          <option value="">— Selecione</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </Select>

        {tipo === 'ESTRUTURADO_MAO_OBRA' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Tecnico"
              name="tecnicoId"
              required
              defaultValue={lancamento?.tecnicoId ? String(lancamento.tecnicoId) : ''}
              fullWidth
            >
              <option value="">— Selecione</option>
              {tecnicos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nome}
                </option>
              ))}
            </Select>
            <Input
              label="Horas"
              name="horas"
              required
              placeholder="Ex.: 2,5"
              defaultValue={lancamento?.horas != null ? String(lancamento.horas).replace('.', ',') : ''}
              fullWidth
            />
          </div>
        )}

        {tipo === 'ESTRUTURADO_DESLOCAMENTO' && (
          <>
            <Input
              label="Quilometragem (km)"
              name="km"
              required
              placeholder="Ex.: 40"
              defaultValue={lancamento?.km != null ? String(lancamento.km).replace('.', ',') : ''}
              fullWidth
            />
            <Input
              label="Descricao (opcional)"
              name="descricao"
              defaultValue={lancamento?.descricao ?? ''}
              fullWidth
            />
          </>
        )}

        {tipo === 'LIVRE' && (
          <>
            <Input
              label="Descricao"
              name="descricao"
              defaultValue={lancamento?.descricao ?? ''}
              fullWidth
            />
            <Input
              label="Valor (R$)"
              name="valorReais"
              required
              placeholder="Ex.: 1.250,00"
              defaultValue={centavosParaCampo(lancamento?.valorTotalCentavos ?? null)}
              error={estado.errosCampos?.valorReais}
              fullWidth
            />
          </>
        )}

        {tipo && tipo !== 'LIVRE' && (
          <p className="text-xs text-slate-500">
            O valor total e calculado pelo sistema a partir dos dados informados.
          </p>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={pendente}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" loading={pendente} disabled={!categoria}>
            {pendente ? 'Salvando...' : editando ? 'Salvar' : 'Lancar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
