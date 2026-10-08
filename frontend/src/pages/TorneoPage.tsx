import { Button, Chip, Tabs } from '@heroui/react'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getMatchdays, getStandings, getTournament, getTournamentStats, getTopScorers } from '../api'
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
import { buildFixtureText, buildStandingsText, slugify } from '../utils/tournamentExport'
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
  const [showRegistration, setShowRegistration] = useState(false)

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

  const statsQuery = useQuery({
    queryKey: ['stats', id],
    queryFn: () => getTournamentStats(id as string),
    enabled: id !== undefined,
  })

  const topScorersQuery = useQuery({
    queryKey: ['top-scorers', id],
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
        {!isAdmin && tournament.status === 'inscripcion' && (
          <Button
            variant="primary"
            className="mt-3 min-h-11"
            onPress={() => setShowRegistration(true)}
          >
            Inscribir mi Equipo
          </Button>
        )}
      </div>

      <Tabs.Root defaultSelectedKey="posiciones">
        <Tabs.List>
          <Tabs.Tab id="posiciones">Posiciones</Tabs.Tab>
          <Tabs.Tab id="goleadores">Goleadores</Tabs.Tab>
          <Tabs.Tab id="sanciones">Sanciones</Tabs.Tab>
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
            <div className="space-y-3">
              <div className="flex justify-end">
                <ExportBar
                  text={buildStandingsText(tournament.name, standingsQuery.data ?? [])}
                  filename={`posiciones-${slugify(tournament.name)}.txt`}
                />
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
            <TopScorersTab rows={topScorersQuery.data ?? []} />
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
                  <ExportBar
                    text={buildFixtureText(tournament.name, matchdaysQuery.data ?? [])}
                    filename={`fixture-${slugify(tournament.name)}.txt`}
                  />
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