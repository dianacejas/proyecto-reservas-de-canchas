import { Button, Chip, Tabs } from '@heroui/react'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getMatchdays, getStandings, getTournament, getTournamentStats, getTopScorers, queryKeys } from '../api'
import { getErrorMessage } from '../api/client'
import { useAuth } from '../auth/useAuth'
import ErrorState from '../components/common/ErrorState'
import Loading from '../components/common/Loading'
import TableSkeleton from '../components/common/TableSkeleton'
import ExportBar from '../components/tournament/ExportBar'
import FixtureList from '../components/tournament/FixtureList'
import { PlayoffBracketPanel } from '../components/tournament/PlayoffBracket'
import SanctionsList from '../components/tournament/SanctionsList'
import TopScorersTab from '../components/tournament/TopScorersTab'
import StandingsTable from '../components/tournament/StandingsTable'
import TournamentRegistrationModal from '../components/tournament/TournamentRegistrationModal'
import AdminPanel from '../components/tournament/AdminPanel'
import { buildFixtureText, buildStandingsText } from '../utils/tournamentExport'
import { PILL_TAB_CLASS, PILL_TAB_LIST_CLASS } from '../utils/tabs'
import { CalendarIcon, ClockIcon, StadiumIcon, SwordsIcon, TrophyIcon } from '../components/common/Icons'
import TeamCrest from '../components/tournament/TeamCrest'
import type { GroupStandings, Match, TeamRef, TournamentStatus } from '../types'

const STATUS_META: Record<
  TournamentStatus,
  { label: string; color: 'success' | 'warning' | 'danger' }
> = {
  inscripcion: { label: 'Inscripción', color: 'warning' },
  en_curso: { label: 'En curso', color: 'success' },
  finalizado: { label: 'Finalizado', color: 'danger' },
}

