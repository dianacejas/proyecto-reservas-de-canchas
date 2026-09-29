import { Match } from '../models/index.js'
import type {
  CreateMatchInput,
  IdParams,
  ListMatchesQuery,
  UpdateMatchInput,
  UpdateMatchScoreInput,
} from '../schemas/index.js'
import { createMatch, deleteMatchById, updateMatchById } from '../services/match.service.js'
import { assertFound } from '../utils/assertFound.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const listMatches = asyncHandler(async (req, res) => {
  const query = (req.validData.query ?? {}) as ListMatchesQuery
  const filter: Record<string, unknown> = {}
  if (query.tournamentId) filter.tournamentId = query.tournamentId
  if (query.group) filter.group = query.group
  if (query.matchday) filter.matchday = query.matchday
  if (query.fase) filter.fase = query.fase

  const matches = await Match.find(filter)
    .populate('homeTeamId awayTeamId', 'name')
    .populate({
      path: 'bookingId',
      select: 'fieldId date startTime endTime status type',
      populate: { path: 'fieldId', select: 'name type' },
    })
    .sort({ matchday: 1, group: 1 })
  res.json({ data: matches })
})

export const getMatch = asyncHandler(async (req, res) => {
  const { id } = req.validData.params as IdParams
  res.json({
    data: assertFound(
      await Match.findById(id).populate('homeTeamId awayTeamId', 'name'),
      'Partido no encontrado'
    ),
  })
})

export const createMatchController = asyncHandler(async (req, res) => {
  const body = req.validData.body as CreateMatchInput
  res.status(201).json({ data: await createMatch(body) })
})

export const updateMatch = asyncHandler(async (req, res) => {
  const { id } = req.validData.params as IdParams
  const body = req.validData.body as UpdateMatchInput
  res.json({ data: await updateMatchById(id, body) })
})

export const updateMatchScore = asyncHandler(async (req, res) => {
  const { id } = req.validData.params as IdParams
  const body = req.validData.body as UpdateMatchScoreInput
  const input: UpdateMatchInput = {
    homeGoals: body.homeGoals,
    awayGoals: body.awayGoals,
    homePenalties: body.homePenalties ?? null,
    awayPenalties: body.awayPenalties ?? null,
  }
  res.json({ data: await updateMatchById(id, input) })
})

export const removeMatch = asyncHandler(async (req, res) => {
  const { id } = req.validData.params as IdParams
  res.json({ data: await deleteMatchById(id) })
})