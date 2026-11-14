import { Types } from 'mongoose'
import { Match, Team } from '../models/index.js'

export const YELLOW_SUSPENSION_LIMIT = 3

export interface TopScorerRow {
  rank: number
  playerName: string
  teamId: string
  teamName: string
  goalsCount: number
}

export interface ScorerRow {
  position: number
  playerName: string
  teamId: string
  teamName: string
  goals: number
}

export interface SanctionRow {
  playerName: string
  teamId: string
  teamName: string
  yellowCards: number
  redCards: number
  suspended: boolean
  reason: string
}

export interface TournamentStats {
  scorers: ScorerRow[]
  sanctions: SanctionRow[]
}

interface Accumulator {
  playerName: string
  teamId: string
  goals: number
  yellowCards: number
  redCards: number
}

export async function getTournamentStats(tournamentId: string): Promise<TournamentStats> {
  const [matches, teams] = await Promise.all([
    Match.find({ tournamentId }).select('events'),
    Team.find({ tournamentId }).select('name'),
  ])

  const teamNames = new Map(teams.map((team) => [team._id.toString(), team.name]))
  const byPlayer = new Map<string, Accumulator>()

  for (const match of matches) {
    for (const event of match.events ?? []) {
      const teamId = event.teamId.toString()
      const key = `${event.playerName.toLocaleLowerCase('es')}|${teamId}`
      const entry: Accumulator =
        byPlayer.get(key) ??
        { playerName: event.playerName, teamId, goals: 0, yellowCards: 0, redCards: 0 }

      if (event.type === 'goal') entry.goals += 1
      else if (event.type === 'yellow_card') entry.yellowCards += 1
      else if (event.type === 'red_card') entry.redCards += 1

      byPlayer.set(key, entry)
    }
  }

  const entries = [...byPlayer.values()]

  const scorers: ScorerRow[] = entries
    .filter((entry) => entry.goals > 0)
    .sort((a, b) => b.goals - a.goals || a.playerName.localeCompare(b.playerName, 'es'))
    .slice(0, 10)
    .map((entry, index) => ({
      position: index + 1,
      playerName: entry.playerName,
      teamId: entry.teamId,
      teamName: teamNames.get(entry.teamId) ?? 'Equipo',
      goals: entry.goals,
    }))

  const sanctions: SanctionRow[] = entries
    .filter((entry) => entry.yellowCards > 0 || entry.redCards > 0)
    .sort(
      (a, b) =>
        b.redCards - a.redCards ||
        b.yellowCards - a.yellowCards ||
        a.playerName.localeCompare(b.playerName, 'es')
    )
    .map((entry) => {
      const suspended =
        entry.redCards > 0 || entry.yellowCards >= YELLOW_SUSPENSION_LIMIT
      return {
        playerName: entry.playerName,
        teamId: entry.teamId,
        teamName: teamNames.get(entry.teamId) ?? 'Equipo',
        yellowCards: entry.yellowCards,
        redCards: entry.redCards,
        suspended,
        reason:
          entry.redCards > 0
            ? 'Expulsión por tarjeta roja'
            : `Acumulación de ${entry.yellowCards} amarillas`,
      }
    })

  return { scorers, sanctions }
}

interface TopScorerAggregation {
  playerName: string
  teamId: Types.ObjectId
  teamName: string | null
  goalsCount: number
}

export async function getTournamentTopScorers(tournamentId: string): Promise<TopScorerRow[]> {
  const rows = await Match.aggregate<TopScorerAggregation>([
    { $match: { tournamentId: new Types.ObjectId(tournamentId), status: 'finalizado' } },
    { $unwind: '$events' },
    { $match: { 'events.type': 'goal' } },
    {
      $group: {
        _id: { player: { $toLower: '$events.playerName' }, team: '$events.teamId' },
        playerName: { $first: '$events.playerName' },
        teamId: { $first: '$events.teamId' },
        goalsCount: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'teams',
        localField: 'teamId',
        foreignField: '_id',
        as: 'team',
      },
    },
    { $unwind: { path: '$team', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        playerName: 1,
        teamId: 1,
        teamName: { $ifNull: ['$team.name', 'Equipo'] },
        goalsCount: 1,
      },
    },
    { $sort: { goalsCount: -1, playerName: 1 } },
  ])

  return rows.map((row, index) => ({
    rank: index + 1,
    playerName: row.playerName,
    teamId: row.teamId.toString(),
    teamName: row.teamName ?? 'Equipo',
    goalsCount: row.goalsCount,
  }))
}

