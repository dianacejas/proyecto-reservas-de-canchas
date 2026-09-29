import { Match, Team, Tournament } from '../models/index.js'
import { AppError } from '../utils/AppError.js'
import { assertFound } from '../utils/assertFound.js'
import { getGroupStandings } from './standings.service.js'

export type PlayoffFase = 'octavos' | 'cuartos' | 'semifinal' | 'final'

export const PLAYOFF_FASE_LABELS: Record<PlayoffFase, string> = {
  octavos: 'Octavos de final',
  cuartos: 'Cuartos de final',
  semifinal: 'Semifinales',
  final: 'Final',
}

const FASE_ORDER: PlayoffFase[] = ['octavos', 'cuartos', 'semifinal', 'final']

export interface PlayoffQualifier {
  teamId: string
  name: string
  position: number
  group: string
}

export interface TeamRefData {
  id: string
  name: string
}

export interface PlayoffMatchData {
  id: string
  matchday: number
  group: string
  fase: PlayoffFase
  homeTeamId: TeamRefData | null
  awayTeamId: TeamRefData | null
  homeGoals: number | null
  awayGoals: number | null
  homePenalties: number | null
  awayPenalties: number | null
  status: 'programado' | 'finalizado'
  nextMatchId: string | null
}

export interface PlayoffRoundData {
  fase: PlayoffFase
  label: string
  matches: PlayoffMatchData[]
}

export interface PlayoffBracketData {
  rounds: PlayoffRoundData[]
  champion: { teamId: string; teamName: string } | null
}

function roundFases(qualifierCount: number): PlayoffFase[] {
  const rounds = Math.round(Math.log2(qualifierCount))
  if (rounds < 1 || 2 ** rounds !== qualifierCount) {
    throw new AppError(400, 'La cantidad de clasificados debe ser una potencia de 2')
  }
  return FASE_ORDER.slice(FASE_ORDER.length - rounds)
}

async function collectQualifiers(
  tournamentId: string,
  teamsPerGroup: number
): Promise<PlayoffQualifier[]> {
  const groups = await Team.distinct('group', { tournamentId })
  groups.sort((a, b) => a.localeCompare(b, 'es'))
  if (groups.length < 1) {
    throw new AppError(400, 'El torneo no tiene equipos para generar la fase final')
  }

  const standings = await Promise.all(groups.map((group) => getGroupStandings(tournamentId, group)))
  const qualifiers: PlayoffQualifier[] = []
  for (const group of standings) {
    const slots = group.rows.slice(0, teamsPerGroup)
    if (slots.length < teamsPerGroup) {
      throw new AppError(400, `El grupo ${group.group} no tiene suficientes equipos clasificados`)
    }
    for (const row of slots) {
      qualifiers.push({
        teamId: row.teamId,
        name: row.teamName,
        position: row.position,
        group: group.group,
      })
    }
  }

  qualifiers.sort((a, b) => a.position - b.position || a.group.localeCompare(b.group, 'es'))
  return qualifiers
}

export async function generatePlayoffs(
  tournamentId: string,
  teamsPerGroup = 2
): Promise<PlayoffBracketData> {
  assertFound(await Tournament.findById(tournamentId), 'Torneo no encontrado')

  const existing = await Match.countDocuments({ tournamentId, fase: { $ne: 'grupos' } })
  if (existing > 0) {
    throw new AppError(409, 'La fase final ya fue generada para este torneo')
  }

  const qualifiers = await collectQualifiers(tournamentId, teamsPerGroup)
  const count = qualifiers.length
  if (count < 2) {
    throw new AppError(400, 'Se necesitan al menos 2 clasificados para generar la fase final')
  }
  const fases = roundFases(count)
  const totalRounds = fases.length

  const roundMatches: { id: string; nextMatchId: unknown; fase: PlayoffFase }[][] = []

  for (let roundIndex = 0; roundIndex < totalRounds; roundIndex++) {
    const matchesInRound = count / 2 ** (roundIndex + 1)
    const fase = fases[roundIndex]
    const created: { id: string; nextMatchId: unknown; fase: PlayoffFase }[] = []
    for (let index = 0; index < matchesInRound; index++) {
      let homeTeamId: string | null = null
      let awayTeamId: string | null = null
      if (roundIndex === 0) {
        const { home, away } = r1Pairing(qualifiers, index)
        homeTeamId = home
        awayTeamId = away
      }
      const match = await Match.create({
        tournamentId,
        group: PLAYOFF_FASE_LABELS[fase],
        matchday: 100 + roundIndex,
        fase,
        homeTeamId,
        awayTeamId,
        homeGoals: null,
        awayGoals: null,
        homePenalties: null,
        awayPenalties: null,
        status: 'programado',
        bookingId: null,
        nextMatchId: null,
      })
      created.push({ id: match._id.toString(), nextMatchId: match.nextMatchId, fase })
    }
    roundMatches.push(created)
  }

  for (let roundIndex = 0; roundIndex < totalRounds - 1; roundIndex++) {
    const current = roundMatches[roundIndex]
    const nextRound = roundMatches[roundIndex + 1]
    for (let index = 0; index < current.length; index++) {
      const nextMatch = nextRound[Math.floor(index / 2)]
      await Match.updateOne({ _id: current[index].id }, { nextMatchId: nextMatch.id })
    }
  }

  return getPlayoffBracket(tournamentId)
}

