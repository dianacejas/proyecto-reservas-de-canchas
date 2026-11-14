import { z } from 'zod'

export const fieldTypeSchema = z.string().trim().min(1).default('Fútbol 5')

export const createFieldSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es requerido'),
  sport: z.string().trim().default('futbol5').optional(),
  type: fieldTypeSchema,
  isCovered: z.boolean().default(false).optional(),
  dimensions: z.string().trim().default('30 x 18 mts').optional(),
  lighting: z.string().trim().default('LED 500 Lux').optional(),
  features: z.array(z.string()).default(['Vestuarios', 'Parrillas']).optional(),
  pricePerHour: z.number().min(0, 'El precio no puede ser negativo'),
  standardPricePerHour: z.number().min(0).optional(),
  peakPricePerHour: z.number().min(0).optional(),
  peakHours: z.array(z.string()).default(['19:00', '20:00', '21:00', '22:00', '23:00']).optional(),
  imageUrl: z.string().trim().max(500).default(''),
  active: z.boolean().default(true).optional(),
  isActive: z.boolean().default(true).optional(),
})

export const updateFieldSchema = createFieldSchema.partial()
export const updateCourtSchema = updateFieldSchema

export type CreateFieldInput = z.infer<typeof createFieldSchema>
export type UpdateFieldInput = z.infer<typeof updateFieldSchema>
export type UpdateCourtInput = z.infer<typeof updateCourtSchema>

export const listFieldsQuerySchema = z.object({
  isActive: z.enum(['true', 'false']).optional(),
})