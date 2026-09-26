import { Match, Team } from '../models/index.js'

export interface StandingRow {
  position: number
  teamId: string
  teamName: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
}

export interface GroupStandings {
  group: string
  rows: StandingRow[]
}

interface TeamStats {
  name: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  points: number
}

export async function getGroupStandings(
  tournamentId: string,
  group: string
): Promise<GroupStandings> {
  const [teams, matches] = await Promise.all([
    Team.find({ tournamentId, group }),
    Match.find({ tournamentId, group, status: 'finalizado' }),
  ])

  const stats = new Map<string, TeamStats>()
  for (const team of teams) {
    stats.set(team._id.toString(), {
      name: team.name,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0,
    })
  }

  for (const match of matches) {
    const homeKey = match.homeTeamId.toString()
    const awayKey = match.awayTeamId.toString()
    const home = stats.get(homeKey)
    const away = stats.get(awayKey)
    if (!home || !away) continue

    home.played += 1
    away.played += 1
    home.goalsFor += match.homeGoals ?? 0
    home.goalsAgainst += match.awayGoals ?? 0
    away.goalsFor += match.awayGoals ?? 0
    away.goalsAgainst += match.homeGoals ?? 0

    if ((match.homeGoals ?? 0) > (match.awayGoals ?? 0)) {
      home.won += 1
      home.points += 3
      away.lost += 1
    } else if ((match.homeGoals ?? 0) < (match.awayGoals ?? 0)) {
      away.won += 1
      away.points += 3
      home.lost += 1
    } else {
      home.drawn += 1
      away.drawn += 1
      home.points += 1
      away.points += 1
    }
  }

  const rows: StandingRow[] = [...stats.entries()]
    .sort(
      ([aKey, a], [bKey, b]) =>
        b.points - a.points ||
        (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst) ||
        b.goalsFor - a.goalsFor ||
        aKey.localeCompare(bKey)
    )
    .map(([teamId, s], index) => ({
      position: index + 1,
      teamId,
      teamName: s.name,
      played: s.played,
      won: s.won,
      drawn: s.drawn,
      lost: s.lost,
      goalsFor: s.goalsFor,
      goalsAgainst: s.goalsAgainst,
      goalDifference: s.goalsFor - s.goalsAgainst,
      points: s.points,
    }))

  return { group, rows }
}