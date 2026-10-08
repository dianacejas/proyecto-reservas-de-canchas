import { Alert, Button, Chip } from '@heroui/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  generatePlayoffs,
  getPlayoffs,
  getStandings,
  getTopScorers,
  listTournamentTeams,
  updateMatchScore,
} from '../../api'
import { getErrorMessage } from '../../api/client'
import ErrorState from '../common/ErrorState'
import Loading from '../common/Loading'
import MatchResultModal, { type MatchResultSubmit } from './MatchResultModal'
import type { Match, PlayoffBracket as PlayoffData, TeamPlayer, TeamRef, TopScorerRow } from '../../types'
import { bookingDay, formatDayShort } from '../../utils/date'
import { teamCrestColor } from '../../utils/crest'
import TeamCrest from './TeamCrest'

type Side = 'home' | 'away'
type RowState = 'winner' | 'loser' | 'pending' | 'tbd'
type PathTone = 'advance' | 'advanceGlow' | 'link'

const CHAMPION_NODE = '__champion__'

/**
 * El bracket se renderiza SIEMPRE oscuro, como un panel de transmision, en
 * ambos temas. Por eso estas clases no llevan variante `dark:`: un `bg-cream`
 * sin su override `dark:` se convertia en un bloque casi blanco con texto
 * claro encima (ilegible). Todos los hijos heredan este fondo oscuro.
 */
const SHELL_CARD =
  'overflow-hidden rounded-2xl border border-white/10 bg-[#1a090d]/90 backdrop-blur-sm transition-shadow shadow-[0_18px_46px_-20px_rgba(0,0,0,0.95)]'

const TONE_STROKE: Record<PathTone, string> = {
  advance: 'stroke-lime',
  advanceGlow: 'stroke-lime/20',
  link: 'stroke-[#574752]',
}

const TONE_WIDTH: Record<PathTone, number> = {
  advance: 2,
  advanceGlow: 6,
  link: 2,
}

const CORNER = 6

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

function elbowPath(x1: number, y1: number, x2: number, y2: number): string {
  const span = x2 - x1
  if (span <= 1) return ''
  const startX = round2(x1)
  const startY = round2(y1)
  const endX = round2(x2)
  const endY = round2(y2)
  if (Math.abs(endY - startY) < 1) return `M ${startX} ${startY} H ${endX}`
  const dir = endY > startY ? 1 : -1
  const midX = round2(startX + span / 2)
  const radius = Math.max(0, Math.min(CORNER, span / 2, Math.abs(endY - startY) / 2))
  if (radius < 0.5) return `M ${startX} ${startY} H ${midX} V ${endY} H ${endX}`
  const first = dir > 0 ? 1 : 0
  const second = dir > 0 ? 0 : 1
  return [
    `M ${startX} ${startY}`,
    `H ${round2(midX - radius)}`,
    `A ${radius} ${radius} 0 0 ${first} ${midX} ${round2(startY + dir * radius)}`,
    `V ${round2(endY - dir * radius)}`,
    `A ${radius} ${radius} 0 0 ${second} ${round2(midX + radius)} ${endY}`,
    `H ${endX}`,
  ].join(' ')
}

function bridgePath(x1: number, y1: number, x2: number, y2: number): string {
  const span = x2 - x1
  if (span <= 1) return ''
  const startX = round2(x1)
  const startY = round2(y1)
  const endX = round2(x2)
  const endY = round2(y2)
  if (Math.abs(endY - startY) < 1) return `M ${startX} ${startY} H ${endX}`
  const midX = round2(startX + span / 2)
  return `M ${startX} ${startY} C ${midX} ${startY} ${midX} ${endY} ${endX} ${endY}`
}

function teamId(team: string | TeamRef | null | undefined): string | null {
  if (team === null || team === undefined) return null
  return typeof team === 'object' ? team.id : team
}

function teamLabel(team: string | TeamRef | null | undefined): string {
  if (team === null || team === undefined) return 'Por definirse'
  if (typeof team === 'object') return team.name
  return 'Por definirse'
}

