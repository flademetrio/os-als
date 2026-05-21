import Link from 'next/link'
import { clienteApi } from '@/app/lib/cliente-api'
import { lerSessao } from '@/app/lib/sessao'
import type {
  CustosPorClienteItem,
  OrdemServicoResumoDto,
  PaginaResposta,
  ServicoResumoDto,
} from '@/app/lib/definicoes'
import { centavosParaReais } from '@/app/lib/moeda'
import { badgeStatusOs } from '@/app/lib/esquemas/ordem-servico'
import { badgeStatusServico } from '@/app/lib/esquemas/servico'
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

function iso(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export default async function DashboardPage() {
  const sessao = await lerSessao()
  const ehGestor = sessao?.papel === 'GERENTE' || sessao?.papel === 'ADMIN'

  const hoje = new Date()
  const em7dias = new Date(hoje)
  em7dias.setDate(hoje.getDate() + 7)
  const primeiroDoMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)

  const [osAbertas, osPendentes, servicosExecucao, osImpressas, proximosServicos] =
    await Promise.all([
      seguro(
        clienteApi<PaginaResposta<OrdemServicoResumoDto>>('/ordens-servico?status=ABERTA&tamanho=1'),
        PAGINA_VAZIA,
      ),
      seguro(
        clienteApi<PaginaResposta<OrdemServicoResumoDto>>(
          '/ordens-servico?status=PENDENTE_DIGITACAO&tamanho=1',
        ),
        PAGINA_VAZIA,
      ),
      seguro(
        clienteApi<PaginaResposta<ServicoResumoDto>>('/servicos?status=EM_EXECUCAO&tamanho=1'),
        PAGINA_VAZIA,
      ),
      seguro(
        clienteApi<PaginaResposta<OrdemServicoResumoDto>>('/ordens-servico?status=IMPRESSA&tamanho=10'),
        PAGINA_VAZIA,
      ),
      seguro(
        clienteApi<PaginaResposta<ServicoResumoDto>>(
          `/servicos?inicio=${iso(hoje)}&fim=${iso(em7dias)}&tamanho=10`,
        ),
        PAGINA_VAZIA,
      ),
    ])

  let custoDoMes: number | null = null
  if (ehGestor) {
    const custos = await seguro(
      clienteApi<CustosPorClienteItem[]>(
        `/relatorios/custos-por-cliente?inicio=${iso(primeiroDoMes)}&fim=${iso(hoje)}`,
      ),
      [],
    )
    custoDoMes = custos.reduce((s, c) => s + c.precoVendaCentavos, 0)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Bem-vindo, {sessao?.nome}.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi
          titulo="OS abertas"
          valor={osAbertas.totalElementos}
          cor="text-primary"
          href="/ordens-servico?status=ABERTA"
        />
        <Kpi
          titulo="Pendentes de digitacao"
          valor={osPendentes.totalElementos}
          cor="text-amber-600"
          href="/ordens-servico?status=PENDENTE_DIGITACAO"
        />
        <Kpi
          titulo="Servicos em execucao"
          valor={servicosExecucao.totalElementos}
          cor="text-secondary"
          href="/servicos?status=EM_EXECUCAO"
        />
        {custoDoMes != null && (
          <Kpi
            titulo="Preco de venda no mes"
            valorTexto={centavosParaReais(custoDoMes)}
            cor="text-primary-dark"
            href="/relatorios/custos-por-cliente"
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Ultimas OS impressas" subtitle="Aguardando devolucao/digitacao">
          {osImpressas.conteudo.length === 0 ? (
            <Vazio texto="Nenhuma OS impressa no momento." />
          ) : (
            <ul className="divide-y divide-slate-100 -mb-2">
              {osImpressas.conteudo.map((os) => (
                <li key={os.id} className="py-2 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/ordens-servico/${os.id}`}
                      className="text-primary hover:underline font-medium font-mono text-sm"
                    >
                      {os.codigoExibicao}
                    </Link>
                    <span className="block text-xs text-slate-500 truncate">
                      {os.clienteNome}
                    </span>
                  </div>
                  <Badge variant={badgeStatusOs(os.status)} size="sm" dot>
                    {os.statusRotulo}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Proximos servicos" subtitle="Inicio previsto nos proximos 7 dias">
          {proximosServicos.conteudo.length === 0 ? (
            <Vazio texto="Nenhum servico com inicio previsto para a semana." />
          ) : (
            <ul className="divide-y divide-slate-100 -mb-2">
              {proximosServicos.conteudo.map((s) => (
                <li key={s.id} className="py-2 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/servicos/${s.id}`}
                      className="text-primary hover:underline font-medium font-mono text-sm"
                    >
                      {s.numeroFormatado}
                    </Link>
                    <span className="block text-xs text-slate-500 truncate">{s.clienteNome}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge variant={badgeStatusServico(s.status)} size="sm" dot>
                      {s.statusRotulo}
                    </Badge>
                    <span className="block text-xs text-slate-400 mt-0.5">
                      {formatarData(s.dataInicioPrevista)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}

function Kpi({
  titulo,
  valor,
  valorTexto,
  cor,
  href,
}: {
  titulo: string
  valor?: number
  valorTexto?: string
  cor: string
  href: string
}) {
  return (
    <Link href={href} className="block">
      <Card padding="md" hover>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{titulo}</p>
        <p className={`text-2xl font-semibold mt-1 ${cor}`}>
          {valorTexto ?? valor ?? 0}
        </p>
      </Card>
    </Link>
  )
}

function Vazio({ texto }: { texto: string }) {
  return <p className="text-sm text-slate-400 py-4 text-center">{texto}</p>
}

function formatarData(iso: string | null): string {
  if (!iso) return '-'
  const [ano, mes, dia] = iso.split('-')
  return dia && mes && ano ? `${dia}/${mes}/${ano}` : iso
}
