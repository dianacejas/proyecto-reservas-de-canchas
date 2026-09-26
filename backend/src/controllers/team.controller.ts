import { Team } from '../models/index.js'
import type { CreateTeamInput, IdParams, ListTeamsQuery, UpdateTeamInput } from '../schemas/index.js'
import { assertFound } from '../utils/assertFound.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const listTeams = asyncHandler(async (req, res) => {
  const query = (req.validData.query ?? {}) as ListTeamsQuery
  const filter: Record<string, unknown> = {}
  if (query.tournamentId) filter.tournamentId = query.tournamentId
  if (query.group) filter.group = query.group
  const teams = await Team.find(filter).sort({ group: 1, name: 1 })
  res.json({ data: teams })
})

export const getTeam = asyncHandler(async (req, res) => {
  const { id } = req.validData.params as IdParams
  res.json({
    data: assertFound(await Team.findById(id).populate('tournamentId', 'name'), 'Equipo no encontrado'),
  })
})

export const createTeam = asyncHandler(async (req, res) => {
  const body = req.validData.body as CreateTeamInput
  res.status(201).json({ data: await Team.create(body) })
})

export const updateTeam = asyncHandler(async (req, res) => {
  const { id } = req.validData.params as IdParams
  const body = req.validData.body as UpdateTeamInput
  res.json({
    data: assertFound(await Team.findByIdAndUpdate(id, body, { new: true }), 'Equipo no encontrado'),
  })
})

export const removeTeam = asyncHandler(async (req, res) => {
  const { id } = req.validData.params as IdParams
  res.json({ data: assertFound(await Team.findByIdAndDelete(id), 'Equipo no encontrado') })
})