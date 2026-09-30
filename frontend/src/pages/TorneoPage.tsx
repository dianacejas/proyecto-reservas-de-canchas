import { Chip, Tabs } from '@heroui/react'
import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { getMatchdays, getStandings, getTournament } from '../api'
import { getErrorMessage } from '../api/client'
import { useAuth } from '../auth/useAuth'
import ErrorState from '../components/common/ErrorState'
import Loading from '../components/common/Loading'
import TableSkeleton from '../components/common/TableSkeleton'
import FixtureList from '../components/tournament/FixtureList'
import { PlayoffBracketPanel } from '../components/tournament/PlayoffBracket'
import StandingsTable from '../components/tournament/StandingsTable'
import AdminPanel from '../components/tournament/AdminPanel'
import type { GroupStandings, TournamentStatus } from '../types'

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

  const tournamentQuery = useQuery({
    queryKey: ['tournament', id],
    queryFn: () => getTournament(id as string),
    enabled: id !== undefined,
  })

  const standingsQuery = useQuery({
    queryKey: ['standings', id],
    queryFn: () => getStandings(id as string),
    enabled: id !== undefined,
  })

  const matchdaysQuery = useQuery({
    queryKey: ['matchdays', id],
    queryFn: () => getMatchdays(id as string),
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

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/torneos"
          className="inline-flex min-h-11 items-center text-sm text-tertiary transition-colors hover:text-coffee dark:text-mauve-soft dark:hover:text-lime"
        >
          ← Torneos
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{tournament.name}</h1>
          <Chip
            color={meta.color}
            size="sm"
            className={tournament.status === 'en_curso' ? 'animate-pulse' : undefined}
          >
            {meta.label}
          </Chip>
        </div>
      </div>

      <Tabs.Root defaultSelectedKey="posiciones">
        <Tabs.List>
          <Tabs.Tab id="posiciones">Posiciones</Tabs.Tab>
          <Tabs.Tab id="fixture">Fixture</Tabs.Tab>
          <Tabs.Tab id="playoffs">Fase Final</Tabs.Tab>
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
            <p className="py-8 text-center text-sm text-tertiary dark:text-mauve-soft">
              No hay equipos inscriptos todavía.
            </p>
          ) : (
            renderStandings(standingsQuery.data ?? [])
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
            <FixtureList matchdays={matchdaysQuery.data ?? []} />
          )}
        </Tabs.Panel>

        <Tabs.Panel id="playoffs">
          {id !== undefined && <PlayoffBracketPanel tournamentId={id} isAdmin={isAdmin} />}
        </Tabs.Panel>
      </Tabs.Root>

      {isAdmin && id !== undefined && <AdminPanel tournamentId={id} />}
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
      <Tabs.List>
        {groups.map((group) => (
          <Tabs.Tab key={group.group} id={group.group}>
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