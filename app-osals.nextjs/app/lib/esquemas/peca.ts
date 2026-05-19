import { z } from 'zod'

export const pecaSchema = z.object({
  nome: z.string().min(1, 'Nome e obrigatorio').max(120),
  descricao: z.string().max(255).optional(),
  unidadeMedidaId: z
    .string()
    .optional()
    .transform((v) => (v && v.trim() ? Number(v) : undefined)),
})

export type PecaEntrada = z.infer<typeof pecaSchema>
