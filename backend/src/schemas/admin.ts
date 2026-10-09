import { z } from 'zod'

export const dateQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
})

export type DateQuery = z.infer<typeof dateQuerySchema>