function winnerId(match: Match): string | null {
  const home = teamId(match.homeTeamId)
  const away = teamId(match.awayTeamId)
  if (home === null || away === null) return null
  const homeGoals = match.homeGoals ?? 0
  const awayGoals = match.awayGoals ?? 0
  if (homeGoals > awayGoals) return home
  if (awayGoals > homeGoals) return away
  const homePen = match.homePenalties ?? -1
  const awayPen = match.awayPenalties ?? -1
  if (homePen > awayPen) return home
  if (awayPen > homePen) return away
  return null
}

function winnerSide(match: Match): Side | null {
  const winner = winnerId(match)
  if (winner === null) return null
  if (winner === teamId(match.homeTeamId)) return 'home'
  return winner === teamId(match.awayTeamId) ? 'away' : null
}

function scheduleLabel(match: Match): string {
  if (match.status === 'finalizado') {
    const hasPen = match.homePenalties !== null && match.awayPenalties !== null
    return hasPen ? 'Definido por penales' : 'Finalizado'
  }
  const booking = match.bookingId
  if (booking === null || booking === undefined) return 'Sin fecha asignada'
  return `${formatDayShort(bookingDay(booking.date))} · ${booking.startTime}`
}

interface BracketPath {
  key: string
  d: string
  tone: PathTone
  dashed: boolean
}

export interface PlayoffBracketProps {
  bracket: PlayoffData
  groupByTeam?: Record<string, string>
  isAdmin?: boolean
  isGenerating?: boolean
  mvp?: TopScorerRow | null
  onGenerate?: () => void
  onEditMatch?: (match: Match) => void
}

