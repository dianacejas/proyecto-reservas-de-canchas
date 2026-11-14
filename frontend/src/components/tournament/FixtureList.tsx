import { Chip } from '@heroui/react'
import { useState } from 'react'
import type { Match, Matchday, TeamRef } from '../../types'
import { bookingDay, formatLong } from '../../utils/date'
import MatchTimelineModal from './MatchTimelineModal'
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
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)

  if (matchdays.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-mauve-soft">
        Todavía no hay partidos en el fixture.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      {matchdays.map((matchday) => (
        <section key={matchday.matchday}>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-mauve-soft">
            Jornada {matchday.matchday}
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {matchday.matches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                onSelect={() => setSelectedMatch(match)}
              />
            ))}
          </div>
        </section>
      ))}

      <MatchTimelineModal
        match={selectedMatch}
        isOpen={selectedMatch !== null}
        onClose={() => setSelectedMatch(null)}
      />
    </div>
  )
}

function MatchCard({
  match,
  onSelect,
}: {
  match: Match
  onSelect: () => void
}): React.JSX.Element {
  const finished = match.status === 'finalizado'
  const homeLabel = teamName(match.homeTeamId)
  const awayLabel = teamName(match.awayTeamId)
  const field = fieldName(match)

  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full rounded-xl border border-mauve bg-coffee-elev p-3 text-left shadow-surface transition-colors hover:border-[#c5d86d]/50 sm:p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
        <span className="text-xs font-medium uppercase tracking-wide text-mauve-soft">
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
          <span className="min-w-0 truncate text-xs font-semibold sm:text-sm md:text-base text-[#f3efe8]/90">
            {homeLabel}
          </span>
          {hasTeam(match.homeTeamId) && <TeamCrest name={homeLabel} size="sm" />}
        </div>

        <div className="flex min-w-[56px] flex-col items-center justify-center px-1 sm:min-w-[70px] sm:px-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider sm:text-[11px] text-mauve-soft/70">
            vs
          </span>
          <span className="text-base font-extrabold tracking-widest sm:text-lg md:text-xl text-lime">
            {finished ? `${match.homeGoals} – ${match.awayGoals}` : '-'}
          </span>
        </div>

        <div className="flex min-w-0 items-center justify-start gap-1.5 text-left sm:gap-2">
          {hasTeam(match.awayTeamId) && <TeamCrest name={awayLabel} size="sm" />}
          <span className="min-w-0 truncate text-xs font-semibold sm:text-sm md:text-base text-[#f3efe8]/90">
            {awayLabel}
          </span>
        </div>
      </div>

      <div className="mt-3 border-t pt-3 text-xs border-mauve/60 text-mauve-soft">
        <p className="capitalize">{scheduleLine(match)}</p>
        {field.length > 0 && <p>{field}</p>}
      </div>
    </button>
  )
}
