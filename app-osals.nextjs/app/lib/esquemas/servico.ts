import { z } from 'zod'

/**
 * Esquemas de validacao do Servico. As datas chegam como string vazia
 * quando nao preenchidas — convertidas para undefined antes de enviar.
 */
const dataOpcional = z
  .string()
  .optional()
  .transform((v) => (v && v.trim() ? v : undefined))

export const servicoSchema = z.object({
  tipoServicoId: z
    .string()
    .min(1, 'Selecione o tipo de servico')
    .transform((s) => Number(s)),
  descricao: z.string().trim().min(1, 'Descricao e obrigatoria'),
  dataInicioPrevista: dataOpcional,
  dataFimPrevista: dataOpcional,
})

export const novoServicoSchema = servicoSchema.extend({
  clienteId: z
    .string()
    .min(1, 'Selecione um cliente')
    .transform((s) => Number(s)),
})

export type ServicoEntrada = z.infer<typeof servicoSchema>
export type NovoServicoEntrada = z.infer<typeof novoServicoSchema>

export const STATUS_SERVICO_LABEL: Record<string, string> = {
  EM_ABERTO: 'Em aberto',
  EM_EXECUCAO: 'Em execucao',
  AGUARDANDO: 'Aguardando',
  CONCLUIDO: 'Concluido',
  CANCELADO: 'Cancelado',
}

/** Variante de Badge por status do Servico. */
export function badgeStatusServico(
  status: string,
): 'success' | 'info' | 'warning' | 'danger' | 'default' {
  switch (status) {
    case 'EM_ABERTO':
      return 'info'
    case 'EM_EXECUCAO':
      return 'warning'
    case 'AGUARDANDO':
      return 'default'
    case 'CONCLUIDO':
      return 'success'
    case 'CANCELADO':
      return 'danger'
    default:
      return 'default'
  }
}

type VarianteTipo = 'primary' | 'success' | 'warning' | 'info' | 'purple'

/** Paleta de cores discretas para os badges de tipo de servico. */
const PALETA_TIPO_SERVICO: VarianteTipo[] = [
  'primary',
  'success',
  'warning',
  'info',
  'purple',
]

/**
 * Variante de Badge para um tipo de servico. A cor e derivada do nome
 * (hash deterministico), entao o mesmo tipo recebe sempre a mesma cor,
 * sem precisar cadastrar cor por tipo.
 */
export function badgeTipoServico(nome: string): VarianteTipo {
  let hash = 0
  for (let i = 0; i < nome.length; i++) {
    hash = (hash * 31 + nome.charCodeAt(i)) | 0
  }
  return PALETA_TIPO_SERVICO[Math.abs(hash) % PALETA_TIPO_SERVICO.length]
}

/** Estados intermediarios para os quais o Servico pode ser movido manualmente. */
export const STATUS_INTERMEDIARIOS: { valor: string; rotulo: string }[] = [
  { valor: 'EM_ABERTO', rotulo: 'Em aberto' },
  { valor: 'EM_EXECUCAO', rotulo: 'Em execucao' },
  { valor: 'AGUARDANDO', rotulo: 'Aguardando' },
]
