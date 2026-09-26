import { z } from 'zod'
import { objectIdSchema } from './common.js'

export const playerSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es requerido'),
  number: z.number().int().min(0).max(99),
})

export const createTeamSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es requerido'),
  tournamentId: objectIdSchema,
  group: z.string().trim().min(1, 'El grupo es requerido').default('Grupo A'),
  players: z.array(playerSchema).default([]),
})

export const updateTeamSchema = createTeamSchema.partial()

export type CreateTeamInput = z.infer<typeof createTeamSchema>
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>

export const listTeamsQuerySchema = z.object({
  tournamentId: objectIdSchema.optional(),
  group: z.string().trim().min(1).optional(),
})

export type ListTeamsQuery = z.infer<typeof listTeamsQuerySchema>