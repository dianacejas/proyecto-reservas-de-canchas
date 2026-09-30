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
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
    <div className="rounded-xl border border-line bg-cream p-3 shadow-surface transition-colors hover:border-mauve/50 sm:p-4 dark:border-mauve dark:bg-coffee-elev">
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
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

      <div className="mt-2 grid w-full grid-cols-[1fr_auto_1fr] items-center gap-2 py-2 sm:gap-3">
        <div className="flex min-w-0 items-center justify-end gap-1.5 text-right sm:gap-2">
          <span className="min-w-0 truncate text-xs font-semibold text-coffee sm:text-sm md:text-base dark:text-[#f3efe8]/90">
            {homeLabel}
          </span>
          {hasTeam(match.homeTeamId) && <TeamCrest name={homeLabel} size="sm" />}
        </div>

        <div className="flex min-w-[56px] flex-col items-center justify-center px-1 sm:min-w-[70px] sm:px-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-tertiary/70 sm:text-[11px] dark:text-mauve-soft/70">
            vs
          </span>
          <span className="text-base font-extrabold tracking-widest text-[#4d5a1e] sm:text-lg md:text-xl dark:text-lime">
            {finished ? `${match.homeGoals} – ${match.awayGoals}` : '-'}
          </span>
        </div>

        <div className="flex min-w-0 items-center justify-start gap-1.5 text-left sm:gap-2">
          {hasTeam(match.awayTeamId) && <TeamCrest name={awayLabel} size="sm" />}
          <span className="min-w-0 truncate text-xs font-semibold text-coffee sm:text-sm md:text-base dark:text-[#f3efe8]/90">
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