function r1Pairing(qualifiers: PlayoffQualifier[], index: number): { home: string; away: string } {
  const total = qualifiers.length
  const first = index
  const second = total - 1 - index
  return { home: qualifiers[first].teamId, away: qualifiers[second].teamId }
}

function toTeamRef(team: unknown): TeamRefData | null {
  if (team === null || team === undefined) return null
  const candidate = team as { _id?: { toString(): string }; id?: string; name?: string }
  const rawId = candidate.id ?? candidate._id
  if (rawId === undefined || candidate.name === undefined) return null
  return { id: String(rawId), name: candidate.name }
}

function toMatchData(match: {
  _id: { toString(): string }
  matchday: number
  group: string
  fase: string
  homeTeamId?: unknown
  awayTeamId?: unknown
  homeGoals?: number | null
  awayGoals?: number | null
  homePenalties?: number | null
  awayPenalties?: number | null
  status: string
  nextMatchId?: unknown
}): PlayoffMatchData {
  const fase = match.fase as PlayoffFase
  const id: string = match._id.toString()
  let nextMatchId: string | null = null
  if (match.nextMatchId !== null && match.nextMatchId !== undefined) {
    const candidate = match.nextMatchId as { toString(): string }
    nextMatchId = candidate.toString()
  }
  return {
    id,
    matchday: match.matchday,
    group: match.group,
    fase,
    homeTeamId: toTeamRef(match.homeTeamId),
    awayTeamId: toTeamRef(match.awayTeamId),
    homeGoals: match.homeGoals ?? null,
    awayGoals: match.awayGoals ?? null,
    homePenalties: match.homePenalties ?? null,
    awayPenalties: match.awayPenalties ?? null,
    status: match.status === 'finalizado' ? 'finalizado' : 'programado',
    nextMatchId,
  }
}

function championOf(rounds: PlayoffRoundData[]): { teamId: string; teamName: string } | null {
  const finalRound = rounds.find((round) => round.fase === 'final')
  if (finalRound === undefined) return null
  const match = finalRound.matches.find((cruce) => cruce.status === 'finalizado')
  if (match === undefined || match.homeTeamId === null || match.awayTeamId === null) return null
  const home = match.homeTeamId
  const away = match.awayTeamId
  const homeGoals = match.homeGoals ?? 0
  const awayGoals = match.awayGoals ?? 0
  if (homeGoals > awayGoals) return { teamId: home.id, teamName: home.name }
  if (awayGoals > homeGoals) return { teamId: away.id, teamName: away.name }
  const homePen = match.homePenalties ?? -1
  const awayPen = match.awayPenalties ?? -1
  if (homePen > awayPen) return { teamId: home.id, teamName: home.name }
  if (awayPen > homePen) return { teamId: away.id, teamName: away.name }
  return null
}

export async function getPlayoffBracket(tournamentId: string): Promise<PlayoffBracketData> {
  const matches = await Match.find({ tournamentId, fase: { $ne: 'grupos' } })
    .populate('homeTeamId awayTeamId', 'name')
    .sort({ matchday: 1, createdAt: 1 })

  const byFase = new Map<PlayoffFase, PlayoffMatchData[]>()
  for (const match of matches) {
    const data = toMatchData(match)
    const list = byFase.get(data.fase) ?? []
    list.push(data)
    byFase.set(data.fase, list)
  }

  const rounds: PlayoffRoundData[] = FASE_ORDER.filter((fase) => byFase.has(fase)).map((fase) => ({
    fase,
    label: PLAYOFF_FASE_LABELS[fase],
    matches: byFase.get(fase) ?? [],
  }))

  return { rounds, champion: championOf(rounds) }
}