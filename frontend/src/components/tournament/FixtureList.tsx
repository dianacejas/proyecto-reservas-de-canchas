import { Chip } from '@heroui/react'
import type { Match, Matchday, TeamRef } from '../../types'
import { bookingDay, formatLong } from '../../utils/date'

function teamName(team: string | TeamRef | undefined | null): string {
  if (team === null || team === undefined) return '—'
  return typeof team === 'object' ? team.name : '—'
}

function scheduleLine(match: Match): string {
  if (match.bookingId === null) return 'Sin fecha asignada'
  const schedule = match.bookingId
  const day = formatLong(bookingDay(schedule.date))
  return `${day} · ${schedule.startTime}–${schedule.endTime}`
}

function fieldName(match: Match): string {
  const schedule = match.bookingId
  if (schedule === null) return ''
  return typeof schedule.fieldId === 'object' ? schedule.fieldId.name : 'Cancha'
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
            {matchday.matches.map((match) => {
              const finished = match.status === 'finalizado'
              return (
                <div
                  key={match.id}
                  className="rounded-xl border border-line bg-cream p-4 shadow-surface transition-colors hover:border-mauve/50 dark:border-mauve dark:bg-coffee-elev"
                >
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

                  <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-sm">
                    <div className="min-w-0 text-right">
                      <span className="font-semibold text-coffee dark:text-[#f3efe8]">
                        {teamName(match.homeTeamId)}
                      </span>
                    </div>
                    <div className="flex min-w-20 flex-col items-center justify-center gap-1">
                      <span className="text-xs font-semibold uppercase tracking-wide text-tertiary/60 dark:text-mauve-soft">
                        vs
                      </span>
                      {finished && (
                        <span className="text-center text-lg font-extrabold tracking-wider text-[#4d5a1e] dark:text-lime">
                          {match.homeGoals} – {match.awayGoals}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 text-left">
                      <span className="font-semibold text-coffee dark:text-[#f3efe8]">
                        {teamName(match.awayTeamId)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 border-t border-line pt-3 text-xs text-tertiary dark:border-mauve/60 dark:text-mauve-soft">
                    <p className="capitalize">{scheduleLine(match)}</p>
                    {fieldName(match).length > 0 && <p>{fieldName(match)}</p>}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}