export default function TorneoPage(): React.JSX.Element {
  const { id } = useParams<{ id: string }>()
  const { isAdmin } = useAuth()
  const [showRegistration, setShowRegistration] = useState(false)

  const tournamentQuery = useQuery({
    queryKey: queryKeys.tournament(id ?? ''),
    queryFn: () => getTournament(id as string),
    enabled: id !== undefined,
  })

  const standingsQuery = useQuery({
    queryKey: queryKeys.tournamentStandings(id ?? ''),
    queryFn: () => getStandings(id as string),
    enabled: id !== undefined,
  })

  const matchdaysQuery = useQuery({
    queryKey: queryKeys.tournamentMatchdays(id ?? ''),
    queryFn: () => getMatchdays(id as string),
    enabled: id !== undefined,
  })

  const statsQuery = useQuery({
    queryKey: queryKeys.tournamentStats(id ?? ''),
    queryFn: () => getTournamentStats(id as string),
    enabled: id !== undefined,
  })

  const topScorersQuery = useQuery({
    queryKey: queryKeys.tournamentTopScorers(id ?? ''),
    queryFn: () => getTopScorers(id as string),
    enabled: id !== undefined,
  })

  if (tournamentQuery.isLoading) return <Loading label="Cargando torneo…" />
  if (tournamentQuery.isError) {
    return (
      <ErrorState
        message={getErrorMessage(tournamentQuery.error)}
        onRetry={() => void tournamentQuery.refetch()}
      />
    )
  }

  const tournament = tournamentQuery.data
  if (tournament === undefined) {
    return (
      <ErrorState
        message="El torneo no fue encontrado."
        onRetry={() => void tournamentQuery.refetch()}
      />
    )
  }
  const meta = STATUS_META[tournament.status]
  const allMatches: Match[] = (matchdaysQuery.data ?? []).flatMap((md) => md.matches)
  const featuredMatch: Match | undefined =
    allMatches.find((m) => m.status === 'programado' && m.homeTeamId && m.awayTeamId) ??
    allMatches[allMatches.length - 1]

  return (
    <div className="w-full space-y-6">
      {/* Hero Banner del Torneo */}
      <section className="relative overflow-hidden rounded-3xl border border-neutral-800/90 bg-neutral-950 px-6 py-8 shadow-2xl sm:px-8 sm:py-10">
        <img
          src="/images/canchas/nocturna.jpg"
          alt={`Cancha nocturna — ${tournament.name}`}
          className="absolute inset-0 h-full w-full object-cover object-center opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/85 to-neutral-950/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-neutral-950/50" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(197,216,109,0.16),transparent_60%)]" />

        <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <Link
              to="/torneos"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-400 transition-colors hover:text-[#c5d86d]"
            >
              ← Volver a Torneos
            </Link>

            <div className="flex flex-wrap items-center gap-3.5">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-[#c5d86d]/35 bg-[#c5d86d]/15 text-[#c5d86d] shadow-[0_0_20px_rgba(197,216,109,0.15)]">
                <TrophyIcon className="size-6" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">
                    {tournament.name}
                  </h1>
                  <Chip
                    color={meta.color}
                    size="sm"
                    className={`border border-[#c5d86d]/30 px-2.5 font-extrabold ${
                      tournament.status === 'en_curso' ? 'animate-pulse' : ''
                    }`}
                  >
                    {meta.label}
                  </Chip>
                </div>
                <p className="mt-1.5 text-xs font-medium text-neutral-300 sm:text-sm">
                  Competencia oficial Copa 5 · Posiciones, goleadores, sanciones y fixture en vivo.
                </p>
              </div>
            </div>
          </div>

          {!isAdmin && tournament.status === 'inscripcion' && (
            <Button
              variant="primary"
              className="min-h-11 shrink-0 rounded-xl bg-[#c5d86d] px-6 font-black text-neutral-950 shadow-[0_0_20px_rgba(197,216,109,0.2)] transition-all hover:bg-[#b5c85d]"
              onPress={() => setShowRegistration(true)}
            >
              Inscribir mi Equipo
            </Button>
          )}
        </div>
      </section>

      {/* Banner Broadcast: Partido Destacado de la Fecha */}
      {featuredMatch !== undefined && (
        <FeaturedMatchBanner match={featuredMatch} />
      )}

      <Tabs.Root defaultSelectedKey="posiciones">
        <Tabs.List className={PILL_TAB_LIST_CLASS}>
          <Tabs.Tab id="posiciones" className={PILL_TAB_CLASS}>Posiciones</Tabs.Tab>
          <Tabs.Tab id="goleadores" className={PILL_TAB_CLASS}>Goleadores</Tabs.Tab>
          <Tabs.Tab id="sanciones" className={PILL_TAB_CLASS}>Sanciones</Tabs.Tab>
          <Tabs.Tab id="fixture" className={PILL_TAB_CLASS}>Fixture</Tabs.Tab>
          <Tabs.Tab id="playoffs" className={PILL_TAB_CLASS}>Fase Final</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel id="posiciones">
          {standingsQuery.isLoading ? (
            <TableSkeleton label="Calculando posiciones" />
          ) : standingsQuery.isError ? (
            <ErrorState
              message={getErrorMessage(standingsQuery.error)}
              onRetry={() => void standingsQuery.refetch()}
            />
          ) : standingsQuery.data !== undefined && standingsQuery.data.length === 0 ? (
            <p className="py-8 text-center text-sm text-neutral-400">
              No hay equipos inscriptos todavía.
            </p>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-end">
                <ExportBar text={buildStandingsText(tournament.name, standingsQuery.data ?? [])} />
              </div>
              {renderStandings(standingsQuery.data ?? [])}
            </div>
          )}
        </Tabs.Panel>

        <Tabs.Panel id="goleadores">
          {topScorersQuery.isLoading ? (
            <TableSkeleton label="Calculando goleadores" />
          ) : topScorersQuery.isError ? (
            <ErrorState
              message={getErrorMessage(topScorersQuery.error)}
              onRetry={() => void topScorersQuery.refetch()}
            />
          ) : (
            <TopScorersTab rows={topScorersQuery.data ?? []} tournamentId={tournament.id} />
          )}
        </Tabs.Panel>

        <Tabs.Panel id="sanciones">
          {statsQuery.isLoading ? (
            <TableSkeleton label="Calculando sanciones" />
          ) : statsQuery.isError ? (
            <ErrorState
              message={getErrorMessage(statsQuery.error)}
              onRetry={() => void statsQuery.refetch()}
            />
          ) : (
            <SanctionsList rows={statsQuery.data?.sanctions ?? []} />
          )}
        </Tabs.Panel>

        <Tabs.Panel id="fixture">
          {matchdaysQuery.isLoading ? (
            <TableSkeleton label="Cargando fixture" />
          ) : matchdaysQuery.isError ? (
            <ErrorState
              message={getErrorMessage(matchdaysQuery.error)}
              onRetry={() => void matchdaysQuery.refetch()}
            />
          ) : (
            <div className="space-y-3">
              {(matchdaysQuery.data ?? []).length > 0 && (
                <div className="flex justify-end">
                  <ExportBar text={buildFixtureText(tournament.name, matchdaysQuery.data ?? [])} />
                </div>
              )}
              <FixtureList matchdays={matchdaysQuery.data ?? []} />
            </div>
          )}
        </Tabs.Panel>

        <Tabs.Panel id="playoffs">
          {id !== undefined && <PlayoffBracketPanel tournamentId={id} isAdmin={isAdmin} />}
        </Tabs.Panel>
      </Tabs.Root>

      {showRegistration && id !== undefined && (
        <TournamentRegistrationModal tournamentId={id} onClose={() => setShowRegistration(false)} />
      )}

      {isAdmin && id !== undefined && (
        <AdminPanel
          tournamentId={id}
          tournamentName={tournament.name}
          tournamentStatus={tournament.status}
        />
      )}

    </div>
  )
}

