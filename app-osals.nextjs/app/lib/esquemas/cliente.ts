import { z } from 'zod'

const documentoLimpo = (s: string) => s.replace(/\D/g, '')

export const criacaoClienteSchema = z.object({
  tipoPessoa: z.enum(['PF', 'PJ'], { message: 'Tipo de pessoa invalido' }),
  documento: z
    .string()
    .min(1, 'Documento e obrigatorio')
    .transform(documentoLimpo)
    .refine((d) => d.length === 11 || d.length === 14, {
      message: 'Documento deve ter 11 (CPF) ou 14 (CNPJ) digitos',
    }),
  nome: z.string().min(1, 'Nome e obrigatorio').max(160, 'Nome muito longo'),
  nomeFantasia: z
    .string()
    .max(160, 'Nome fantasia muito longo')
    .optional()
    .transform((v) => (v && v.trim() ? v.trim() : undefined)),
})

export const atualizacaoClienteSchema = z.object({
  nome: z.string().min(1, 'Nome e obrigatorio').max(160),
  nomeFantasia: z
    .string()
    .max(160)
    .optional()
    .transform((v) => (v && v.trim() ? v.trim() : undefined)),
})

export const unidadeSchema = z.object({
  identificacaoInterna: z.string().min(1, 'Identificacao e obrigatoria').max(80),
  cep: z
    .string()
    .optional()
    .transform((v) => (v ? v.replace(/\D/g, '') : ''))
    .refine((v) => v === '' || v.length === 8, { message: 'CEP deve ter 8 digitos' }),
  logradouro: z.string().max(160).optional(),
  numero: z.string().max(20).optional(),
  complemento: z.string().max(80).optional(),
  bairro: z.string().max(80).optional(),
  cidade: z.string().max(80).optional(),
  estado: z
    .string()
    .optional()
    .transform((v) => (v ? v.trim().toUpperCase() : ''))
    .refine((v) => v === '' || /^[A-Z]{2}$/.test(v), {
      message: 'Estado deve ser UF de 2 letras',
    }),
})

export const contatoSchema = z.object({
  nome: z.string().min(1, 'Nome e obrigatorio').max(120),
  funcao: z.string().max(60).optional(),
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

export type CriacaoClienteEntrada = z.infer<typeof criacaoClienteSchema>
export type AtualizacaoClienteEntrada = z.infer<typeof atualizacaoClienteSchema>
export type UnidadeEntrada = z.infer<typeof unidadeSchema>
export type ContatoEntrada = z.infer<typeof contatoSchema>
