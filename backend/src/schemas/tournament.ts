import { z } from 'zod'

export const tournamentStatusSchema = z.enum(['inscripcion', 'en_curso', 'finalizado'])

export const createTournamentSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es requerido'),
  status: tournamentStatusSchema.default('inscripcion'),
})

export const updateTournamentSchema = createTournamentSchema.partial()

export type CreateTournamentInput = z.infer<typeof createTournamentSchema>
export type UpdateTournamentInput = z.infer<typeof updateTournamentSchema>

export const listTournamentsQuerySchema = z.object({
  status: tournamentStatusSchema.optional(),
})

export type ListTournamentsQuery = z.infer<typeof listTournamentsQuerySchema>