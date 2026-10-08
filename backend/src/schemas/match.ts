import { z, type RefinementCtx } from 'zod'
import { objectIdSchema, timeSchema } from './common.js'

export const matchStatusSchema = z.enum(['programado', 'finalizado'])
export const matchFaseSchema = z.enum(['grupos', 'octavos', 'cuartos', 'semifinal', 'final'])
export const matchEventTypeSchema = z.enum(['goal', 'yellow_card', 'red_card'])

export const matchEventSchema = z.object({
  type: matchEventTypeSchema,
  playerName: z.string().trim().min(1, 'El nombre del jugador es requerido'),
  teamId: objectIdSchema,
  minute: z.number().int().min(0).max(200).nullable().optional(),
})

const eventsField = {
  events: z.array(matchEventSchema).default([]),
}

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
  fase: matchFaseSchema,
  homeTeamId: objectIdSchema.nullable(),
  awayTeamId: objectIdSchema.nullable(),
  homeGoals: z.number().int().min(0).nullable(),
  awayGoals: z.number().int().min(0).nullable(),
  homePenalties: z.number().int().min(0).nullable(),
  awayPenalties: z.number().int().min(0).nullable(),
  status: matchStatusSchema,
  bookingId: objectIdSchema.nullable(),
  nextMatchId: objectIdSchema.nullable(),
}

const schedulingFields = {
  fieldId: objectIdSchema.optional(),
  date: z.coerce.date().optional(),
  startTime: timeSchema.optional(),
  endTime: timeSchema.optional(),
}

function validateDistinctTeams(
  m: { homeTeamId?: string | null; awayTeamId?: string | null },
  ctx: RefinementCtx
): void {
  if (
    m.homeTeamId !== undefined &&
    m.homeTeamId !== null &&
    m.awayTeamId !== undefined &&
    m.awayTeamId !== null &&
    m.homeTeamId === m.awayTeamId
  ) {
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
  .object({ ...matchFields, ...schedulingFields, ...eventsField })
  .superRefine(validateDistinctTeams)
  .superRefine(validateSchedule)

export const updateMatchSchema = z
  .object({ ...matchFields, ...schedulingFields, ...eventsField })
  .partial()
  .superRefine(validateDistinctTeams)
  .superRefine(validateSchedule)

export const updateMatchScoreSchema = z
  .object({
    homeGoals: z.number().int().min(0),
    awayGoals: z.number().int().min(0),
    homePenalties: z.number().int().min(0).optional(),
    awayPenalties: z.number().int().min(0).optional(),
  })
  .superRefine((score, ctx) => {
    if (score.homeGoals === score.awayGoals) {
      const homeMissing = score.homePenalties === undefined
      const awayMissing = score.awayPenalties === undefined
      if (homeMissing !== awayMissing || homeMissing) {
        ctx.addIssue({
          code: 'custom',
          message: 'Debe indicar los penales de ambos equipos cuando el partido termina empatado',
          path: ['homePenalties'],
        })
      }
    }
  })

export const listMatchesQuerySchema = z.object({
  tournamentId: objectIdSchema.optional(),
  group: z.string().trim().min(1).optional(),
  matchday: z.coerce.number().int().min(1).optional(),
  fase: matchFaseSchema.optional(),
})

export type CreateMatchInput = z.infer<typeof createMatchSchema>
export type UpdateMatchInput = z.infer<typeof updateMatchSchema>
export type UpdateMatchScoreInput = z.infer<typeof updateMatchScoreSchema>
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