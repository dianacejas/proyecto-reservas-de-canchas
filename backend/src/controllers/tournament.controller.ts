import { Booking, Match, Team, Tournament, TournamentRegistration, type MatchDoc } from '../models/index.js'
import type {
  ApproveRegistrationInput,
  CreateRegistrationInput,
  CreateTournamentInput,
  IdParams,
  ListMatchesQuery,
  ListRegistrationsQuery,
  ListTournamentsQuery,
  RegistrationParams,
  UpdateTournamentInput,
} from '../schemas/index.js'
import { getGroupStandings } from '../services/standings.service.js'
import { getPlayerStats, getTournamentStats, getTournamentTopScorers } from '../services/stats.service.js'
import {
  approveRegistration,
  createRegistration,
  listRegistrations,
  rejectRegistration,
} from '../services/registration.service.js'
import { generatePlayoffs, getPlayoffBracket } from '../services/playoffs.service.js'
import { assertFound } from '../utils/assertFound.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const listTournaments = asyncHandler(async (req, res) => {
  const query = (req.validData.query ?? {}) as ListTournamentsQuery
  const filter = query.status ? { status: query.status } : {}
  const tournaments = await Tournament.find(filter).sort({ createdAt: -1 }).lean()
  const data = tournaments.map((t) => ({ ...t, id: t._id.toString() }))
  res.json({ success: true, data })
})

export const getTournament = asyncHandler(async (req, res) => {
  const { id } = req.validData.params as IdParams
  const tournament = assertFound(await Tournament.findById(id), 'Torneo no encontrado')
  const [teamsCount, matchesCount] = await Promise.all([
    Team.countDocuments({ tournamentId: id }),
    Match.countDocuments({ tournamentId: id }),
  ])
  res.json({ success: true, data: { ...tournament.toJSON(), teamsCount, matchesCount } })
})

export const createTournament = asyncHandler(async (req, res) => {
  const body = req.validData.body as CreateTournamentInput
  res.status(201).json({ success: true, data: await Tournament.create(body) })
})

export const updateTournament = asyncHandler(async (req, res) => {
  const { id } = req.validData.params as IdParams
  const body = req.validData.body as UpdateTournamentInput
  res.json({
    success: true,
    data: assertFound(await Tournament.findByIdAndUpdate(id, body, { new: true }), 'Torneo no encontrado'),
  })
})

export const removeTournament = asyncHandler(async (req, res) => {
  const { id } = req.validData.params as IdParams
  const tournament = assertFound(await Tournament.findById(id), 'Torneo no encontrado')

  // Borrado en cascada: reservas asociadas a los partidos del torneo
  const matches = await Match.find({ tournamentId: id }).select('bookingId').lean()
  const bookingIds = matches
    .map((m) => m.bookingId)
    .filter((bid): bid is NonNullable<typeof bid> => Boolean(bid))
  if (bookingIds.length > 0) {
    await Booking.deleteMany({ _id: { $in: bookingIds } })
  }

  // Eliminar partidos, equipos, inscripciones y el propio torneo
  await Promise.all([
    Match.deleteMany({ tournamentId: id }),
    Team.deleteMany({ tournamentId: id }),
    TournamentRegistration.deleteMany({ tournamentId: id }),
    Tournament.findByIdAndDelete(id),
  ])

  res.json({ success: true, data: tournament })
})

export const listTournamentTeams = asyncHandler(async (req, res) => {
  const { id } = req.validData.params as IdParams
  const query = req.validData.query as { group?: string } | undefined
  const filter: Record<string, unknown> = { tournamentId: id }
  if (query?.group) filter.group = query.group
  const teams = await Team.find(filter).sort({ group: 1, name: 1 }).lean()
  const data = teams.map((t) => ({ ...t, id: t._id.toString() }))
  res.json({ success: true, data })
})

