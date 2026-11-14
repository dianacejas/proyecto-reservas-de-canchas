import { z } from 'zod'

export const createCommunityNoticeSchema = z.object({
  type: z.enum(['falta_uno', 'desafio_rival']),
  title: z.string().trim().min(3, 'El título debe tener al menos 3 caracteres').max(100),
  description: z.string().trim().min(5, 'La descripción debe tener al menos 5 caracteres').max(500),
  date: z.string().trim().min(1, 'La fecha es requerida'),
  timeSlot: z.string().trim().min(1, 'El horario es requerido'),
  courtName: z.string().trim().max(100).optional().default(''),
  contactPhone: z.string().trim().min(6, 'Ingresa un número de contacto válido').max(30),
  positionNeeded: z.string().trim().max(50).optional().default('Cualquiera'),
})

export type CreateCommunityNoticeInput = z.infer<typeof createCommunityNoticeSchema>
