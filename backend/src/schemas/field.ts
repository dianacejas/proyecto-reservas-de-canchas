import { z } from 'zod'

export const fieldTypeSchema = z.string().trim().min(1).default('Fútbol 5')

export const createFieldSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es requerido'),
  type: fieldTypeSchema,
  pricePerHour: z.number().min(0, 'El precio no puede ser negativo'),
  imageUrl: z.string().trim().max(500).default(''),
  isActive: z.boolean().default(true),
})

export const updateFieldSchema = createFieldSchema.partial()

export type CreateFieldInput = z.infer<typeof createFieldSchema>
export type UpdateFieldInput = z.infer<typeof updateFieldSchema>

export const listFieldsQuerySchema = z.object({
  isActive: z.enum(['true', 'false']).optional(),
})