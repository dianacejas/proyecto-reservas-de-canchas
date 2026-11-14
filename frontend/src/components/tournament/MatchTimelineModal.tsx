import { Button, Chip, Modal } from '@heroui/react'
import type { Match, TeamRef } from '../../types'
import { bookingDay, formatLong } from '../../utils/date'
import {
  CalendarIcon,
  ClockIcon,
  GoalPill,
  MedalIcon,
  RedCard,
  StadiumIcon,
  YellowCard,
} from '../common/Icons'
import TeamCrest from './TeamCrest'

interface MatchTimelineModalProps {
  match: Match | null
  isOpen: boolean
  onClose: () => void
}

function teamName(team: string | TeamRef | undefined | null): string {
  if (team === null || team === undefined) return 'Por definirse'
  return typeof team === 'object' ? team.name : 'Por definirse'
}

function teamId(team: string | TeamRef | undefined | null): string {
  if (team === null || team === undefined) return ''
  return typeof team === 'object' ? team.id : team
}

function renderEventBadge(type: string): React.JSX.Element {
  if (type === 'goal' || type === 'gol' || type === 'penal') {
    return <GoalPill text={type === 'penal' ? 'Penal' : 'Gol'} />
  }
  if (type === 'yellow_card' || type === 'amarilla') {
    return <YellowCard />
  }
  if (type === 'red_card' || type === 'roja') {
    return <RedCard />
  }
  return <span className="inline-block size-2 rounded-full bg-tertiary" />
}

function eventLabel(type: string): string {
  if (type === 'goal' || type === 'gol') return 'Gol'
  if (type === 'yellow_card' || type === 'amarilla') return 'Tarjeta Amarilla'
  if (type === 'red_card' || type === 'roja') return 'Tarjeta Roja'
  if (type === 'penal') return 'Gol de penal'
  return 'Incidencia'
}

