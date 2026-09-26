import { z } from 'zod'
import { objectIdSchema, timeSchema } from './common.js'

export const bookingStatusSchema = z.enum(['pendiente', 'confirmada', 'cancelada'])
export const bookingTypeSchema = z.enum(['amistoso', 'torneo'])

export const clientInfoSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es requerido'),
  phone: z.string().trim().min(6, 'El teléfono es inválido'),
})

const bookingFields = {
  fieldId: objectIdSchema,
  date: z.coerce.date(),
  startTime: timeSchema,
  endTime: timeSchema,
  clientInfo: clientInfoSchema,
  status: bookingStatusSchema.default('pendiente'),
  type: bookingTypeSchema.default('amistoso'),
}

export const createBookingSchema = z
  .object({ ...bookingFields })
  .refine((b) => b.endTime > b.startTime, {
    message: 'La hora de fin debe ser posterior a la de inicio',
    path: ['endTime'],
  })

export const updateBookingSchema = z
  .object({ ...bookingFields })
  .partial()
  .refine((b) => b.endTime === undefined || b.startTime === undefined || b.endTime > b.startTime, {
    message: 'La hora de fin debe ser posterior a la de inicio',
    path: ['endTime'],
  })

export type CreateBookingInput = z.infer<typeof createBookingSchema>
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>

export const listBookingsQuerySchema = z.object({
  fieldId: objectIdSchema.optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)')
    .optional(),
  status: bookingStatusSchema.optional(),
})

export type ListBookingsQuery = z.infer<typeof listBookingsQuerySchema>