function teamRefLabel(team: string | TeamRef | null | undefined): string {
  if (!team) return 'Por definirse'
  return typeof team === 'object' ? team.name : 'Equipo'
}

function FeaturedMatchBanner({ match }: { match: Match }): React.JSX.Element {
  const home = teamRefLabel(match.homeTeamId)
  const away = teamRefLabel(match.awayTeamId)
  const isFinished = match.status === 'finalizado'
  const schedule = match.bookingId
  const courtName =
    schedule && schedule.fieldId && typeof schedule.fieldId === 'object'
      ? schedule.fieldId.name
      : null

  return (
    <div className="relative overflow-hidden rounded-3xl border bg-neutral-950 p-5 text-white shadow-lg sm:p-6 border-white/10">
      <div className="pointer-events-none absolute -right-10 -top-10 size-48 rounded-full bg-[#c5d86d]/15 blur-3xl" />
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3 text-xs">
        <span className="inline-flex items-center gap-1.5 font-bold uppercase tracking-widest text-[#c5d86d]">
          <SwordsIcon className="size-4" />
          Partido Destacado · Fecha {match.matchday} ({match.group})
        </span>
        <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-bold text-neutral-200">
          {isFinished ? 'Resultado Final' : 'Próximo Encuentro'}
        </span>
      </div>

      <div className="relative z-10 mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6">
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-end">
          <span className="truncate text-sm font-black sm:text-lg">{home}</span>
          <TeamCrest name={home} size="md" />
        </div>

        <div className="rounded-2xl border border-[#c5d86d]/30 bg-[#c5d86d]/15 px-4 py-2 text-center">
          <span className="font-mono text-xl font-black text-[#c5d86d] sm:text-2xl">
            {isFinished ? `${match.homeGoals ?? 0} - ${match.awayGoals ?? 0}` : 'VS'}
          </span>
        </div>

        <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-start">
          <TeamCrest name={away} size="md" />
          <span className="truncate text-sm font-black sm:text-lg">{away}</span>
        </div>
      </div>

      {(schedule?.startTime || courtName) && (
        <div className="relative z-10 mt-4 flex flex-wrap items-center justify-center gap-4 border-t border-white/10 pt-3 text-xs text-neutral-300">
          {schedule?.date && (
            <span className="inline-flex items-center gap-1.5">
              <CalendarIcon className="size-3.5 text-[#c5d86d]" />
              {String(schedule.date).slice(0, 10)}
            </span>
          )}
          {schedule?.startTime && (
            <span className="inline-flex items-center gap-1.5">
              <ClockIcon className="size-3.5 text-[#c5d86d]" />
              {schedule.startTime} hs
            </span>
          )}
          {courtName && (
            <span className="inline-flex items-center gap-1.5">
              <StadiumIcon className="size-3.5 text-[#c5d86d]" />
              {courtName}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

function renderStandings(groups: GroupStandings[]): React.JSX.Element {
  if (groups.length === 1) {
    return <StandingsTable rows={groups[0].rows} />
  }
  const groupsKey = groups.map((group) => group.group).join(',')
  return (
    <Tabs.Root key={groupsKey} defaultSelectedKey={groups[0].group}>
      <Tabs.List className={PILL_TAB_LIST_CLASS}>
        {groups.map((group) => (
          <Tabs.Tab key={group.group} id={group.group} className={PILL_TAB_CLASS}>
            {group.group}
          </Tabs.Tab>
        ))}
      </Tabs.List>
      {groups.map((group) => (
        <Tabs.Panel key={group.group} id={group.group}>
          <StandingsTable rows={group.rows} />
        </Tabs.Panel>
      ))}
    </Tabs.Root>
  )
}