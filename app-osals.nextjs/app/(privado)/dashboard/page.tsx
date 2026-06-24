import Link from 'next/link'
import { clienteApi } from '@/app/lib/cliente-api'
import { lerSessao } from '@/app/lib/sessao'
import type { OrdemServicoResumoDto, PaginaResposta } from '@/app/lib/definicoes'
import { badgeStatusOs } from '@/app/lib/esquemas/ordem-servico'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'

/** Executa a promessa; em caso de erro devolve o fallback (dashboard resiliente). */
async function seguro<T>(promessa: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promessa
  } catch {
    return fallback
  }
}

const PAGINA_VAZIA: PaginaResposta<never> = {
  conteudo: [],
  pagina: 0,
  tamanho: 0,
  totalElementos: 0,
  totalPaginas: 0,
}

// O negocio opera no horario de Brasilia; "hoje/ontem" sao calculados nesse fuso
// (a data de abertura da OS vem como instante ISO em UTC).
const FUSO = 'America/Sao_Paulo'

/** Data (YYYY-MM-DD) do instante, no fuso de Brasilia. */
function diaBR(iso: string | Date): string {
  return new Date(iso).toLocaleDateString('en-CA', { timeZone: FUSO })
}

/** Hora (HH:mm) do instante, no fuso de Brasilia. */
function horaBR(iso: string): string {
  return new Date(iso).toLocaleTimeString('pt-BR', {
    timeZone: FUSO,
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function DashboardPage() {
  const sessao = await lerSessao()

  // Busca as OS mais recentes por data de abertura; o agrupamento hoje/ontem
  // e feito aqui, no fuso de Brasilia. 200 cobre com folga 2 dias de aberturas.
  const pagina = await seguro(
    clienteApi<PaginaResposta<OrdemServicoResumoDto>>(
      '/ordens-servico?tamanho=200&sort=dataAbertura,desc',
    ),
    PAGINA_VAZIA,
  )

  const agora = new Date()
  const hojeStr = diaBR(agora)
  const ontemStr = diaBR(new Date(agora.getTime() - 86_400_000))

  // Canceladas nao entram no painel (ruido).
  const relevantes = pagina.conteudo.filter((os) => os.status !== 'CANCELADA')
  const hoje = relevantes.filter((os) => diaBR(os.dataAbertura) === hojeStr)
  const ontem = relevantes.filter((os) => diaBR(os.dataAbertura) === ontemStr)

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Bem-vindo, {sessao?.nome}.</p>
        </div>
        <Link
          href="/servicos"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-[0_3px_10px_rgba(14,165,233,0.25)] transition-all duration-150 hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
        >
          Todos os servicos em aberto
          <span aria-hidden>&rarr;</span>
        </Link>
      </div>

      <Secao
        titulo="Hoje"
        descricao="Ordens de servico abertas hoje"
        corDot="bg-primary"
        itens={hoje}
      />
      <Secao
        titulo="Ontem"
        descricao="Ordens de servico abertas ontem"
        corDot="bg-slate-400"
        itens={ontem}
      />
    </div>
  )
}

function Secao({
  titulo,
  descricao,
  corDot,
  itens,
}: {
  titulo: string
  descricao: string
  corDot: string
  itens: OrdemServicoResumoDto[]
}) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className={`h-2.5 w-2.5 rounded-full ${corDot}`} />
        <h2 className="text-lg font-semibold text-slate-900">{titulo}</h2>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
          {itens.length}
        </span>
        <span className="text-sm text-slate-400">&middot; {descricao}</span>
      </div>

      {itens.length === 0 ? (
        <Card>
          <p className="py-6 text-center text-sm text-slate-400">
            Nenhuma OS aberta {titulo.toLowerCase()}.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {itens.map((os) => (
            <CardOrdemServico key={os.id} os={os} />
          ))}
        </div>
      )}
    </section>
  )
}

function CardOrdemServico({ os }: { os: OrdemServicoResumoDto }) {
  return (
    <Link href={`/servicos/${os.servicoId}`} className="group block">
      <Card hover padding="none" className="h-full">
        <div className="flex h-full flex-col gap-3 p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-sm font-semibold text-primary group-hover:underline">
              {os.codigoExibicao}
            </span>
            <Badge variant={badgeStatusOs(os.status)} size="sm" dot>
              {os.statusRotulo}
            </Badge>
          </div>

          <div>
            <p className="line-clamp-1 text-base font-semibold leading-snug text-slate-900">
              {os.clienteNome}
            </p>
            <p className="mt-1 line-clamp-2 text-sm text-slate-500">{os.descricaoAtividade}</p>
          </div>

          <div className="mt-auto flex items-center gap-1.5 border-t border-slate-100 pt-2.5 text-xs text-slate-400">
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Aberta as {horaBR(os.dataAbertura)}
          </div>
        </div>
      </Card>
    </Link>
  )
}
