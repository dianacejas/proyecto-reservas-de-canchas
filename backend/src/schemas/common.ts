import { z } from 'zod'

export const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'ID inválido')

export const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato de hora inválido (HH:mm)')

export const idParamsSchema = z.object({
  id: objectIdSchema,
})

export type IdParams = z.infer<typeof idParamsSchema>