export const listTournamentMatches = asyncHandler(async (req, res) => {
  const { id } = req.validData.params as IdParams
  const query = (req.validData.query ?? {}) as ListMatchesQuery
  const filter: Record<string, unknown> = { tournamentId: id, fase: 'grupos' }
  if (query.group) filter.group = query.group
  if (query.matchday) filter.matchday = query.matchday

  const matches = await Match.find(filter)
    .populate('homeTeamId awayTeamId', 'name players')
    .populate({
      path: 'bookingId',
      select: 'fieldId date startTime endTime status type',
      populate: { path: 'fieldId', select: 'name type' },
    })
    .sort({ matchday: 1, group: 1 })

  const byMatchday = new Map<number, MatchDoc[]>()
  for (const match of matches) {
    const list = byMatchday.get(match.matchday) ?? []
    list.push(match)
    byMatchday.set(match.matchday, list)
  }

  const matchdays = [...byMatchday.entries()].map(([matchday, list]) => ({ matchday, matches: list }))
  res.json({ success: true, data: matchdays })
})

export const getTournamentStandings = asyncHandler(async (req, res) => {
  const { id } = req.validData.params as IdParams
  assertFound(await Tournament.findById(id).lean(), 'Torneo no encontrado')
  const groups: string[] = await Team.distinct('group', { tournamentId: id })
  groups.sort((a, b) => a.localeCompare(b, 'es'))
  const standings = await Promise.all(groups.map((group) => getGroupStandings(id, group)))
  res.json({ success: true, data: standings })
})

export const generatePlayoffsController = asyncHandler(async (req, res) => {
  const { id } = req.validData.params as IdParams
  const body = (req.validData.body ?? {}) as { teamsPerGroup?: number }
  const data = await generatePlayoffs(id, body.teamsPerGroup ?? 2)
  res.status(201).json({ success: true, data })
})

export const getPlayoffBracketController = asyncHandler(async (req, res) => {
  const { id } = req.validData.params as IdParams
  res.json({ success: true, data: await getPlayoffBracket(id) })
})

export const getTournamentStatsController = asyncHandler(async (req, res) => {
  const { id } = req.validData.params as IdParams
  assertFound(await Tournament.findById(id).lean(), 'Torneo no encontrado')
  res.json({ success: true, data: await getTournamentStats(id) })
})

export const getTopScorersController = asyncHandler(async (req, res) => {
  const { id } = req.validData.params as IdParams
  assertFound(await Tournament.findById(id).lean(), 'Torneo no encontrado')
  res.json({ success: true, data: await getTournamentTopScorers(id) })
})

export const getPlayerStatsController = asyncHandler(async (req, res) => {
  const { tournamentId, playerId } = req.params as { tournamentId: string; playerId: string }
  assertFound(await Tournament.findById(tournamentId).lean(), 'Torneo no encontrado')
  const stats = await getPlayerStats(tournamentId, playerId)
  res.json({ success: true, data: stats })
})

export const createRegistrationController = asyncHandler(async (req, res) => {
  const { id } = req.validData.params as IdParams
  const body = req.validData.body as CreateRegistrationInput
  res.status(201).json({ success: true, data: await createRegistration(id, body) })
})

export const listRegistrationsController = asyncHandler(async (req, res) => {
  const { id } = req.validData.params as IdParams
  const query = (req.validData.query ?? {}) as ListRegistrationsQuery
  res.json({ success: true, data: await listRegistrations(id, query.status) })
})

export const approveRegistrationController = asyncHandler(async (req, res) => {
  const { id, registrationId } = req.validData.params as RegistrationParams
  const body = req.validData.body as ApproveRegistrationInput
  res.json({ success: true, data: await approveRegistration(id, registrationId, body) })
})

export const rejectRegistrationController = asyncHandler(async (req, res) => {
  const { id, registrationId } = req.validData.params as RegistrationParams
  res.json({ success: true, data: await rejectRegistration(id, registrationId) })
})