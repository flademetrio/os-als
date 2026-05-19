import { z } from 'zod'

export const veiculoSchema = z.object({
  placa: z
    .string()
    .min(1, 'Placa e obrigatoria')
    .transform((s) => s.replace(/[\s-]/g, '').toUpperCase())
    .refine((s) => /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(s), {
      message: 'Placa invalida (formato Mercosul: AAA0A00 ou antigo AAA0000)',
    }),
  marca: z.string().max(40).optional(),
  modelo: z.string().max(60).optional(),
  ano: z
    .string()
    .optional()
    .transform((v) => (v && v.trim() ? Number(v) : undefined))
    .refine((v) => v === undefined || (v >= 1980 && v <= 2100), {
      message: 'Ano deve estar entre 1980 e 2100',
    }),
  status: z.enum(['ATIVO', 'MANUTENCAO', 'INATIVO']).optional(),
})

export type VeiculoEntrada = z.infer<typeof veiculoSchema>
