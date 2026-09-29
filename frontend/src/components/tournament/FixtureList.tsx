import { Chip } from '@heroui/react'
import type { Match, Matchday, TeamRef } from '../../types'
import { bookingDay, formatLong } from '../../utils/date'
import TeamCrest from './TeamCrest'

function teamName(team: string | TeamRef | undefined | null): string {
  if (team === null || team === undefined) return '—'
  return typeof team === 'object' ? team.name : '—'
}

function hasTeam(team: string | TeamRef | undefined | null): boolean {
  return team !== null && team !== undefined
}

function scheduleLine(match: Match): string {
  const schedule = match.bookingId
  if (schedule === null || schedule === undefined) return 'Sin fecha asignada'
  const day = formatLong(bookingDay(schedule.date))
  return `${day} · ${schedule.startTime}–${schedule.endTime}`
}

function fieldName(match: Match): string {
  const schedule = match.bookingId
  if (schedule === null || schedule === undefined) return ''
  if (schedule.fieldId === null || typeof schedule.fieldId !== 'object') return 'Cancha'
  return schedule.fieldId.name
}

export default function FixtureList({ matchdays }: { matchdays: Matchday[] }): React.JSX.Element {
  if (matchdays.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-tertiary dark:text-mauve-soft">
        Todavía no hay partidos en el fixture.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      {matchdays.map((matchday) => (
        <section key={matchday.matchday}>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-tertiary dark:text-mauve-soft">
            Jornada {matchday.matchday}
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            {matchday.matches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function MatchCard({ match }: { match: Match }): React.JSX.Element {
  const finished = match.status === 'finalizado'
  const homeLabel = teamName(match.homeTeamId)
  const awayLabel = teamName(match.awayTeamId)
  const field = fieldName(match)

  return (
    <div className="rounded-xl border border-line bg-cream p-4 shadow-surface transition-colors hover:border-mauve/50 dark:border-mauve dark:bg-coffee-elev">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-tertiary dark:text-mauve-soft">
          {match.group}
        </span>
        {finished ? (
          <Chip color="success" size="sm">
            Finalizado
          </Chip>
        ) : (
          <Chip color="default" size="sm">
            Programado
          </Chip>
        )}
      </div>

      <div className="mt-3 grid w-full grid-cols-[1fr_auto_1fr] items-center gap-3 py-2">
        <div className="flex min-w-0 items-center justify-end gap-2 text-right">
          <span className="min-w-0 truncate text-sm font-semibold text-coffee dark:text-[#f3efe8]/90 md:text-base">
            {homeLabel}
          </span>
          {hasTeam(match.homeTeamId) && <TeamCrest name={homeLabel} size="sm" />}
        </div>

        <div className="flex min-w-[70px] flex-col items-center justify-center px-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-tertiary/70 dark:text-mauve-soft/70">
            vs
          </span>
          <span className="text-lg font-extrabold tracking-widest text-[#4d5a1e] dark:text-lime md:text-xl">
            {finished ? `${match.homeGoals} – ${match.awayGoals}` : '-'}
          </span>
        </div>

        <div className="flex min-w-0 items-center justify-start gap-2 text-left">
          {hasTeam(match.awayTeamId) && <TeamCrest name={awayLabel} size="sm" />}
          <span className="min-w-0 truncate text-sm font-semibold text-coffee dark:text-[#f3efe8]/90 md:text-base">
            {awayLabel}
          </span>
        </div>
      </div>

      <div className="mt-3 border-t border-line pt-3 text-xs text-tertiary dark:border-mauve/60 dark:text-mauve-soft">
        <p className="capitalize">{scheduleLine(match)}</p>
        {field.length > 0 && <p>{field}</p>}
      </div>
    </div>
  )
}