export default function PlayoffBracket({
  bracket,
  groupByTeam = {},
  isAdmin = false,
  isGenerating = false,
  mvp = null,
  onGenerate,
  onEditMatch,
}: PlayoffBracketProps): React.JSX.Element {
  if (bracket.rounds.length === 0) {
    return (
      <div className="space-y-4">
        {mvp !== null && (
          <div className="mx-auto flex w-full max-w-sm justify-center">
            <MvpPodium mvp={mvp} />
          </div>
        )}
        <div className="rounded-2xl border border-dashed border-line p-10 text-center dark:border-mauve/60">
          <p className="text-sm text-tertiary dark:text-mauve-soft">
            Todavía no hay cruces de fase final. Se arman automáticamente con los mejores de cada
            grupo.
          </p>
          {onGenerate !== undefined && (
            <Button
              variant="primary"
              className="mt-4"
              isDisabled={isGenerating}
              onPress={onGenerate}
            >
              {isGenerating ? 'Generando…' : 'Generar fase final'}
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center">
      <div className="relative w-full overflow-hidden rounded-3xl border border-white/10 bg-[#1a090d]/80 shadow-[0_18px_46px_-20px_rgba(0,0,0,0.95)]">
        <p className="border-b border-white/10 px-4 py-2 text-[11px] text-mauve-soft/80 md:hidden">
          Deslizá para ver la fase final completa.
        </p>
        <BracketPlate
          rounds={bracket.rounds}
          champion={bracket.champion}
          groupByTeam={groupByTeam}
          isAdmin={isAdmin}
          mvp={mvp}
          onEditMatch={onEditMatch}
        />
      </div>
    </div>
  )
}

function BracketPlate({
  rounds,
  champion,
  groupByTeam,
  isAdmin,
  mvp,
  onEditMatch,
}: {
  rounds: PlayoffData['rounds']
  champion: PlayoffData['champion']
  groupByTeam: Record<string, string>
  isAdmin: boolean
  mvp: TopScorerRow | null
  onEditMatch?: (match: Match) => void
}): React.JSX.Element {
  const boardRef = useRef<HTMLDivElement | null>(null)
  const cardNodes = useRef(new Map<string, HTMLElement>())
  const rowNodes = useRef(new Map<string, HTMLElement>())
  const [paths, setPaths] = useState<BracketPath[]>([])

  const lastRound = rounds.length - 1
  const matches = useMemo(() => rounds.flatMap((round) => round.matches), [rounds])

  const targets = useMemo(() => {
    const map: Record<string, string> = {}
    for (const [index, round] of rounds.entries()) {
      for (const match of round.matches) {
        if (match.nextMatchId !== null) {
          map[match.id] = match.nextMatchId
        } else if (index === lastRound && champion !== null) {
          map[match.id] = CHAMPION_NODE
        }
      }
    }
    return map
  }, [rounds, lastRound, champion])

  useLayoutEffect(() => {
    const board = boardRef.current
    if (board === null) return

    const compute = (): void => {
      const base = board.getBoundingClientRect()
      const next: BracketPath[] = []

      for (const match of matches) {
        const card = cardNodes.current.get(match.id)
        if (card === undefined) continue
        const cardRect = card.getBoundingClientRect()
        const x1 = cardRect.right - base.left
        const cardMidY = cardRect.top + cardRect.height / 2 - base.top
        const rowY = (side: Side): number => {
          const node = rowNodes.current.get(`${match.id}:${side}`)
          if (node === undefined) return cardMidY
          const rect = node.getBoundingClientRect()
          return rect.top + rect.height / 2 - base.top
        }
        const push = (key: string, d: string, tone: PathTone, dashed = false): void => {
          if (d !== '') next.push({ key, d, tone, dashed })
        }

        const targetId = targets[match.id]
        const target = targetId === undefined ? undefined : cardNodes.current.get(targetId)
        const win = winnerSide(match)
        const stubEnd = x1 + Math.max(14, cardRect.width * 0.14)

        if (target === undefined) {
          push(
            `${match.id}-link`,
            elbowPath(x1, cardMidY, stubEnd, cardMidY),
            win === null ? 'link' : 'advance',
            win === null,
          )
          continue
        }

        const targetRect = target.getBoundingClientRect()
        const x2 = targetRect.left - base.left
        const y2 = targetRect.top + targetRect.height / 2 - base.top

        if (win === null) {
          push(`${match.id}-link`, elbowPath(x1, cardMidY, x2, y2), 'link', true)
          continue
        }

        const isPodium = targetId === CHAMPION_NODE
        const fromY = isPodium ? cardMidY : rowY(win)
        const advance = isPodium ? bridgePath(x1, fromY, x2, y2) : elbowPath(x1, fromY, x2, y2)
        push(`${match.id}-adv-glow`, advance, 'advanceGlow')
        push(`${match.id}-adv`, advance, 'advance')
      }

      setPaths(next)
    }

    const observer = new ResizeObserver(compute)
    observer.observe(board)
    for (const node of cardNodes.current.values()) observer.observe(node)
    for (const node of rowNodes.current.values()) observer.observe(node)
    window.addEventListener('resize', compute)
    compute()

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', compute)
    }
  }, [matches, targets])

  return (
    <div className="overflow-x-auto overscroll-x-contain scroll-smooth [scrollbar-width:thin] [-webkit-overflow-scrolling:touch]">
      {/*
        El board es un flex de bloque: ocupa todo el panel, pero sus hijos se
        empaquetan al inicio (justify-content: normal) y el arbol queda
        recostado a la izquierda con un vacio a la derecha del Campeon.
        `mx-auto w-full justify-center` centra las columnas; `min-w-max` se
        mantiene para que, cuando el contenido excede el panel, el ancho Crezca
        y no quede espacio libre que recorte el lado izquierdo al scrollear.
      */}
      <div
        ref={boardRef}
        className="relative mx-auto flex w-full min-w-max items-stretch justify-center gap-8 px-4 py-6 sm:gap-10 md:gap-14 md:px-8 md:py-8"
      >
        <svg
          className="pointer-events-none absolute left-0 top-0 h-full w-full"
          aria-hidden="true"
          focusable="false"
        >
          {paths.map((path) => (
            <path
              key={path.key}
              d={path.d}
              fill="none"
              strokeWidth={TONE_WIDTH[path.tone]}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={path.dashed ? '5 6' : undefined}
              className={TONE_STROKE[path.tone]}
            />
          ))}
        </svg>

        {rounds.map((round, index) => (
          <section
            key={round.fase}
            className="flex w-[13.5rem] shrink-0 snap-center flex-col items-center sm:w-64"
            aria-label={round.label}
          >
            <RoundHeader label={round.label} isHero={index === lastRound} />
            <div className="flex w-full flex-1 flex-col justify-around gap-6">
              {round.matches.map((match) => (
                <MatchCapsule
                  key={match.id}
                  match={match}
                  isHero={index === lastRound}
                  isAdmin={isAdmin}
                  onEditMatch={onEditMatch}
                  cardRef={(node) => {
                    if (node === null) cardNodes.current.delete(match.id)
                    else cardNodes.current.set(match.id, node)
                  }}
                  rowRef={(side, node) => {
                    const key = `${match.id}:${side}`
                    if (node === null) rowNodes.current.delete(key)
                    else rowNodes.current.set(key, node)
                  }}
                />
              ))}
            </div>
          </section>
        ))}

        <section
          className="flex w-[13.5rem] shrink-0 snap-center flex-col items-center sm:w-64"
          aria-label="Campeón"
        >
          <RoundHeader label="Campeón" isHero={false} />
          <div className="flex w-full flex-1 items-center">
            <ChampionPodium
              champion={champion}
              group={champion === null ? null : groupByTeam[champion.teamId]}
              cardRef={(node) => {
                if (node === null) cardNodes.current.delete(CHAMPION_NODE)
                else cardNodes.current.set(CHAMPION_NODE, node)
              }}
            />
          </div>
        </section>

        {mvp !== null && (
          <section
            className="flex w-[13.5rem] shrink-0 snap-center flex-col items-center sm:w-64"
            aria-label="Goleador MVP"
          >
            <RoundHeader label="MVP" isHero={false} />
            <div className="flex w-full flex-1 items-center">
              <MvpPodium mvp={mvp} />
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

function RoundHeader({ label, isHero }: { label: string; isHero: boolean }): React.JSX.Element {
  const shell = isHero
    ? 'border-lime/60 bg-lime/10 shadow-[0_0_28px_-10px_rgba(197,216,109,0.85)]'
    : 'border-white/10 bg-white/[0.04]'
  // text-[#c6bbbf] y no text-neutral-400: neutral-400 sobre el panel oscuro
  // queda en 2.2:1 y no cumple WCAG AA.
  const text = isHero ? 'text-lime' : 'text-[#c6bbcf]'

  return (
    <div
      className={`mb-4 flex w-full min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl border px-3 text-center ${shell}`}
    >
      {isHero ? (
        <TrophyIcon className="size-4 shrink-0 text-lime" />
      ) : (
        <span className="size-1.5 shrink-0 rounded-full bg-cinnamon/70" />
      )}
      <span className={`text-[11px] font-bold uppercase tracking-[0.22em] ${text}`}>{label}</span>
    </div>
  )
}

function MatchCapsule({
  match,
  isHero,
  isAdmin,
  onEditMatch,
  cardRef,
  rowRef,
}: {
  match: Match
  isHero: boolean
  isAdmin: boolean
  onEditMatch?: (match: Match) => void
  cardRef: (node: HTMLElement | null) => void
  rowRef: (side: Side, node: HTMLElement | null) => void
}): React.JSX.Element {
  const finished = match.status === 'finalizado'
  const win = winnerSide(match)
  const homeId = teamId(match.homeTeamId)
  const awayId = teamId(match.awayTeamId)
  const bothKnown = homeId !== null && awayId !== null
  const played = finished && bothKnown
  const showPenalties = played && match.homePenalties !== null && match.awayPenalties !== null

  const stateFor = (side: Side): RowState => {
    const id = side === 'home' ? homeId : awayId
    if (id === null) return 'tbd'
    if (!played) return 'pending'
    return win === side ? 'winner' : 'loser'
  }

  const canEdit = isAdmin && onEditMatch !== undefined && !finished && bothKnown
  const shell = isHero
    ? `${SHELL_CARD} border-lime/50 shadow-[0_0_34px_-12px_rgba(197,216,109,0.7)]`
    : SHELL_CARD

  return (
    <div ref={cardRef} className={shell}>
      <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-[#52414c]/30 px-2.5 py-1.5">
        <Chip color={finished ? 'success' : 'default'} size="sm" className="shrink-0">
          {finished ? 'Finalizado' : 'Programado'}
        </Chip>
        <span className="truncate text-right text-[10px] font-semibold uppercase tracking-[0.16em] text-mauve-soft/80">
          {scheduleLabel(match)}
        </span>
      </div>

      <div className="divide-y divide-white/5">
        <TeamRow
          side="home"
          name={teamLabel(match.homeTeamId)}
          goals={match.homeGoals}
          penalties={showPenalties ? match.homePenalties : null}
          state={stateFor('home')}
          onNode={(node) => rowRef('home', node)}
        />
        <TeamRow
          side="away"
          name={teamLabel(match.awayTeamId)}
          goals={match.awayGoals}
          penalties={showPenalties ? match.awayPenalties : null}
          state={stateFor('away')}
          onNode={(node) => rowRef('away', node)}
        />
      </div>

      {canEdit && (
        <div className="border-t border-white/10 px-2.5 py-1.5">
          <Button
            variant="primary"
            size="sm"
            className="w-full"
            onPress={() => onEditMatch?.(match)}
          >
            Cargar resultado
          </Button>
        </div>
      )}
    </div>
  )
}

function TeamRow({
  side,
  name,
  goals,
  penalties,
  state,
  onNode,
}: {
  side: Side
  name: string
  goals: number | null
  penalties: number | null
  state: RowState
  onNode: (node: HTMLElement | null) => void
}): React.JSX.Element {
  const isWinner = state === 'winner'
  const isLoser = state === 'loser'

  const nameTone = isWinner
    ? 'font-bold text-lime'
    : state === 'pending'
      ? 'font-semibold text-[#f3efe8]/85'
      : state === 'tbd'
        ? 'font-medium italic text-mauve-soft/80'
        : 'font-medium text-mauve-soft'

  const boxTone = isWinner
    ? 'bg-lime text-coffee shadow-[0_0_18px_-4px_rgba(197,216,109,0.85)]'
    : isLoser
      ? 'border border-white/10 text-mauve-soft/70'
      : state === 'pending'
        ? 'bg-white/5 text-mauve-soft/80'
        : 'border border-dashed border-white/15 text-mauve-soft/50'

  return (
    <div
      ref={onNode}
      data-side={side}
      className={`relative flex items-center gap-2.5 px-2.5 py-2 ${isLoser ? 'opacity-40' : ''}`}
    >
      {isWinner && (
        <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-lime" />
      )}
      <TeamCrest name={name} size="sm" dimmed={isLoser} />
      <span className={`min-w-0 flex-1 truncate text-xs sm:text-sm ${nameTone}`}>{name}</span>
      <span
        className={`flex h-7 min-w-9 shrink-0 items-center justify-center gap-0.5 rounded-md px-1.5 text-sm font-black tabular-nums ${boxTone}`}
      >
        {state === 'winner' || state === 'loser' ? (
          <>
            <span>{goals ?? 0}</span>
            {penalties !== null && (
              <span className="text-[10px] font-bold opacity-70">({penalties})</span>
            )}
          </>
        ) : (
          '-'
        )}
      </span>
    </div>
  )
}

function ChampionPodium({
  champion,
  group,
  cardRef,
}: {
  champion: PlayoffData['champion']
  group: string | null
  cardRef: (node: HTMLElement | null) => void
}): React.JSX.Element {
  if (champion === null) {
    return (
      <div
        ref={cardRef}
        className="w-full rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-4 py-8 text-center backdrop-blur-sm"
      >
        <TrophyIcon className="mx-auto size-8 text-mauve-soft/40" />
        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-mauve-soft/60">
          Por coronar
        </p>
        <p className="mt-1 text-xs text-mauve-soft/40">Definido en la final</p>
      </div>
    )
  }

  const accent = teamCrestColor(champion.teamName, 0.22)

  return (
    <div
      ref={cardRef}
      className="relative w-full overflow-hidden rounded-2xl border border-[#c5d86d]/40 bg-[#1a090d]/90 bg-gradient-to-b from-lime/20 via-lime/[0.06] to-transparent px-4 py-6 text-center shadow-[0_0_30px_rgba(197,216,109,0.15)] backdrop-blur-sm"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-60"
        style={{ background: `radial-gradient(60% 100% at 50% 0%, ${accent}33, transparent)` }}
      />
      <div className="relative flex flex-col items-center gap-3">
        <TrophyIcon className="size-7 text-lime drop-shadow-[0_0_10px_rgba(197,216,109,0.7)]" />
        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-lime">Campeón</p>
        <TeamCrest name={champion.teamName} size="lg" />
        <p className="w-full truncate text-lg font-extrabold leading-tight text-white md:text-xl">
          {champion.teamName}
        </p>
        <span className="w-full truncate text-xs font-semibold text-neutral-400">
          {group ?? 'Torneo Copa 5'}
        </span>
      </div>
    </div>
  )
}

function MvpPodium({ mvp }: { mvp: TopScorerRow }): React.JSX.Element {
  const accent = teamCrestColor(mvp.teamName, 0.22)

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-[#c5d86d]/40 bg-[#1a090d]/90 bg-gradient-to-b from-lime/20 via-lime/[0.06] to-transparent px-4 py-6 text-center shadow-[0_0_30px_rgba(197,216,109,0.22)] backdrop-blur-sm">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-60"
        style={{ background: `radial-gradient(60% 100% at 50% 0%, ${accent}33, transparent)` }}
      />
      <div className="relative flex flex-col items-center gap-3">
        <StarIcon className="size-7 text-lime drop-shadow-[0_0_10px_rgba(197,216,109,0.7)]" />
        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-lime">MVP · Goleador</p>
        <p className="w-full truncate text-lg font-extrabold leading-tight text-white md:text-xl">
          {mvp.playerName}
        </p>
        <div className="flex min-w-0 items-center gap-2">
          <TeamCrest name={mvp.teamName} size="sm" />
          <span className="min-w-0 truncate text-xs font-semibold text-neutral-400">
            {mvp.teamName}
          </span>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-lime/30 bg-lime/15 px-3 py-1 text-xs font-bold text-lime">
          ⚽ {mvp.goalsCount} {mvp.goalsCount === 1 ? 'Gol' : 'Goles'}
        </span>
      </div>
    </div>
  )
}

function StarIcon({ className }: { className?: string }): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className ?? 'size-4'}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 2.4l2.72 5.66 6.18.82-4.55 4.27 1.14 6.12L12 16.92l-5.49 3.35 1.14-6.12L3.1 8.88l6.18-.82z" />
    </svg>
  )
}

function TrophyIcon({ className }: { className?: string }): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? 'size-4'}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M7 4h10v5a5 5 0 0 1-10 0z" />
      <path d="M7 6H4v1.5A3.5 3.5 0 0 0 7.5 11" />
      <path d="M17 6h3v1.5a3.5 3.5 0 0 1-3.5 3.5" />
      <path d="M12 14v3" />
      <path d="M8 20h8" />
      <path d="M9 17h6l1 3H8z" />
    </svg>
  )
}

export function PlayoffBracketPanel({
  tournamentId,
  isAdmin,
}: {
  tournamentId: string
  isAdmin: boolean
}): React.JSX.Element {
  const queryClient = useQueryClient()
  const [notice, setNotice] = useState<{ kind: 'success' | 'danger'; message: string } | null>(null)
  const [editing, setEditing] = useState<Match | null>(null)
  const [scoreError, setScoreError] = useState<string | null>(null)

  const playoffsQuery = useQuery({
    queryKey: ['playoffs', tournamentId],
    queryFn: () => getPlayoffs(tournamentId),
  })

  const standingsQuery = useQuery({
    queryKey: ['standings', tournamentId],
    queryFn: () => getStandings(tournamentId),
  })

  const teamsQuery = useQuery({
    queryKey: ['teams', tournamentId],
    queryFn: () => listTournamentTeams(tournamentId),
  })

  const topScorersQuery = useQuery({
    queryKey: ['top-scorers', tournamentId],
    queryFn: () => getTopScorers(tournamentId),
  })

  const groupByTeam = useMemo(() => {
    const map: Record<string, string> = {}
    for (const group of standingsQuery.data ?? []) {
      for (const row of group.rows) map[row.teamId] = group.group
    }
    return map
  }, [standingsQuery.data])

  const playersByTeam = useMemo(() => {
    const map: Record<string, TeamPlayer[]> = {}
    for (const team of teamsQuery.data ?? []) map[team.id] = team.players
    return map
  }, [teamsQuery.data])

  function invalidate(): void {
    void queryClient.invalidateQueries({ queryKey: ['playoffs', tournamentId] })
    void queryClient.invalidateQueries({ queryKey: ['matchdays', tournamentId] })
    void queryClient.invalidateQueries({ queryKey: ['standings', tournamentId] })
    void queryClient.invalidateQueries({ queryKey: ['stats', tournamentId] })
    void queryClient.invalidateQueries({ queryKey: ['top-scorers', tournamentId] })
  }

  const generateMutation = useMutation({
    mutationFn: () => generatePlayoffs(tournamentId),
    onSuccess: () => {
      invalidate()
      setNotice({ kind: 'success', message: 'Fase final generada. ¡A cargar los cruces!' })
    },
    onError: (err) => setNotice({ kind: 'danger', message: getErrorMessage(err) }),
  })

  const scoreMutation = useMutation({
    mutationFn: ({ id, ...input }: { id: string } & MatchResultSubmit) => updateMatchScore(id, input),
    onSuccess: () => {
      invalidate()
      setEditing(null)
      setNotice({ kind: 'success', message: 'Resultado guardado.' })
    },
    onError: (err) => setScoreError(getErrorMessage(err)),
  })

  if (playoffsQuery.isLoading) return <Loading label="Cargando fase final…" />
  if (playoffsQuery.isError) {
    return (
      <ErrorState
        message={getErrorMessage(playoffsQuery.error)}
        onRetry={() => void playoffsQuery.refetch()}
      />
    )
  }

  const bracket = playoffsQuery.data
  if (bracket === undefined) {
    return (
      <ErrorState
        message="No se pudo cargar la fase final."
        onRetry={() => void playoffsQuery.refetch()}
      />
    )
  }

  return (
    <div className="space-y-6">
      {notice !== null && (
        <Alert status={notice.kind}>
          <Alert.Description>{notice.message}</Alert.Description>
        </Alert>
      )}

      <PlayoffBracket
        bracket={bracket}
        groupByTeam={groupByTeam}
        isAdmin={isAdmin}
        isGenerating={generateMutation.isPending}
        mvp={topScorersQuery.data?.[0] ?? null}
        onGenerate={
          isAdmin && bracket.rounds.length === 0
            ? () => generateMutation.mutate()
            : undefined
        }
        onEditMatch={
          isAdmin
            ? (match) => {
                setScoreError(null)
                setEditing(match)
              }
            : undefined
        }
      />

      {editing !== null && (
        <MatchResultModal
          match={editing}
          isPending={scoreMutation.isPending}
          error={scoreError}
          playersByTeam={playersByTeam}
          onClose={() => setEditing(null)}
          onError={setScoreError}
          onSubmit={(input) => scoreMutation.mutate({ id: editing.id, ...input })}
        />
      )}
    </div>
  )
}
