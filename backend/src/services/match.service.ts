import { Booking, Match, Team, Tournament, type MatchDoc } from '../models/index.js'
import type { MatchSchedule, UpdateMatchInput } from '../schemas/index.js'
import { hasSchedule } from '../schemas/index.js'
import { AppError } from '../utils/AppError.js'
import { assertFound } from '../utils/assertFound.js'
import { dayStart } from '../utils/time.js'
import { createTournamentBooking, findConflictingBooking } from './booking.service.js'

export interface CreateMatchServiceInput {
  tournamentId: string
  group: string
  matchday: number
  homeTeamId: string
  awayTeamId: string
  homeGoals?: number | null
  awayGoals?: number | null
  fieldId?: string
  date?: Date
  startTime?: string
  endTime?: string
}

export async function getTournamentName(tournamentId: string): Promise<string> {
  const tournament = await Tournament.findById(tournamentId, 'name')
  return tournament?.name ?? 'Reserva de torneo'
}

export async function assertMatchTeams(
  tournamentId: string,
  group: string,
  homeTeamId: string,
  awayTeamId: string
): Promise<void> {
  const teams = await Team.find({ _id: { $in: [homeTeamId, awayTeamId] }, tournamentId })
  if (teams.length !== 2) {
    throw new AppError(400, 'Los equipos del partido deben pertenecer al torneo')
  }
  const misplaced = teams.find((team) => team.group !== group)
  if (misplaced) {
    throw new AppError(400, `El equipo ${misplaced.name} no pertenece al grupo ${group}`)
  }
}

export async function createMatch(body: CreateMatchServiceInput): Promise<MatchDoc> {
  await assertMatchTeams(body.tournamentId, body.group, body.homeTeamId, body.awayTeamId)

  let bookingId: string | null = null
  if (hasSchedule(body)) {
    const tournamentName = await getTournamentName(body.tournamentId)
    const booking = await createTournamentBooking(
      {
        fieldId: body.fieldId,
        date: body.date,
        startTime: body.startTime,
        endTime: body.endTime,
      },
      tournamentName
    )
    bookingId = booking._id.toString()
  }

  const finalized =
    body.homeGoals !== null &&
    body.homeGoals !== undefined &&
    body.awayGoals !== null &&
    body.awayGoals !== undefined

  try {
    return await Match.create({
      tournamentId: body.tournamentId,
      group: body.group,
      matchday: body.matchday,
      homeTeamId: body.homeTeamId,
      awayTeamId: body.awayTeamId,
      homeGoals: body.homeGoals ?? null,
      awayGoals: body.awayGoals ?? null,
      status: finalized ? 'finalizado' : 'programado',
      bookingId,
    })
  } catch (err) {
    if (bookingId !== null) await Booking.deleteOne({ _id: bookingId })
    throw err
  }
}

export async function updateMatchById(id: string, body: UpdateMatchInput): Promise<MatchDoc> {
  const match = assertFound(await Match.findById(id), 'Partido no encontrado')

  if (body.homeTeamId !== undefined || body.awayTeamId !== undefined) {
    await assertMatchTeams(
      body.tournamentId ?? match.tournamentId.toString(),
      body.group ?? match.group,
      body.homeTeamId ?? match.homeTeamId.toString(),
      body.awayTeamId ?? match.awayTeamId.toString()
    )
  }

  const next: UpdateMatchInput = { ...body }
  const scoreProvided = body.homeGoals !== undefined && body.awayGoals !== undefined

  if (scoreProvided) {
    next.homeGoals = body.homeGoals
    next.awayGoals = body.awayGoals
    if (body.homeGoals === null || body.awayGoals === null) {
      throw new AppError(400, 'Debe registrar ambos marcadores para el partido')
    }
  }

  if (next.homeGoals !== undefined && next.awayGoals !== undefined) {
    next.status = 'finalizado'
  }

  if (next.status === 'programado') {
    next.homeGoals = null
    next.awayGoals = null
  }

  if (hasSchedule(body)) {
    const slot: MatchSchedule = {
      fieldId: body.fieldId,
      date: body.date,
      startTime: body.startTime,
      endTime: body.endTime,
    }
    if (match.bookingId) {
      const conflict = await findConflictingBooking(slot, {
        excludeId: match.bookingId.toString(),
      })
      if (conflict) {
        throw new AppError(409, 'El nuevo horario del partido ya se encuentra reservado')
      }
      await Booking.updateOne(
        { _id: match.bookingId },
        { fieldId: slot.fieldId, date: dayStart(slot.date), startTime: slot.startTime, endTime: slot.endTime }
      )
    } else {
      const tournamentName = await getTournamentName(match.tournamentId.toString())
      const booking = await createTournamentBooking(slot, tournamentName)
      next.bookingId = booking._id.toString()
    }
  }

  return assertFound(
    await Match.findByIdAndUpdate(id, next, { new: true }),
    'Partido no encontrado'
  )
}

export async function deleteMatchById(id: string): Promise<MatchDoc> {
  const match = assertFound(await Match.findById(id), 'Partido no encontrado')
  if (match.bookingId) {
    await Booking.deleteOne({ _id: match.bookingId })
  }
  await match.deleteOne()
  return match
}