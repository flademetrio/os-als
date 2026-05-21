'use client'

import { useActionState, useEffect } from 'react'
import { abrirOrdemServico, type EstadoOrdemServico } from '@/app/actions/ordem-servico'
import type {
  ContatoClienteResposta,
  EquipamentoResumoDto,
  TecnicoResumoDto,
  VeiculoResumoDto,
} from '@/app/lib/definicoes'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Textarea'

const ESTADO_INICIAL: EstadoOrdemServico = {}

type Props = {
  servicoId: number
  tecnicos: TecnicoResumoDto[]
  veiculos: VeiculoResumoDto[]
  equipamentos: EquipamentoResumoDto[]
  contatos: ContatoClienteResposta[]
  onClose: () => void
}

export function ModalAbrirOs({
  servicoId,
  tecnicos,
  veiculos,
  equipamentos,
  contatos,
  onClose,
}: Props) {
  const acao = abrirOrdemServico.bind(null, servicoId)
  const [estado, dispatch, pendente] = useActionState(acao, ESTADO_INICIAL)

  useEffect(() => {
    if (estado.sucesso) onClose()
  }, [estado.sucesso, onClose])

  return (
    <Modal open onClose={onClose} title="Abrir ordem de servico" size="lg">
      <form action={dispatch} className="space-y-4">
        {estado.erro && (
          <Alert variant="danger" dismissible>
            {estado.erro}
          </Alert>
        )}

        <Textarea
          label="Descricao da atividade"
          name="descricaoAtividade"
          required
          rows={3}
          hint="O que sera executado nesta OS"
          error={estado.errosCampos?.descricaoAtividade}
          fullWidth
        />

        <Input
          label="Data agendada"
          name="dataAgendada"
          type="date"
          required
          hint="Dia previsto da visita da equipe ao cliente"
          error={estado.errosCampos?.dataAgendada}
          fullWidth
        />

        <ListaSelecao
          titulo="Tecnicos"
          erro={estado.errosCampos?.tecnicoIds}
          vazio="Nenhum tecnico ativo cadastrado."
        >
          {tecnicos.map((t) => (
            <Checkbox
              key={t.id}
              id={`tec-${t.id}`}
              name="tecnicoIds"
              value={t.id}
              label={t.especialidade ? `${t.nome} — ${t.especialidade}` : t.nome}
            />
          ))}
        </ListaSelecao>

        <ListaSelecao
          titulo="Equipamentos atendidos (opcional)"
          vazio="O cliente deste servico nao tem equipamentos cadastrados."
        >
          {equipamentos.map((e) => (
            <Checkbox
              key={e.id}
              id={`eq-${e.id}`}
              name="equipamentoIds"
              value={e.id}
              label={
                [e.marca, e.modelo].filter(Boolean).join(' ') +
                (e.localizacaoInterna ? ` (${e.localizacaoInterna})` : '') || `Equipamento #${e.id}`
              }
            />
          ))}
        </ListaSelecao>

        <ListaSelecao titulo="Veiculos (opcional)" vazio="Nenhum veiculo ativo cadastrado.">
          {veiculos.map((v) => (
            <Checkbox
              key={v.id}
              id={`vei-${v.id}`}
              name="veiculoIds"
              value={v.id}
              label={[v.placa, v.modelo].filter(Boolean).join(' — ')}
            />
          ))}
        </ListaSelecao>

        <ListaSelecao
          titulo="Contatos do cliente (opcional)"
          vazio="Este cliente nao tem contatos cadastrados."
          nota="Os contatos marcados saem na OS e na impressao. Sem marcar nenhum, sai o contato principal."
        >
          {contatos.map((c, i) => (
            <Checkbox
              key={c.id}
              id={`con-${c.id}`}
              name="contatoIds"
              value={c.id}
              label={
                [c.nome, c.funcao].filter(Boolean).join(' — ') +
                (i === 0 ? ' (principal)' : '') +
                (c.telefone ? ` · ${c.telefone}` : '')
              }
            />
          ))}
        </ListaSelecao>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={pendente}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" loading={pendente}>
            {pendente ? 'Abrindo...' : 'Abrir OS'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function ListaSelecao({
  titulo,
  erro,
  vazio,
  nota,
  children,
}: {
  titulo: string
  erro?: string
  vazio: string
  nota?: string
  children: React.ReactNode
}) {
  const vazioLista = Array.isArray(children) && children.length === 0
  return (
    <div>
      <p className="text-sm font-medium text-slate-700 mb-1">{titulo}</p>
      <div className="max-h-40 overflow-y-auto rounded-lg border border-slate-200 p-3 space-y-2">
        {vazioLista ? (
          <p className="text-xs text-slate-400">{vazio}</p>
        ) : (
          children
        )}
      </div>
      {nota && <p className="text-xs text-slate-500 mt-1">{nota}</p>}
      {erro && <p className="text-xs text-red-600 mt-1">{erro}</p>}
    </div>
  )
}
