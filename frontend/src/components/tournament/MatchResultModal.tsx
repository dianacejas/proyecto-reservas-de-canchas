import { Button, Chip, Modal } from '@heroui/react'
import { useState } from 'react'
import type { Match, MatchEvent, TeamPlayer, TeamRef } from '../../types'
import { SelectInput, TextInput, type SelectOption } from '../common/fields'
import TeamCrest from './TeamCrest'

export interface MatchResultSubmit {
  homeGoals: number
  awayGoals: number
  homePenalties?: number
  awayPenalties?: number
  events: MatchEvent[]
}

function teamRefId(team: string | TeamRef | null | undefined): string | null {
  if (team === null || team === undefined) return null
  return typeof team === 'object' ? team.id : team
}

function teamRefName(team: string | TeamRef | null | undefined): string {
  if (team === null || team === undefined) return 'Por definirse'
  return typeof team === 'object' ? team.name : 'Por definirse'
}

/**
 * Un jugador puede llegar como string (`["Dani", "Leo"]`) o como objeto
 * (`{ name, number }` / `{ _id, name }`). Se normaliza para no romper el mapeo.
 */
function entryName(entry: unknown): string {
  if (typeof entry === 'string') return entry.trim()
  if (entry !== null && typeof entry === 'object') {
    const record = entry as Record<string, unknown>
    const raw = record.name ?? record.nombre ?? record.playerName
    if (typeof raw === 'string') return raw.trim()
  }
  return ''
}

/** Devuelve los nombres únicos y no vacíos de un plantel de formato desconocido. */
function normalizeRoster(entries: unknown): string[] {
  if (!Array.isArray(entries)) return []
  const names = entries.map(entryName).filter((name) => name.length > 0)
  return Array.from(new Set(names))
}

/**
 * Resuelve el plantel de un equipo: primero el mapa `playersByTeam` (equipos del
 * torneo) y, si viene vacío, cae al plantel poplueado dentro del propio partido.
 */
function resolveRoster(
  team: string | TeamRef | null | undefined,
  teamId: string | null,
  playersByTeam: Record<string, Array<TeamPlayer | string>>
): string[] {
  if (teamId !== null) {
    const fromMap = normalizeRoster(playersByTeam[teamId])
    if (fromMap.length > 0) return fromMap
  }
  if (team !== null && typeof team === 'object') return normalizeRoster(team.players)
  return []
}

function resizeScorers(list: string[], goals: number): string[] {
  if (list.length === goals) return list
  if (list.length > goals) return list.slice(0, goals)
  return [...list, ...Array.from({ length: goals - list.length }, () => '')]
}

