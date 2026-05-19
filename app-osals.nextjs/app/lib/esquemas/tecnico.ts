import { z } from 'zod'
import { reaisParaCentavos } from '@/app/lib/moeda'

export const criacaoTecnicoSchema = z.object({
  nome: z.string().min(1, 'Nome e obrigatorio').max(120),
  email: z.string().min(1, 'E-mail e obrigatorio').email('E-mail invalido').max(160),
  senha: z.string().min(8, 'Senha deve ter no minimo 8 caracteres'),
  valorHoraReais: z
    .string()
    .min(1, 'Valor/hora e obrigatorio')
    .transform((s, ctx) => {
      try {
        return reaisParaCentavos(s)
      } catch {
        ctx.addIssue({ code: 'custom', message: 'Valor/hora invalido' })
        return z.NEVER
      }
    }),
  especialidade: z.string().max(80).optional(),
  telefone: z.string().max(20).optional(),
})

export const atualizacaoTecnicoSchema = z.object({
  nome: z.string().min(1, 'Nome e obrigatorio').max(120),
  valorHoraReais: z
    .string()
    .min(1, 'Valor/hora e obrigatorio')
    .transform((s, ctx) => {
      try {
        return reaisParaCentavos(s)
      } catch {
        ctx.addIssue({ code: 'custom', message: 'Valor/hora invalido' })
        return z.NEVER
      }
    }),
  especialidade: z.string().max(80).optional(),
  telefone: z.string().max(20).optional(),
})

export const redefinicaoSenhaSchema = z.object({
  novaSenha: z.string().min(8, 'Senha deve ter no minimo 8 caracteres'),
})

export type CriacaoTecnicoEntrada = z.infer<typeof criacaoTecnicoSchema>
export type AtualizacaoTecnicoEntrada = z.infer<typeof atualizacaoTecnicoSchema>
export type RedefinicaoSenhaEntrada = z.infer<typeof redefinicaoSenhaSchema>