export interface PlayerStatsResult {
  playerName: string
  teamId: string
  teamName: string
  matchesPlayed: number
  goalsCount: number
  yellowCards: number
  redCards: number
  rank: number | null
}

export async function getPlayerStats(
  tournamentId: string,
  playerIdentifier: string
): Promise<PlayerStatsResult> {
  const tId = new Types.ObjectId(tournamentId)
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(playerIdentifier)

  // 1. Buscar el equipo y jugador correspondiente
  let team = isObjectId
    ? await Team.findOne({ tournamentId: tId, 'players._id': new Types.ObjectId(playerIdentifier) })
    : null

  let resolvedPlayerName = ''

  if (team && isObjectId) {
    const p = (team.players as Array<{ _id?: Types.ObjectId; name: string; number: number }>).find(
      (item) => item._id?.toString() === playerIdentifier
    )
    if (p) {
      resolvedPlayerName = p.name
    }
  }

  if (!resolvedPlayerName) {
    // Si no vino por _id, buscamos por nombre exacto/case-insensitive en los equipos del torneo
    const decodedName = decodeURIComponent(playerIdentifier).trim()
    const foundTeam = await Team.findOne({
      tournamentId: tId,
      'players.name': { $regex: new RegExp(`^${decodedName}$`, 'i') },
    })

    if (foundTeam) {
      team = foundTeam
      const p = (foundTeam.players as Array<{ name: string; number: number }>).find(
        (item) => item.name.toLowerCase() === decodedName.toLowerCase()
      )
      resolvedPlayerName = p ? p.name : decodedName
    } else {
      resolvedPlayerName = decodedName
    }
  }

  // Si aún no encontramos equipo en el plantel, buscamos en los eventos de partidos
  if (!team) {
    const matchWithEvent = await Match.findOne({
      tournamentId: tId,
      'events.playerName': { $regex: new RegExp(`^${resolvedPlayerName}$`, 'i') },
    })
    if (matchWithEvent) {
      const ev = matchWithEvent.events.find(
        (e) => e.playerName.toLowerCase() === resolvedPlayerName.toLowerCase()
      )
      if (ev) {
        team = await Team.findById(ev.teamId)
      }
    }
  }

  const teamIdStr = team?._id.toString() ?? ''
  const teamNameStr = team?.name ?? 'Sin equipo'

  // 2. Partidos disputados (partidos del equipo finalizados o donde participó en eventos)
  let matchesPlayed = 0
  if (team) {
    matchesPlayed = await Match.countDocuments({
      tournamentId: tId,
      status: 'finalizado',
      $or: [{ homeTeamId: team._id }, { awayTeamId: team._id }],
    })
  } else {
    matchesPlayed = await Match.countDocuments({
      tournamentId: tId,
      status: 'finalizado',
      'events.playerName': { $regex: new RegExp(`^${resolvedPlayerName}$`, 'i') },
    })
  }

  // 3. Eventos acumulados de este jugador en el torneo
  const matches = await Match.find({
    tournamentId: tId,
    status: 'finalizado',
    'events.playerName': { $regex: new RegExp(`^${resolvedPlayerName}$`, 'i') },
  }).select('events')

  let goalsCount = 0
  let yellowCards = 0
  let redCards = 0

  for (const match of matches) {
    for (const ev of match.events) {
      if (ev.playerName.toLowerCase() === resolvedPlayerName.toLowerCase()) {
        if (ev.type === 'goal') goalsCount++
        else if (ev.type === 'yellow_card') yellowCards++
        else if (ev.type === 'red_card') redCards++
      }
    }
  }

  // 4. Posición / Ranking en la tabla de goleadores
  const topScorers = await getTournamentTopScorers(tournamentId)
  const rankingEntry = topScorers.find(
    (s) => s.playerName.toLowerCase() === resolvedPlayerName.toLowerCase()
  )

  return {
    playerName: resolvedPlayerName,
    teamId: teamIdStr,
    teamName: teamNameStr,
    matchesPlayed,
    goalsCount,
    yellowCards,
    redCards,
    rank: rankingEntry ? rankingEntry.rank : null,
  }
}
