import type { GroupStandings, Match, Matchday, TeamRef } from '../types'

function teamLabel(team: string | TeamRef | null | undefined): string {
  if (team === null || team === undefined) return 'A definir'
  return typeof team === 'object' ? team.name : 'A definir'
}

export function buildStandingsText(tournamentName: string, groups: GroupStandings[]): string {
  const lines = [`⚽ *${tournamentName}*`, '📊 Tabla de posiciones', '']
  for (const group of groups) {
    lines.push(`*${group.group}*`)
    for (const row of group.rows) {
      const diff = row.goalDifference >= 0 ? `+${row.goalDifference}` : `${row.goalDifference}`
      lines.push(`${row.position}. ${row.teamName} — ${row.points} pts (PJ ${row.played} · DG ${diff})`)
    }
    lines.push('')
  }
  return lines.join('\n').trim()
}

export function buildFixtureText(tournamentName: string, matchdays: Matchday[]): string {
  const lines = [`⚽ *${tournamentName}*`, '🗓️ Fixture', '']
  for (const matchday of matchdays) {
    lines.push(`*Jornada ${matchday.matchday}*`)
    for (const match of matchday.matches) {
      lines.push(`• ${formatMatch(match)}`)
    }
    lines.push('')
  }
  return lines.join('\n').trim()
}

function formatMatch(match: Match): string {
  const label = `${teamLabel(match.homeTeamId)} vs ${teamLabel(match.awayTeamId)}`
  if (match.status === 'finalizado') {
    return `${label}  ${match.homeGoals ?? 0}–${match.awayGoals ?? 0}`
  }
  return label
}

export function downloadTextFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

export function slugify(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase('es-AR')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
