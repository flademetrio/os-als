'use client'

import { useActionState } from 'react'
import { atualizarTecnico, type EstadoTecnico } from '@/app/actions/tecnico'
import type { TecnicoResposta } from '@/app/lib/definicoes'
import { centavosParaReais } from '@/app/lib/moeda'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const ESTADO_INICIAL: EstadoTecnico = {}

type Props = {
  tecnico: TecnicoResposta
  podeEditar: boolean
}

export function FormularioEdicaoTecnico({ tecnico, podeEditar }: Props) {
  const acao = atualizarTecnico.bind(null, tecnico.id)
  const [estado, dispatch, pendente] = useActionState(acao, ESTADO_INICIAL)

  // Converte centavos -> "45,00" pro defaultValue do input
  const valorHoraDefault = (tecnico.valorHoraCentavos / 100)
    .toFixed(2)
    .replace('.', ',')

  return (
    <form action={dispatch} className="space-y-4">
      {estado.erro && <Alert variant="danger" dismissible>{estado.erro}</Alert>}
      {estado.sucesso && <Alert variant="success" dismissible>Dados atualizados.</Alert>}

      <Input
        label="Nome"
        name="nome"
        defaultValue={tecnico.nome}
        required
        disabled={!podeEditar}
        error={estado.errosCampos?.nome}
        fullWidth
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="E-mail"
          value={tecnico.email}
          disabled
          hint="E-mail nao alteravel via esta tela"
          fullWidth
        />
        <Input
          label="Valor/hora atual"
          value={centavosParaReais(tecnico.valorHoraCentavos)}
          disabled
          fullWidth
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Novo valor/hora (R$)"
          name="valorHoraReais"
          defaultValue={valorHoraDefault}
          required
          disabled={!podeEditar}
          error={estado.errosCampos?.valorHoraReais}
          fullWidth
        />
        <Input
          label="Telefone"
          name="telefone"
          defaultValue={tecnico.telefone ?? ''}
          disabled={!podeEditar}
          error={estado.errosCampos?.telefone}
          fullWidth
        />
      </div>

      <Input
        label="Especialidade"
        name="especialidade"
        defaultValue={tecnico.especialidade ?? ''}
        disabled={!podeEditar}
        error={estado.errosCampos?.especialidade}
        fullWidth
      />

      {podeEditar && (
        <div className="flex justify-end pt-2">
          <Button type="submit" variant="primary" loading={pendente} disabled={!tecnico.ativo}>
            {pendente ? 'Salvando...' : 'Salvar alteracoes'}
          </Button>
        </div>
      )}
    </form>
  )
}
