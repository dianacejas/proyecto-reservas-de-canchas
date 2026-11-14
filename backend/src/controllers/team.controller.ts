import { Booking, Match, Team } from '../models/index.js'
import type { CreateTeamInput, IdParams, ListTeamsQuery, UpdateTeamInput } from '../schemas/index.js'
import { assertFound } from '../utils/assertFound.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const listTeams = asyncHandler(async (req, res) => {
  const query = (req.validData.query ?? {}) as ListTeamsQuery
  const filter: Record<string, unknown> = {}
  if (query.tournamentId) filter.tournamentId = query.tournamentId
  if (query.group) filter.group = query.group
  const teams = await Team.find(filter).sort({ group: 1, name: 1 }).lean()
  res.json({ success: true, data: teams.map(t => ({ ...t, id: t._id.toString() })) })
})

export const getTeam = asyncHandler(async (req, res) => {
  const { id } = req.validData.params as IdParams
  const team = assertFound(await Team.findById(id).populate('tournamentId', 'name').lean(), 'Equipo no encontrado')
  res.json({
    success: true,
    data: { ...team, id: team._id.toString() },
  })
})

export const createTeam = asyncHandler(async (req, res) => {
  const body = req.validData.body as CreateTeamInput
  res.status(201).json({ success: true, data: await Team.create(body) })
})

export const updateTeam = asyncHandler(async (req, res) => {
  const { id } = req.validData.params as IdParams
  const body = req.validData.body as UpdateTeamInput
  res.json({
    success: true,
    data: assertFound(await Team.findByIdAndUpdate(id, body, { new: true }), 'Equipo no encontrado'),
  })
})

export const removeTeam = asyncHandler(async (req, res) => {
  const { id } = req.validData.params as IdParams
  const team = assertFound(await Team.findByIdAndDelete(id), 'Equipo no encontrado')

  // Liberar reservas de cancha de partidos programados donde participaba este equipo
  const pendingMatches = await Match.find({
    status: 'programado',
    $or: [{ homeTeamId: id }, { awayTeamId: id }],
    bookingId: { $ne: null },
  })
    .select('bookingId')
    .lean()

  const bookingIds = pendingMatches
    .map((m) => m.bookingId)
    .filter((bid): bid is NonNullable<typeof bid> => Boolean(bid))

  if (bookingIds.length > 0) {
    await Booking.deleteMany({ _id: { $in: bookingIds } })
  }

  // Desvincular de partidos existentes marcando vacante/BYE para no romper consultas
  await Promise.all([
    Match.updateMany(
      { homeTeamId: id },
      { $set: { homeTeamId: null, ...(bookingIds.length > 0 ? { bookingId: null } : {}) } }
    ),
    Match.updateMany(
      { awayTeamId: id },
      { $set: { awayTeamId: null, ...(bookingIds.length > 0 ? { bookingId: null } : {}) } }
    ),
  ])

  res.json({ success: true, data: team })
})