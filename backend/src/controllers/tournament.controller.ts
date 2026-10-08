import { Match, Team, Tournament, type MatchDoc } from '../models/index.js'
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
import { getTournamentStats, getTournamentTopScorers } from '../services/stats.service.js'
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
  const tournaments = await Tournament.find(filter).sort({ createdAt: -1 })
  res.json({ data: tournaments })
})

export const getTournament = asyncHandler(async (req, res) => {
  const { id } = req.validData.params as IdParams
  const tournament = assertFound(await Tournament.findById(id), 'Torneo no encontrado')
  const [teamsCount, matchesCount] = await Promise.all([
    Team.countDocuments({ tournamentId: id }),
    Match.countDocuments({ tournamentId: id }),
  ])
  res.json({ data: { ...tournament.toJSON(), teamsCount, matchesCount } })
})

export const createTournament = asyncHandler(async (req, res) => {
  const body = req.validData.body as CreateTournamentInput
  res.status(201).json({ data: await Tournament.create(body) })
})

export const updateTournament = asyncHandler(async (req, res) => {
  const { id } = req.validData.params as IdParams
  const body = req.validData.body as UpdateTournamentInput
  res.json({
    data: assertFound(await Tournament.findByIdAndUpdate(id, body, { new: true }), 'Torneo no encontrado'),
  })
})

export const removeTournament = asyncHandler(async (req, res) => {
  const { id } = req.validData.params as IdParams
  res.json({ data: assertFound(await Tournament.findByIdAndDelete(id), 'Torneo no encontrado') })
})

export const listTournamentTeams = asyncHandler(async (req, res) => {
  const { id } = req.validData.params as IdParams
  const query = req.validData.query as { group?: string } | undefined
  const filter: Record<string, unknown> = { tournamentId: id }
  if (query?.group) filter.group = query.group
  const teams = await Team.find(filter).sort({ group: 1, name: 1 })
  res.json({ data: teams })
})

export const listTournamentMatches = asyncHandler(async (req, res) => {
  const { id } = req.validData.params as IdParams
  const query = (req.validData.query ?? {}) as ListMatchesQuery
  const filter: Record<string, unknown> = { tournamentId: id, fase: 'grupos' }
  if (query.group) filter.group = query.group
  if (query.matchday) filter.matchday = query.matchday

  const matches = await Match.find(filter)
    .populate('homeTeamId awayTeamId', 'name')
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
  res.json({ data: matchdays })
})

export const getTournamentStandings = asyncHandler(async (req, res) => {
  const { id } = req.validData.params as IdParams
  assertFound(await Tournament.findById(id), 'Torneo no encontrado')
  const groups: string[] = await Team.distinct('group', { tournamentId: id })
  groups.sort((a, b) => a.localeCompare(b, 'es'))
  const standings = await Promise.all(groups.map((group) => getGroupStandings(id, group)))
  res.json({ data: standings })
})

export const generatePlayoffsController = asyncHandler(async (req, res) => {
  const { id } = req.validData.params as IdParams
  const body = (req.validData.body ?? {}) as { teamsPerGroup?: number }
  const data = await generatePlayoffs(id, body.teamsPerGroup ?? 2)
  res.status(201).json({ data })
})

export const getPlayoffBracketController = asyncHandler(async (req, res) => {
  const { id } = req.validData.params as IdParams
  res.json({ data: await getPlayoffBracket(id) })
})

export const getTournamentStatsController = asyncHandler(async (req, res) => {
  const { id } = req.validData.params as IdParams
  assertFound(await Tournament.findById(id), 'Torneo no encontrado')
  res.json({ data: await getTournamentStats(id) })
})

export const getTopScorersController = asyncHandler(async (req, res) => {
  const { id } = req.validData.params as IdParams
  assertFound(await Tournament.findById(id), 'Torneo no encontrado')
  res.json({ data: await getTournamentTopScorers(id) })
})

export const createRegistrationController = asyncHandler(async (req, res) => {
  const { id } = req.validData.params as IdParams
  const body = req.validData.body as CreateRegistrationInput
  res.status(201).json({ data: await createRegistration(id, body) })
})

export const listRegistrationsController = asyncHandler(async (req, res) => {
  const { id } = req.validData.params as IdParams
  const query = (req.validData.query ?? {}) as ListRegistrationsQuery
  res.json({ data: await listRegistrations(id, query.status) })
})

export const approveRegistrationController = asyncHandler(async (req, res) => {
  const { id, registrationId } = req.validData.params as RegistrationParams
  const body = req.validData.body as ApproveRegistrationInput
  res.json({ data: await approveRegistration(id, registrationId, body) })
})

export const rejectRegistrationController = asyncHandler(async (req, res) => {
  const { id, registrationId } = req.validData.params as RegistrationParams
  res.json({ data: await rejectRegistration(id, registrationId) })
})