import { Card, Chip } from '@heroui/react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { listTournaments } from '../api'
import { getErrorMessage } from '../api/client'
import ErrorState from '../components/common/ErrorState'
import Loading from '../components/common/Loading'
import type { TournamentStatus } from '../types'

const STATUS_META: Record<
  TournamentStatus,
  { label: string; color: 'success' | 'warning' | 'danger' }
> = {
  inscripcion: { label: 'Inscripción', color: 'warning' },
  en_curso: { label: 'En curso', color: 'success' },
  finalizado: { label: 'Finalizado', color: 'danger' },
}

export default function TorneosPage(): React.JSX.Element {
  const navigate = useNavigate()
  const tournamentsQuery = useQuery({ queryKey: ['tournaments'], queryFn: listTournaments })

  if (tournamentsQuery.isLoading) return <Loading label="Cargando torneos…" />
  if (tournamentsQuery.isError) {
    return (
      <ErrorState
        message={getErrorMessage(tournamentsQuery.error)}
        onRetry={() => void tournamentsQuery.refetch()}
      />
    )
  }

  const tournaments = tournamentsQuery.data ?? []

  return (
    <div className="space-y-8">
      <header>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-mauve/30 bg-lime/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-coffee dark:border-lime/30 dark:bg-lime/10 dark:text-lime">
          Copa 5 · Competencia
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Torneos</h1>
        <p className="mt-1 text-sm text-tertiary dark:text-mauve-soft">
          Seguí las posiciones y el fixture de cada torneo.
        </p>
      </header>

      {tournaments.length === 0 ? (
        <p className="py-8 text-center text-sm text-tertiary dark:text-mauve-soft">
          Todavía no hay torneos creados.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((tournament) => {
            const meta = STATUS_META[tournament.status]
            const info = [
              tournament.teamsCount !== undefined ? `${tournament.teamsCount} equipos` : null,
              tournament.matchesCount !== undefined
                ? `${tournament.matchesCount} partidos`
                : null,
            ]
              .filter((item): item is string => item !== null)
              .join(' · ')
            return (
              <Card.Root
                key={tournament.id}
                className="cursor-pointer bg-cream shadow-surface transition-all hover:-translate-y-0.5 hover:ring-2 hover:ring-lime/70 dark:bg-coffee-elev dark:ring-transparent dark:hover:ring-lime/70"
                onClick={() => navigate(`/torneos/${tournament.id}`)}
              >
                <Card.Content className="space-y-2 p-5">
                  <div className="flex items-center justify-between gap-2">
                    <Card.Title className="text-base">{tournament.name}</Card.Title>
                    <Chip color={meta.color} size="sm">
                      {meta.label}
                    </Chip>
                  </div>
                  <Card.Description className="text-sm text-tertiary dark:text-mauve-soft">
                    {info.length > 0 ? info : 'Ver detalle'}
                  </Card.Description>
                </Card.Content>
              </Card.Root>
            )
          })}
        </div>
      )}
    </div>
  )
}