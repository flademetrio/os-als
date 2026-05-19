import { z } from 'zod'

const documentoLimpo = (s: string | undefined) => (s ? s.replace(/\D/g, '') : '')

export const fornecedorSchema = z.object({
  nome: z.string().min(1, 'Nome e obrigatorio').max(160),
  tipoPessoa: z
    .union([z.enum(['PF', 'PJ']), z.literal('')])
    .optional()
    .transform((v) => (v === '' || v === undefined ? undefined : v)),
  documento: z
    .string()
    .optional()
    .transform(documentoLimpo)
    .refine((d) => d === '' || d.length === 11 || d.length === 14, {
      message: 'Documento deve ter 11 (CPF) ou 14 (CNPJ) digitos',
    }),
  telefone: z.string().max(20).optional(),
  email: z
    .string()
    .max(160)
    .optional()
    .transform((v) => (v && v.trim() ? v.trim() : ''))
    .refine((v) => v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), {
      message: 'E-mail invalido',
    }),
})

export type FornecedorEntrada = z.infer<typeof fornecedorSchema>
