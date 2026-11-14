import { Chip } from '@heroui/react'
import { useMemo, useState } from 'react'
import type { Match, Matchday, TeamRef } from '../../types'
import { bookingDay, formatLong } from '../../utils/date'
import { SelectInput } from '../common/fields'
import { FileTextIcon, MedalIcon } from '../common/Icons'
import MatchTimelineModal from './MatchTimelineModal'
import TeamCrest from './TeamCrest'

function teamName(team: string | TeamRef | undefined | null): string {
  if (team === null || team === undefined) return '—'
  return typeof team === 'object' ? team.name : '—'
}

function teamId(team: string | TeamRef | undefined | null): string {
  if (team === null || team === undefined) return ''
  return typeof team === 'object' ? team.id : team
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
  const [selectedTeam, setSelectedTeam] = useState<string>('all')
  const [activeMatch, setActiveMatch] = useState<Match | null>(null)

  // Extraer lista única de equipos para el selector de filtro
  const teamOptions = useMemo(() => {
    const map = new Map<string, string>()
    for (const md of matchdays) {
      for (const m of md.matches) {
        const hId = teamId(m.homeTeamId)
        const hName = teamName(m.homeTeamId)
        if (hId && hName !== '—') map.set(hId, hName)

        const aId = teamId(m.awayTeamId)
        const aName = teamName(m.awayTeamId)
        if (aId && aName !== '—') map.set(aId, aName)
      }
    }

    const opts = [{ key: 'all', label: 'Todos los equipos' }]
    for (const [id, name] of Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]))) {
      opts.push({ key: id, label: name })
    }
    return opts
  }, [matchdays])

  if (matchdays.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-neutral-400">
        Todavía no hay partidos en el fixture.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filtro Rápido por Equipo */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-2xl border p-3 sm:px-4 border-neutral-800 bg-neutral-900/60">
        <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
          Filtro por Equipo
        </span>
        <div className="w-full sm:w-64">
          <SelectInput
            value={selectedTeam}
            onValueChange={setSelectedTeam}
            options={teamOptions}
            placeholder="Seleccionar equipo"
          />
        </div>
      </div>

      {matchdays.map((matchday) => (
        <section key={matchday.matchday}>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-400">
            Jornada {matchday.matchday}
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {matchday.matches.map((match) => {
              const hId = teamId(match.homeTeamId)
              const aId = teamId(match.awayTeamId)
              const isHighlighted = selectedTeam === 'all' || hId === selectedTeam || aId === selectedTeam

              return (
                <div
                  key={match.id}
                  className={`transition-opacity duration-200 ${
                    isHighlighted ? 'opacity-100' : 'opacity-25 pointer-events-none'
                  }`}
                >
                  <MatchCard match={match} onSelect={() => setActiveMatch(match)} />
                </div>
              )
            })}
          </div>
        </section>
      ))}

      <MatchTimelineModal
        match={activeMatch}
        isOpen={activeMatch !== null}
        onClose={() => setActiveMatch(null)}
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
  const hasEvents = (match.events && match.events.length > 0) || match.mvpPlayer

  return (
    <div
      onClick={onSelect}
      className="group relative cursor-pointer rounded-xl border p-2.5 shadow-sm transition-all hover:shadow-md sm:p-3 border-white/5 bg-neutral-900/60 hover:border-[#c5d86d]/80"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
        <span className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">
          {match.group}
        </span>
        <div className="flex items-center gap-1.5">
          {hasEvents && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-neutral-400 group-hover:text-[#c5d86d] transition-colors">
              <FileTextIcon className="size-3" />
              Ver minuta
            </span>
          )}
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
      </div>

      <div className="mt-1.5 grid w-full grid-cols-[1fr_auto_1fr] items-center gap-2 py-1.5 sm:gap-3">
        <div className="flex min-w-0 items-center justify-end gap-1.5 text-right sm:gap-2">
          <span className="min-w-0 truncate text-xs font-semibold sm:text-sm text-white/90">
            {homeLabel}
          </span>
          {hasTeam(match.homeTeamId) && <TeamCrest name={homeLabel} size="xs" className="w-6 h-6" />}
        </div>

        <div className="flex min-w-[56px] flex-col items-center justify-center px-1 sm:min-w-[70px] sm:px-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider sm:text-[11px] text-neutral-500/70">
            vs
          </span>
          <span className="text-base font-extrabold tracking-widest sm:text-lg text-[#c5d86d]">
            {finished ? `${match.homeGoals} – ${match.awayGoals}` : '-'}
          </span>
        </div>

        <div className="flex min-w-0 items-center justify-start gap-1.5 text-left sm:gap-2">
          {hasTeam(match.awayTeamId) && <TeamCrest name={awayLabel} size="xs" className="w-6 h-6" />}
          <span className="min-w-0 truncate text-xs font-semibold sm:text-sm text-white/90">
            {awayLabel}
          </span>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between border-t pt-2 text-[11px] border-white/5 text-neutral-400">
        <div>
          <p className="capitalize">{scheduleLine(match)}</p>
          {field.length > 0 && <p>{field}</p>}
        </div>
        {match.mvpPlayer && (
          <span className="inline-flex items-center gap-1 shrink-0 rounded-md bg-[#c5d86d]/20 px-1.5 py-0.5 text-[10px] font-bold text-[#c5d86d]">
            <MedalIcon className="size-3 text-[#c5d86d]" />
            {match.mvpPlayer}
          </span>
        )}
      </div>
    </div>
  )
}