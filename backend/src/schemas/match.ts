import { z, type RefinementCtx } from 'zod'
import { objectIdSchema, timeSchema } from './common.js'

export const matchStatusSchema = z.enum(['programado', 'finalizado'])

export interface MatchSchedule {
  fieldId: string
  date: Date
  startTime: string
  endTime: string
}

const matchFields = {
  tournamentId: objectIdSchema,
  group: z.string().trim().min(1, 'El grupo es requerido'),
  matchday: z.number().int().min(1, 'La jornada debe ser mayor o igual a 1'),
  homeTeamId: objectIdSchema,
  awayTeamId: objectIdSchema,
  homeGoals: z.number().int().min(0).nullable().default(null),
  awayGoals: z.number().int().min(0).nullable().default(null),
  status: matchStatusSchema.default('programado'),
  bookingId: objectIdSchema.nullable().default(null),
}

const schedulingFields = {
  fieldId: objectIdSchema.optional(),
  date: z.coerce.date().optional(),
  startTime: timeSchema.optional(),
  endTime: timeSchema.optional(),
}

function validateDistinctTeams(m: { homeTeamId?: string; awayTeamId?: string }, ctx: RefinementCtx): void {
  if (m.homeTeamId !== undefined && m.awayTeamId !== undefined && m.homeTeamId === m.awayTeamId) {
    ctx.addIssue({
      code: 'custom',
      message: 'El equipo local y visitante deben ser distintos',
      path: ['awayTeamId'],
    })
  }
}

function validateSchedule(m: Partial<MatchSchedule>, ctx: RefinementCtx): void {
  const presentCount = [m.fieldId, m.date, m.startTime, m.endTime].filter((v) => v !== undefined).length
  if (presentCount !== 0 && presentCount !== 4) {
    ctx.addIssue({
      code: 'custom',
      message: 'Debe indicar cancha, fecha y horario completos para agendar el partido',
      path: ['fieldId'],
    })
  }
  if (m.startTime !== undefined && m.endTime !== undefined && m.endTime <= m.startTime) {
    ctx.addIssue({
      code: 'custom',
      message: 'La hora de fin debe ser posterior a la de inicio',
      path: ['endTime'],
    })
  }
}

export const createMatchSchema = z
  .object({ ...matchFields, ...schedulingFields })
  .superRefine(validateDistinctTeams)
  .superRefine(validateSchedule)

export const updateMatchSchema = z
  .object({ ...matchFields, ...schedulingFields })
  .partial()
  .superRefine(validateDistinctTeams)
  .superRefine(validateSchedule)

export const listMatchesQuerySchema = z.object({
  tournamentId: objectIdSchema.optional(),
  group: z.string().trim().min(1).optional(),
  matchday: z.coerce.number().int().min(1).optional(),
})

export type CreateMatchInput = z.infer<typeof createMatchSchema>
export type UpdateMatchInput = z.infer<typeof updateMatchSchema>
export type ListMatchesQuery = z.infer<typeof listMatchesQuerySchema>

export function hasSchedule(m: unknown): m is MatchSchedule {
  const record = m as Partial<MatchSchedule>
  return (
    record.fieldId !== undefined &&
    record.date !== undefined &&
    record.startTime !== undefined &&
    record.endTime !== undefined
  )
}