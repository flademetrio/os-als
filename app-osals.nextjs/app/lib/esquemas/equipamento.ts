import { z } from 'zod'

export const equipamentoSchema = z.object({
  marca: z.string().max(60).optional(),
  modelo: z.string().max(60).optional(),
  numeroSerie: z.string().max(60).optional(),
  tipo: z.enum(['SPLIT', 'MULTI_SPLIT', 'VRF', 'SELF', 'CHILLER', 'FAN_COIL', 'JANELA', 'OUTRO'], {
    message: 'Tipo de equipamento e obrigatorio',
  }),
  capacidadeBtus: z
    .string()
    .optional()
    .transform((v) => (v && v.trim() ? Number(v) : undefined))
    .refine((v) => v === undefined || v >= 0, { message: 'BTUs nao pode ser negativo' }),
  capacidadeTr: z
    .string()
    .optional()
    .transform((v) => (v && v.trim() ? v.replace(',', '.') : undefined))
    .transform((v) => (v ? Number(v) : undefined))
    .refine((v) => v === undefined || v >= 0, { message: 'TR nao pode ser negativo' }),
  localizacaoInterna: z.string().max(120).optional(),
  dataInstalacao: z.string().optional().transform((v) => v || undefined),
  dataUltimaManutencao: z.string().optional().transform((v) => v || undefined),
  status: z.enum(['ATIVO', 'EM_MANUTENCAO', 'DESATIVADO']).optional(),
})

export const novoEquipamentoSchema = equipamentoSchema.extend({
  clienteId: z.string().min(1, 'Selecione um cliente').transform((s) => Number(s)),
  unidadeId: z.string().min(1, 'Selecione uma unidade').transform((s) => Number(s)),
})

export type EquipamentoEntrada = z.infer<typeof equipamentoSchema>
export type NovoEquipamentoEntrada = z.infer<typeof novoEquipamentoSchema>

export const TIPOS_EQUIPAMENTO_LABEL: Record<string, string> = {
  SPLIT: 'Split',
  MULTI_SPLIT: 'Multi-Split',
  VRF: 'VRF',
  SELF: 'Self contido',
  CHILLER: 'Chiller',
  FAN_COIL: 'Fan-Coil',
  JANELA: 'Janela',
  OUTRO: 'Outro',
}

export const STATUS_EQUIPAMENTO_LABEL: Record<string, string> = {
  ATIVO: 'Ativo',
  EM_MANUTENCAO: 'Em manutencao',
  DESATIVADO: 'Desativado',
}

export const STATUS_VEICULO_LABEL: Record<string, string> = {
  ATIVO: 'Ativo',
  MANUTENCAO: 'Em manutencao',
  INATIVO: 'Inativo',
}
