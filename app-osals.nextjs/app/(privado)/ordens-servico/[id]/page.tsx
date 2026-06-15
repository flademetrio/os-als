import Link from 'next/link'
import { clienteApi, ErroApi } from '@/app/lib/cliente-api'
import { lerSessao } from '@/app/lib/sessao'
import type {
  AnexoOsResposta,
  ContatoClienteResposta,
  EquipamentoResumoDto,
  OrdemServicoResposta,
  PaginaResposta,
  TecnicoResumoDto,
  VeiculoResumoDto,
} from '@/app/lib/definicoes'
import { badgeStatusOs } from '@/app/lib/esquemas/ordem-servico'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { AcoesOs, type DadosEdicaoOs } from './acoes-os'
import { AnexoOsCard } from './anexo-os-card'

type Props = { params: Promise<{ id: string }> }

export default async function OrdemServicoDetalhePage({ params }: Props) {
  const { id } = await params
  const os = await clienteApi<OrdemServicoResposta>(`/ordens-servico/${id}`)
  const digitada = os.status === 'CONCLUIDA'

  let anexo: AnexoOsResposta | null = null
  try {
    anexo = await clienteApi<AnexoOsResposta>(`/ordens-servico/${id}/anexo`)
  } catch (err) {
    if (!(err instanceof ErroApi && err.status === 404)) throw err
  }

  const sessao = await lerSessao()
  const encerrada = os.status === 'CONCLUIDA' || os.status === 'CANCELADA'
  const ehGestor = sessao?.papel === 'GERENTE' || sessao?.papel === 'ADMIN'
  const ehAdmin = sessao?.papel === 'ADMIN'
  const podeEditarFaturamento = (sessao?.permissoes ?? []).includes('FATURAMENTO_EDITAR')
  const podeAlterarAnexo = !encerrada || ehGestor || podeEditarFaturamento
  const podeEditarOs = (sessao?.permissoes ?? []).includes('ORDEM_SERVICO_EDITAR')

  // Listas-candidatas para o modal de edicao (so carrega quando faz sentido).
  let dadosEdicaoOs: DadosEdicaoOs | undefined
  if (podeEditarOs && !encerrada) {
    const [tecnicos, veiculos, equipamentos, contatos] = await Promise.all([
      clienteApi<PaginaResposta<TecnicoResumoDto>>('/tecnicos?apenasAtivos=true&tamanho=200'),
      clienteApi<PaginaResposta<VeiculoResumoDto>>('/veiculos?apenasAtivos=true&tamanho=200'),
      clienteApi<PaginaResposta<EquipamentoResumoDto>>(
        `/equipamentos?clienteId=${os.clienteId}&apenasAtivos=true&tamanho=200`,
      ),
      clienteApi<ContatoClienteResposta[]>(`/clientes/${os.clienteId}/contatos`),
    ])
    dadosEdicaoOs = {
      tecnicos: tecnicos.conteudo,
      veiculos: veiculos.conteudo,
      equipamentos: equipamentos.conteudo,
      contatos,
      descricaoServico: '',
    }
  }

  return (
    <div className="space-y-6">
      <Link
        href={`/servicos/${os.servicoId}`}
        className="text-sm text-slate-500 hover:text-slate-700"
      >
        ← Voltar para o servico {os.servicoNumeroFormatado}
      </Link>

      <Card padding="md">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="text-2xl font-semibold text-slate-900 font-mono">
                OS {os.codigoExibicao}
              </h1>
              <Badge variant={badgeStatusOs(os.status)} dot>
                {os.statusRotulo}
              </Badge>
            </div>
            <p className="text-sm text-slate-500">
              {os.clienteNome} · {os.tipoServicoNome} ·{' '}
              <Link
                href={`/servicos/${os.servicoId}`}
                className="text-primary hover:underline"
              >
                Servico {os.servicoNumeroFormatado}
              </Link>
            </p>
            {os.dataAgendada && (
              <p className="text-xs font-medium text-slate-600 mt-1">
                Agendada para {formatarData(os.dataAgendada)}
              </p>
            )}
            <p className="text-xs text-slate-400 mt-1">
              Aberta em {formatarDataHora(os.dataAbertura)}
              {os.dataImpressao ? ` · Impressa em ${formatarDataHora(os.dataImpressao)}` : ''}
            </p>
          </div>
          <AcoesOs
            os={os}
            ehAdmin={ehAdmin}
            podeEditar={podeEditarOs}
            dadosEdicao={dadosEdicaoOs}
          />
        </div>
      </Card>

      <Card padding="md" title="Dados da OS">
        <div className="space-y-4">
          <Campo titulo="Data agendada">
            <p className="text-sm text-slate-700">{formatarData(os.dataAgendada)}</p>
          </Campo>

          <Campo titulo="Atividade prevista">
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{os.descricaoAtividade}</p>
          </Campo>

          <Campo titulo="Tecnicos">
            {os.tecnicos.length === 0 ? (
              <Vazio />
            ) : (
              <ul className="text-sm text-slate-700 list-disc list-inside">
                {os.tecnicos.map((t) => (
                  <li key={t.id}>
                    {t.nome}
                    {t.especialidade ? ` — ${t.especialidade}` : ''}
                  </li>
                ))}
              </ul>
            )}
          </Campo>

          <Campo titulo="Veiculos">
            {os.veiculos.length === 0 ? (
              <Vazio />
            ) : (
              <ul className="text-sm text-slate-700 list-disc list-inside">
                {os.veiculos.map((v) => (
                  <li key={v.id}>
                    {[v.placa, v.marca, v.modelo].filter(Boolean).join(' ')}
                  </li>
                ))}
              </ul>
            )}
          </Campo>

          <Campo titulo="Equipamentos atendidos">
            {os.equipamentos.length === 0 ? (
              <Vazio />
            ) : (
              <ul className="text-sm text-slate-700 list-disc list-inside">
                {os.equipamentos.map((e) => (
                  <li key={e.id}>
                    {[e.marca, e.modelo].filter(Boolean).join(' ') || `Equipamento #${e.id}`}
                    {e.localizacaoInterna ? ` — ${e.localizacaoInterna}` : ''}
                    {e.numeroSerie ? ` (s/n ${e.numeroSerie})` : ''}
                  </li>
                ))}
              </ul>
            )}
          </Campo>

          <Campo titulo="Contatos do cliente">
            {os.contatos.length === 0 ? (
              <Vazio />
            ) : (
              <ul className="text-sm text-slate-700 list-disc list-inside">
                {os.contatos.map((c) => (
                  <li key={c.id}>
                    {[c.nome, c.funcao].filter(Boolean).join(' — ')}
                    {c.telefone ? ` · ${c.telefone}` : ''}
                  </li>
                ))}
              </ul>
            )}
          </Campo>
        </div>
      </Card>

      {digitada && (
        <Card padding="md" title="Execucao">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Campo titulo="Hora de inicio">
                <p className="text-sm text-slate-700">{formatarDataHora(os.horaInicioExecucao)}</p>
              </Campo>
              <Campo titulo="Hora de fim">
                <p className="text-sm text-slate-700">{formatarDataHora(os.horaFimExecucao)}</p>
              </Campo>
            </div>
            <Campo titulo="O que foi feito">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{os.oQueFoiFeito ?? '-'}</p>
            </Campo>
            <Campo titulo="Observacoes">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{os.observacoes ?? '-'}</p>
            </Campo>
            <Campo titulo="Impedimentos">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{os.impedimentos ?? '-'}</p>
            </Campo>
            {os.digitadoEm && (
              <p className="text-xs text-slate-400">
                Digitada em {formatarDataHora(os.digitadoEm)}
                {os.digitadoPorNome ? ` por ${os.digitadoPorNome}` : ''}
              </p>
            )}
          </div>
        </Card>
      )}

      <AnexoOsCard osId={os.id} anexo={anexo} podeAlterar={podeAlterarAnexo} />
    </div>
  )
}

function Campo({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
        {titulo}
      </p>
      {children}
    </div>
  )
}

function Vazio() {
  return <p className="text-sm text-slate-400">-</p>
}

function formatarDataHora(iso: string | null): string {
  if (!iso) return '-'
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

/** Converte uma data ISO (AAAA-MM-DD) para DD/MM/AAAA. */
function formatarData(iso: string | null): string {
  if (!iso) return '-'
  const [ano, mes, dia] = iso.split('-')
  return dia && mes && ano ? `${dia}/${mes}/${ano}` : iso
}
