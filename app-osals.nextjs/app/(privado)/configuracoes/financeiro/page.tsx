import Link from 'next/link'
import { clienteApi } from '@/app/lib/cliente-api'
import type { ConfiguracaoResposta } from '@/app/lib/definicoes'
import { Card } from '@/components/ui/Card'
import { FormularioMarkup } from './formulario-markup'
import { FormularioValorKm } from './formulario-valor-km'

export default async function FinanceiroPage() {
  const configs = await clienteApi<ConfiguracaoResposta[]>('/configuracoes')
  const markup = configs.find((c) => c.chave === 'markup_percentual')
  const valorKm = configs.find((c) => c.chave === 'valor_km_centavos')

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/configuracoes"
        className="text-sm text-slate-500 hover:text-slate-700"
      >
        ← Voltar para configuracoes
      </Link>

      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Configuracoes financeiras
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Valores aplicados no calculo automatico do preco da Ordem de Servico.
        </p>
      </div>

      <Card padding="md" title="Markup percentual" subtitle="Aplicado sobre o custo total para calcular o preco sugerido.">
        {markup ? (
          <FormularioMarkup configuracao={markup} />
        ) : (
          <p className="text-sm text-slate-500">Configuracao nao encontrada.</p>
        )}
      </Card>

      <Card padding="md" title="Valor por km" subtitle="Usado nos lancamentos de deslocamento da OS.">
        {valorKm ? (
          <FormularioValorKm configuracao={valorKm} />
        ) : (
          <p className="text-sm text-slate-500">Configuracao nao encontrada.</p>
        )}
      </Card>
    </div>
  )
}
