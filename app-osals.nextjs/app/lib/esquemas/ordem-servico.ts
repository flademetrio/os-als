import { z } from 'zod'

/** Empresas do grupo, usadas para separar OS em relatorios. */
export const EMPRESA_OS_LABEL: Record<string, string> = {
  ALS: 'ALS',
  FRYO: 'FRYO',
}

/** Esquema de abertura de OS. Tecnicos sao obrigatorios; equipamentos e veiculos opcionais. */
export const aberturaOsSchema = z.object({
  descricaoAtividade: z.string().trim().min(1, 'Descreva a atividade'),
  empresa: z.enum(['ALS', 'FRYO'], { message: 'Selecione a empresa' }),
  dataAgendada: z.string().trim().min(1, 'Informe a data agendada'),
  tecnicoIds: z.array(z.number()).min(1, 'Selecione ao menos um tecnico'),
  equipamentoIds: z.array(z.number()),
  veiculoIds: z.array(z.number()),
  contatoIds: z.array(z.number()),
})

export type AberturaOsEntrada = z.infer<typeof aberturaOsSchema>

const horaOpcional = z
  .string()
  .optional()
  .transform((v) => (v && v.trim() ? v : undefined))

/** Esquema da digitacao da execucao da OS. */
export const digitacaoExecucaoSchema = z.object({
  horaInicioExecucao: horaOpcional,
  horaFimExecucao: horaOpcional,
  oQueFoiFeito: z.string().trim().min(1, 'Informe o que foi feito'),
  observacoes: z.string().optional().transform((v) => v?.trim() || undefined),
  impedimentos: z.string().optional().transform((v) => v?.trim() || undefined),
})

export type DigitacaoExecucaoEntrada = z.infer<typeof digitacaoExecucaoSchema>

export const STATUS_OS_LABEL: Record<string, string> = {
  ABERTA: 'Aberta',
  IMPRESSA: 'Impressa',
  PENDENTE_DIGITACAO: 'Pendente de digitacao',
  CONCLUIDA: 'Concluida',
  CANCELADA: 'Cancelada',
}

/** Variante de Badge por status da OS. */
export function badgeStatusOs(
  status: string,
): 'success' | 'info' | 'warning' | 'danger' | 'default' {
  switch (status) {
    case 'ABERTA':
      return 'info'
    case 'IMPRESSA':
      return 'warning'
    case 'PENDENTE_DIGITACAO':
      return 'default'
    case 'CONCLUIDA':
      return 'success'
    case 'CANCELADA':
      return 'danger'
    default:
      return 'default'
  }
}