export default function MatchResultModal({
  match,
  isPending,
  error,
  playersByTeam = {},
  onClose,
  onError,
  onSubmit,
}: {
  match: Match
  isPending: boolean
  error: string | null
  playersByTeam?: Record<string, Array<TeamPlayer | string>>
  onClose: () => void
  onError: (err: string | null) => void
  onSubmit: (input: MatchResultSubmit) => void
}): React.JSX.Element {
  const homeId = teamRefId(match.homeTeamId)
  const awayId = teamRefId(match.awayTeamId)

  const [home, setHome] = useState(match.homeGoals === null ? '' : String(match.homeGoals))
  const [away, setAway] = useState(match.awayGoals === null ? '' : String(match.awayGoals))
  const [homePen, setHomePen] = useState(match.homePenalties === null ? '' : String(match.homePenalties ?? ''))
  const [awayPen, setAwayPen] = useState(match.awayPenalties === null ? '' : String(match.awayPenalties ?? ''))
  const [homeScorers, setHomeScorers] = useState<string[]>(() =>
    match.events
      .filter((event) => event.type === 'goal' && event.teamId === homeId)
      .map((event) => event.playerName)
  )
  const [awayScorers, setAwayScorers] = useState<string[]>(() =>
    match.events
      .filter((event) => event.type === 'goal' && event.teamId === awayId)
      .map((event) => event.playerName)
  )

  const parsedHome = home.trim() === '' ? null : Number(home)
  const parsedAway = away.trim() === '' ? null : Number(away)
  const homeGoals = parsedHome ?? 0
  const awayGoals = parsedAway ?? 0
  const scoresValid =
    parsedHome !== null &&
    parsedAway !== null &&
    Number.isInteger(parsedHome) &&
    Number.isInteger(parsedAway) &&
    parsedHome >= 0 &&
    parsedAway >= 0

  const needsPenalties = match.fase !== 'grupos'
  const isTied = parsedHome !== null && parsedAway !== null && parsedHome === parsedAway
  const tieNeedsPen = needsPenalties && isTied && scoresValid
  const penaltiesValid =
    homePen.trim() !== '' &&
    awayPen.trim() !== '' &&
    Number.isInteger(Number(homePen)) &&
    Number.isInteger(Number(awayPen)) &&
    Number(homePen) >= 0 &&
    Number(awayPen) >= 0

  const homeMissing = homeScorers.some((name) => name.trim() === '')
  const awayMissing = awayScorers.some((name) => name.trim() === '')
  const canSubmit =
    !isPending &&
    scoresValid &&
    (homeGoals === 0 || homeId !== null) &&
    (awayGoals === 0 || awayId !== null) &&
    !homeMissing &&
    !awayMissing &&
    (!tieNeedsPen || penaltiesValid)

  const homeSuggestions = resolveRoster(match.homeTeamId, homeId, playersByTeam)
  const awaySuggestions = resolveRoster(match.awayTeamId, awayId, playersByTeam)

  function handleHomeChange(value: string): void {
    setHome(value)
    setHomeScorers((prev) => resizeScorers(prev, Math.max(0, Math.floor(Number(value) || 0))))
  }

  function handleAwayChange(value: string): void {
    setAway(value)
    setAwayScorers((prev) => resizeScorers(prev, Math.max(0, Math.floor(Number(value) || 0))))
  }

  function setHomeScorer(index: number, name: string): void {
    setHomeScorers((prev) => prev.map((value, i) => (i === index ? name : value)))
  }

  function setAwayScorer(index: number, name: string): void {
    setAwayScorers((prev) => prev.map((value, i) => (i === index ? name : value)))
  }

  function handleSave(): void {
    onError(null)
    if (homeGoals > 0 && homeId === null) {
      onError('El equipo local no tiene un equipo asignado para asociar los goles.')
      return
    }
    if (awayGoals > 0 && awayId === null) {
      onError('El equipo visitante no tiene un equipo asignado para asociar los goles.')
      return
    }

    const preservedCards = match.events.filter((event) => event.type !== 'goal')
    const homeGoalEvents: MatchEvent[] =
      homeId === null
        ? []
        : homeScorers.map(
            (name): MatchEvent => ({
              type: 'goal',
              playerName: name.trim(),
              teamId: homeId,
              minute: null,
            })
          )
    const awayGoalEvents: MatchEvent[] =
      awayId === null
        ? []
        : awayScorers.map(
            (name): MatchEvent => ({
              type: 'goal',
              playerName: name.trim(),
              teamId: awayId,
              minute: null,
            })
          )

    const input: MatchResultSubmit = {
      homeGoals,
      awayGoals,
      events: [...preservedCards, ...homeGoalEvents, ...awayGoalEvents],
    }
    if (isTied && homePen.trim() !== '' && awayPen.trim() !== '') {
      input.homePenalties = Number(homePen)
      input.awayPenalties = Number(awayPen)
    }
    onSubmit(input)
  }

  return (
    <Modal.Root isOpen onOpenChange={(open) => open || onClose()}>
      <Modal.Backdrop variant="blur" />
      <Modal.Container size="md">
        <Modal.Dialog>
          <Modal.Header>
            <Modal.Heading>Cargar resultado</Modal.Heading>
            <Modal.CloseTrigger />
          </Modal.Header>
          <Modal.Body>
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-[1fr_auto] items-center gap-3">
                <span className="flex min-w-0 items-center gap-2 text-right">
                  <TeamCrest name={teamRefName(match.homeTeamId)} size="xs" />
                  <span className="truncate font-medium text-coffee/80 dark:text-mauve-soft">
                    {teamRefName(match.homeTeamId)}
                  </span>
                </span>
                <TextInput
                  aria-label="Goles local"
                  type="number"
                  min={0}
                  className="w-16"
                  inputClassName="text-center"
                  value={home}
                  onValueChange={handleHomeChange}
                  placeholder="0"
                />
              </div>
              <div className="grid grid-cols-[1fr_auto] items-center gap-3">
                <span className="flex min-w-0 items-center gap-2 text-right">
                  <TeamCrest name={teamRefName(match.awayTeamId)} size="xs" />
                  <span className="truncate font-medium text-coffee/80 dark:text-mauve-soft">
                    {teamRefName(match.awayTeamId)}
                  </span>
                </span>
                <TextInput
                  aria-label="Goles visitante"
                  type="number"
                  min={0}
                  className="w-16"
                  inputClassName="text-center"
                  value={away}
                  onValueChange={handleAwayChange}
                  placeholder="0"
                />
              </div>

              {homeGoals > 0 && (
                <GoalScorerSection
                  teamName={teamRefName(match.homeTeamId)}
                  scorers={homeScorers}
                  suggestions={homeSuggestions}
                  onChange={setHomeScorer}
                />
              )}

              {awayGoals > 0 && (
                <GoalScorerSection
                  teamName={teamRefName(match.awayTeamId)}
                  scorers={awayScorers}
                  suggestions={awaySuggestions}
                  onChange={setAwayScorer}
                />
              )}

              {tieNeedsPen && (
                <div className="space-y-2 rounded-lg border border-line bg-paper/70 p-3 dark:border-mauve dark:bg-mauve-deep/60">
                  <p className="text-xs font-medium uppercase tracking-wide text-tertiary dark:text-mauve-soft">
                    Definición por penales
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1 text-xs text-coffee/70 dark:text-mauve-soft">
                      <span className="block">{teamRefName(match.homeTeamId)}</span>
                      <TextInput
                        aria-label="Penales local"
                        type="number"
                        min={0}
                        className="w-full"
                        inputClassName="text-center"
                        value={homePen}
                        onValueChange={setHomePen}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-1 text-xs text-coffee/70 dark:text-mauve-soft">
                      <span className="block">{teamRefName(match.awayTeamId)}</span>
                      <TextInput
                        aria-label="Penales visitante"
                        type="number"
                        min={0}
                        className="w-full"
                        inputClassName="text-center"
                        value={awayPen}
                        onValueChange={setAwayPen}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              )}

              {(homeMissing || awayMissing) && scoresValid && (
                <p className="text-xs text-tertiary dark:text-mauve-soft">
                  Atribuí un goleador a cada gol para poder guardar el resultado.
                </p>
              )}

              {error !== null && (
                <Chip color="danger" size="sm" className="h-auto py-1">
                  {error}
                </Chip>
              )}
            </div>
          </Modal.Body>
          <Modal.Footer className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" className="min-h-11 w-full sm:w-auto" onPress={onClose}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              className="min-h-11 w-full sm:w-auto"
              isDisabled={!canSubmit}
              onPress={handleSave}
            >
              {isPending ? 'Guardando…' : 'Guardar resultado'}
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Root>
  )
}

