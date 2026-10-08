import { Match, Team } from '../models/index.js'

export const YELLOW_SUSPENSION_LIMIT = 3

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
