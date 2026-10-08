import { z } from 'zod'
import { objectIdSchema } from './common.js'

export const registrationStatusSchema = z.enum([
  'pendiente_aprobacion',
  'aprobada',
  'rechazada',
])

export const createRegistrationSchema = z.object({
  teamName: z.string().trim().min(2, 'El nombre del equipo es requerido'),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Color inválido')
    .default('#16a34a'),
  captainName: z.string().trim().min(2, 'El nombre del capitán es requerido'),
  captainPhone: z.string().trim().min(6, 'El teléfono del capitán es requerido'),
  players: z
    .array(z.string().trim().min(1, 'El nombre del jugador es requerido'))
    .min(5, 'Cargá al menos 5 jugadores')
    .max(10, 'Máximo 10 jugadores'),
})

export const listRegistrationsQuerySchema = z.object({
  status: registrationStatusSchema.optional(),
})

export const approveRegistrationSchema = z.object({
  group: z.string().trim().min(1, 'El grupo es requerido').default('Grupo A'),
})

export const registrationParamsSchema = z.object({
  id: objectIdSchema,
  registrationId: objectIdSchema,
})

export type CreateRegistrationInput = z.infer<typeof createRegistrationSchema>
export type ListRegistrationsQuery = z.infer<typeof listRegistrationsQuerySchema>
export type ApproveRegistrationInput = z.infer<typeof approveRegistrationSchema>
export type RegistrationParams = z.infer<typeof registrationParamsSchema>
