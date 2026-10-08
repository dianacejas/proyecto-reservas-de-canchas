import { Button, Chip, Modal } from '@heroui/react'
import { useId, useState } from 'react'
import type { Match, MatchEvent, TeamPlayer, TeamRef } from '../../types'
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

function resizeScorers(list: string[], goals: number): string[] {
  if (list.length === goals) return list
  if (list.length > goals) return list.slice(0, goals)
  return [...list, ...Array.from({ length: goals - list.length }, () => '')]
}

const SCORER_INPUT_CLASS =
  'min-h-11 w-full rounded-lg border border-line bg-cream px-3 py-1.5 text-sm text-coffee outline-none focus:border-lime dark:border-mauve dark:bg-coffee-elev dark:text-[#f3efe8]'

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
  playersByTeam?: Record<string, TeamPlayer[]>
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

  const id = useId().replace(/[^a-zA-Z0-9]/g, '')
  const homeListId = `${id}-home`
  const awayListId = `${id}-away`

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

  const homeRoster = homeId !== null ? (playersByTeam[homeId] ?? []) : []
  const awayRoster = awayId !== null ? (playersByTeam[awayId] ?? []) : []
  const homeSuggestions = Array.from(new Set(homeRoster.map((player) => player.name)))
  const awaySuggestions = Array.from(new Set(awayRoster.map((player) => player.name)))

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

  const numberClass =
    'min-h-11 w-full rounded-lg border border-line bg-cream px-2 py-1.5 text-center text-sm text-coffee outline-none focus:border-lime dark:border-mauve dark:bg-coffee-elev dark:text-[#f3efe8]'

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
                <input
                  type="number"
                  min="0"
                  value={home}
                  onChange={(event) => handleHomeChange(event.target.value)}
                  className={numberClass}
                  aria-label="Goles local"
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
                <input
                  type="number"
                  min="0"
                  value={away}
                  onChange={(event) => handleAwayChange(event.target.value)}
                  className={numberClass}
                  aria-label="Goles visitante"
                  placeholder="0"
                />
              </div>

              {homeGoals > 0 && (
                <GoalScorerSection
                  teamName={teamRefName(match.homeTeamId)}
                  scorers={homeScorers}
                  suggestions={homeSuggestions}
                  listId={homeListId}
                  onChange={setHomeScorer}
                />
              )}

              {awayGoals > 0 && (
                <GoalScorerSection
                  teamName={teamRefName(match.awayTeamId)}
                  scorers={awayScorers}
                  suggestions={awaySuggestions}
                  listId={awayListId}
                  onChange={setAwayScorer}
                />
              )}

              {tieNeedsPen && (
                <div className="space-y-2 rounded-lg border border-line bg-paper/70 p-3 dark:border-mauve dark:bg-mauve-deep/60">
                  <p className="text-xs font-medium uppercase tracking-wide text-tertiary dark:text-mauve-soft">
                    Definición por penales
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="space-y-1 text-xs text-coffee/70 dark:text-mauve-soft">
                      <span>{teamRefName(match.homeTeamId)}</span>
                      <input
                        type="number"
                        min="0"
                        value={homePen}
                        onChange={(event) => setHomePen(event.target.value)}
                        className={numberClass}
                        aria-label="Penales local"
                        placeholder="0"
                      />
                    </label>
                    <label className="space-y-1 text-xs text-coffee/70 dark:text-mauve-soft">
                      <span>{teamRefName(match.awayTeamId)}</span>
                      <input
                        type="number"
                        min="0"
                        value={awayPen}
                        onChange={(event) => setAwayPen(event.target.value)}
                        className={numberClass}
                        aria-label="Penales visitante"
                        placeholder="0"
                      />
                    </label>
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

function GoalScorerSection({
  teamName,
  scorers,
  suggestions,
  listId,
  onChange,
}: {
  teamName: string
  scorers: string[]
  suggestions: string[]
  listId: string
  onChange: (index: number, name: string) => void
}): React.JSX.Element {
  return (
    <div className="space-y-2 rounded-lg border border-line bg-paper/70 p-3 dark:border-mauve dark:bg-mauve-deep/60">
      <p className="text-xs font-medium uppercase tracking-wide text-tertiary dark:text-mauve-soft">
        Goleadores · {teamName}
      </p>
      <div className="space-y-2">
        {scorers.map((name, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="w-16 shrink-0 text-xs font-semibold text-tertiary dark:text-mauve-soft">
              Gol {index + 1}
            </span>
            <input
              type="text"
              list={listId}
              value={name}
              onChange={(event) => onChange(index, event.target.value)}
              placeholder="Nombre del jugador"
              className={SCORER_INPUT_CLASS}
              aria-label={`Goleador ${index + 1} de ${teamName}`}
            />
          </div>
        ))}
      </div>
      {suggestions.length > 0 && (
        <datalist id={listId}>
          {suggestions.map((suggestion) => (
            <option key={suggestion} value={suggestion} />
          ))}
        </datalist>
      )}
    </div>
  )
}