/** Valor centinela para la opción "escribir a mano" del selector de goleadores. */
const MANUAL_SCORER_OPTION = '__manual__'

function GoalScorerSection({
  teamName,
  scorers,
  suggestions,
  onChange,
}: {
  teamName: string
  scorers: string[]
  suggestions: string[]
  onChange: (index: number, name: string) => void
}): React.JSX.Element {
  // Goles que se resuelven escribiendo el nombre a mano en vez de elegirlo.
  const [manualSlots, setManualSlots] = useState<Record<number, boolean>>({})
  const canPick = suggestions.length > 0

  const options: SelectOption[] = [
    ...suggestions.map((suggestion) => ({ key: suggestion, label: suggestion })),
    { key: MANUAL_SCORER_OPTION, label: 'Otro / ingresar a mano' },
  ]

  function markManual(index: number, value: boolean): void {
    setManualSlots((prev) => ({ ...prev, [index]: value }))
  }

  return (
    <div className="space-y-2 rounded-lg border border-line bg-paper/70 p-3 dark:border-mauve dark:bg-mauve-deep/60">
      <p className="text-xs font-medium uppercase tracking-wide text-tertiary dark:text-mauve-soft">
        Goleadores · {teamName}
      </p>
      {!canPick && (
        <p className="text-xs text-tertiary dark:text-mauve-soft">
          Este equipo todavía no tiene plantel cargado: escribí los nombres a mano.
        </p>
      )}
      <div className="space-y-2">
        {scorers.map((value, index) => {
          const isManual =
            !canPick || (manualSlots[index] ?? (value !== '' && !suggestions.includes(value)))

          return (
            <div key={index} className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-16 shrink-0 text-xs font-semibold text-tertiary dark:text-mauve-soft">
                  Gol {index + 1}
                </span>
                {canPick ? (
                  <SelectInput
                    aria-label={`Goleador ${index + 1} de ${teamName}`}
                    className="flex-1"
                    placeholder="— Seleccionar jugador —"
                    value={isManual ? MANUAL_SCORER_OPTION : value}
                    onValueChange={(next) => {
                      if (next === MANUAL_SCORER_OPTION) {
                        markManual(index, true)
                        onChange(index, '')
                      } else {
                        markManual(index, false)
                        onChange(index, next)
                      }
                    }}
                    options={options}
                  />
                ) : (
                  <TextInput
                    aria-label={`Goleador ${index + 1} de ${teamName}`}
                    className="flex-1"
                    value={value}
                    onValueChange={(next) => onChange(index, next)}
                    placeholder="Nombre del goleador"
                  />
                )}
              </div>
              {canPick && isManual && (
                <div className="pl-[4.5rem]">
                  <TextInput
                    aria-label={`Nombre del goleador ${index + 1} de ${teamName}`}
                    className="w-full"
                    value={value}
                    onValueChange={(next) => onChange(index, next)}
                    placeholder="Nombre del goleador"
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}