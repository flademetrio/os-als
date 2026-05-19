import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().min(1, 'Email e obrigatorio').email('Email invalido'),
  senha: z.string().min(1, 'Senha e obrigatoria'),
})

export type LoginEntrada = z.infer<typeof loginSchema>