export default function MatchTimelineModal({
  match,
  isOpen,
  onClose,
}: MatchTimelineModalProps): React.JSX.Element | null {
  if (!match) return null

  const homeLabel = teamName(match.homeTeamId)
  const awayLabel = teamName(match.awayTeamId)
  const homeIdStr = teamId(match.homeTeamId)

  const isFinished = match.status === 'finalizado'
  const schedule = match.bookingId
  const dateStr = schedule ? formatLong(bookingDay(schedule.date)) : null
  const courtStr =
    schedule && schedule.fieldId && typeof schedule.fieldId === 'object'
      ? schedule.fieldId.name
      : null

  const sortedEvents = [...(match.events || [])].sort(
    (a, b) => (a.minute ?? 0) - (b.minute ?? 0)
  )

  return (
    <Modal.Root isOpen={isOpen} onOpenChange={(open) => open || onClose()}>
      <Modal.Backdrop variant="blur" />
      <Modal.Container size="md">
        <Modal.Dialog className="border border-white/10 bg-neutral-900">
          <Modal.Header>
            <Modal.Heading className="text-lg font-bold text-white">
              Minuta y Detalle del Partido
            </Modal.Heading>
            <Modal.CloseTrigger />
          </Modal.Header>

          <Modal.Body className="space-y-5">
            {/* Cabecera del encuentro / Marcador */}
            <div className="rounded-xl border p-4 text-center border-white/10 bg-neutral-800/60">
              <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
                <span className="font-semibold uppercase tracking-wider">
                  {match.fase === 'grupos' ? `Jornada ${match.matchday} · Grupo ${match.group}` : match.fase.toUpperCase()}
                </span>
                <Chip size="sm" color={isFinished ? 'success' : 'default'}>
                  {isFinished ? 'Finalizado' : 'Programado'}
                </Chip>
              </div>

              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-1">
                <div className="flex flex-col items-center gap-1.5 sm:flex-row sm:justify-end">
                  <span className="font-black text-sm sm:text-base text-white">
                    {homeLabel}
                  </span>
                  <TeamCrest name={homeLabel} size="md" />
                </div>

                <div className="px-3">
                  <div className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                    {isFinished ? `${match.homeGoals} – ${match.awayGoals}` : 'vs'}
                  </div>
                  {match.homePenalties !== null && match.awayPenalties !== null && (
                    <div className="text-xs font-bold text-neutral-400">
                      Penales: ({match.homePenalties}) – ({match.awayPenalties})
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-center gap-1.5 sm:flex-row sm:justify-start">
                  <TeamCrest name={awayLabel} size="md" />
                  <span className="font-black text-sm sm:text-base text-white">
                    {awayLabel}
                  </span>
                </div>
              </div>

              {(dateStr || courtStr) && (
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2 border-t pt-2.5 text-xs border-white/10 text-neutral-400">
                  {dateStr && (
                    <span className="inline-flex items-center gap-1">
                      <CalendarIcon className="size-3.5 text-neutral-400" />
                      {dateStr}
                    </span>
                  )}
                  {schedule?.startTime && (
                    <span className="inline-flex items-center gap-1">
                      <ClockIcon className="size-3.5 text-neutral-400" />
                      {schedule.startTime}–{schedule.endTime} hs
                    </span>
                  )}
                  {courtStr && (
                    <span className="inline-flex items-center gap-1">
                      <StadiumIcon className="size-3.5 text-neutral-400" />
                      {courtStr}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Línea de Tiempo / Minuta */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
                Línea de Tiempo del Partido
              </h4>

              {sortedEvents.length === 0 ? (
                <p className="py-6 text-center text-xs text-neutral-400 border border-dashed rounded-xl border-white/15">
                  No hay incidencias ni goles registrados para este encuentro.
                </p>
              ) : (
                <div className="relative border-l-2 border-[#c5d86d]/40 ml-4 pl-4 space-y-3.5">
                  {sortedEvents.map((event, idx) => {
                    const isHome = event.teamId === homeIdStr
                    const isGoal = event.type === 'goal' || event.type === 'gol' || event.type === 'penal'

                    return (
                      <div
                        key={`${event.playerName}-${idx}`}
                        className="relative flex items-center justify-between gap-3 text-sm"
                      >
                        {/* Dot indicador sobre la línea */}
                        <span className="absolute -left-[23px] flex size-4 items-center justify-center rounded-full bg-[#c5d86d] text-[10px] text-neutral-950 font-black shadow-sm" />

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            {renderEventBadge(event.type)}
                            <span
                              className={`font-extrabold truncate ${
                                isGoal
                                  ? 'text-white'
                                  : 'text-neutral-300'
                              }`}
                            >
                              {event.playerName}
                            </span>
                            {!isGoal && (
                              <span className="text-xs text-neutral-400">
                                ({eventLabel(event.type)})
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] font-medium text-neutral-400 mt-0.5">
                            {isHome ? homeLabel : awayLabel}
                          </p>
                        </div>

                        <span className="shrink-0 rounded-md px-2 py-0.5 text-xs font-black tabular-nums bg-neutral-800 text-white">
                          {event.minute !== null && event.minute !== undefined ? `${event.minute}'` : '—'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Banner Jugador del Partido (MVP) */}
            {match.mvpPlayer && (
              <div className="flex items-center justify-between gap-2 rounded-xl border border-[#c5d86d]/40 bg-[#c5d86d]/10 p-3 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-8 items-center justify-center rounded-full bg-[#c5d86d]/20 text-[#c5d86d]">
                    <MedalIcon className="size-4 text-[#c5d86d]" />
                  </span>
                  <div>
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-[#c5d86d]">
                      Jugador del Partido (MVP)
                    </span>
                    <span className="text-sm font-black text-white">
                      {match.mvpPlayer}
                    </span>
                  </div>
                </div>
                <Chip
                  size="sm"
                  variant="soft"
                  className="bg-[#c5d86d] text-neutral-950 font-black"
                >
                  MVP Oficial
                </Chip>
              </div>
            )}
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" className="min-h-10 w-full" onPress={onClose}>
              Cerrar
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Root>
  )
}