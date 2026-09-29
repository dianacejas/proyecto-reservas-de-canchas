import { Button, Chip } from '@heroui/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { createTeam, getMatchdays, listTournamentTeams, updateMatchScore } from '../../api'
import { getErrorMessage } from '../../api/client'
import Loading from '../common/Loading'
import ErrorState from '../common/ErrorState'
import type { Match } from '../../types'

interface NewTeamForm {
  name: string
  group: string
}

export default function AdminPanel({ tournamentId }: { tournamentId: string }): React.JSX.Element {
  const queryClient = useQueryClient()
  const [team, setTeam] = useState<NewTeamForm>({ name: '', group: 'Grupo A' })
  const [formError, setFormError] = useState<string | null>(null)

  const teamsQuery = useQuery({
    queryKey: ['teams', tournamentId],
    queryFn: () => listTournamentTeams(tournamentId),
  })

  const matchdaysQuery = useQuery({
    queryKey: ['matchdays', tournamentId],
    queryFn: () => getMatchdays(tournamentId),
  })

  const groups = useMemo(() => {
    const seen = new Map<string, number>()
    for (const team of teamsQuery.data ?? []) {
      seen.set(team.group, (seen.get(team.group) ?? 0) + 1)
    }
    return [...seen.entries()].sort(([a], [b]) => a.localeCompare(b))
  }, [teamsQuery.data])

  const invalidateAll = (): void => {
    void queryClient.invalidateQueries({ queryKey: ['teams', tournamentId] })
    void queryClient.invalidateQueries({ queryKey: ['matchdays', tournamentId] })
    void queryClient.invalidateQueries({ queryKey: ['standings', tournamentId] })
  }

  const teamMutation = useMutation({
    mutationFn: () =>
      createTeam({ name: team.name.trim(), tournamentId, group: team.group.trim() || 'Grupo A' }),
    onSuccess: () => {
      setTeam({ name: '', group: team.group })
      setFormError(null)
      invalidateAll()
    },
    onError: (err) => setFormError(getErrorMessage(err)),
  })

  const scoreMutation = useMutation({
    mutationFn: ({ id, homeGoals, awayGoals }: { id: string; homeGoals: number; awayGoals: number }) =>
      updateMatchScore(id, { homeGoals, awayGoals }),
    onSuccess: () => invalidateAll(),
    onError: (err) => setFormError(getErrorMessage(err)),
  })

  const matches = (matchdaysQuery.data ?? []).flatMap((matchday) => matchday.matches)

  return (
    <section className="space-y-6 rounded-2xl border border-line bg-cream p-5 shadow-surface dark:border-mauve dark:bg-coffee-elev">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-tertiary dark:text-mauve-soft">
          Administrar torneo
        </h2>
        <p className="mt-0.5 text-xs text-tertiary dark:text-mauve-soft">
          Agregá equipos y cargá los resultados de cada partido.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-coffee dark:text-[#f3efe8]">Equipos</h3>
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={team.name}
              onChange={(event) => setTeam({ ...team, name: event.target.value })}
              placeholder="Nombre del equipo"
              className="w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-coffee outline-none transition-colors focus:border-lime dark:border-mauve dark:bg-coffee-elev dark:text-[#f3efe8]"
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={team.group}
                onChange={(event) => setTeam({ ...team, group: event.target.value })}
                list="team-groups"
                placeholder="Grupo"
                className="w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-coffee outline-none transition-colors focus:border-lime dark:border-mauve dark:bg-coffee-elev dark:text-[#f3efe8]"
              />
              <datalist id="team-groups">
                {groups.map(([group]) => (
                  <option key={group} value={group} />
                ))}
              </datalist>
              <Button
                variant="primary"
                isDisabled={teamMutation.isPending || team.name.trim().length === 0}
                onPress={() => teamMutation.mutate()}
              >
                {teamMutation.isPending ? 'Agregando…' : 'Agregar'}
              </Button>
            </div>
          </div>
          {formError !== null && (
            <Chip color="danger" size="sm" className="h-auto py-1">
              {formError}
            </Chip>
          )}
          {teamsQuery.isLoading ? (
            <Loading label="Cargando equipos…" />
          ) : teamsQuery.isError ? (
            <ErrorState message={getErrorMessage(teamsQuery.error)} onRetry={() => void teamsQuery.refetch()} />
          ) : (teamsQuery.data ?? []).length === 0 ? (
            <p className="py-4 text-center text-sm text-tertiary dark:text-mauve-soft">Todavía no hay equipos.</p>
          ) : (
            <div className="space-y-1.5">
              {groups.map(([group, count]) => (
                <div key={group} className="rounded-lg border border-line p-3 dark:border-mauve">
                  <p className="text-xs font-semibold uppercase tracking-wide text-tertiary dark:text-mauve-soft">
                    {group} ({count})
                  </p>
                  <ul className="mt-1 space-y-0.5 text-sm">
                    {(teamsQuery.data ?? [])
                      .filter((item) => item.group === group)
                      .map((item) => (
                        <li key={item.id} className="text-coffee/80 dark:text-mauve-soft">
                          {item.name}
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-coffee dark:text-[#f3efe8]">Resultados</h3>
          {matches.length === 0 ? (
            <p className="py-8 text-center text-sm text-tertiary dark:text-mauve-soft">
              El fixture aún no fue generado. No hay partidos para cargar.
            </p>
          ) : (
            <ul className="space-y-2">
              {matches.map((match) => (
                <ScoreRow
                  key={match.id}
                  match={match}
                  isPending={scoreMutation.isPending}
                  onSave={(homeGoals, awayGoals) => scoreMutation.mutate({ id: match.id, homeGoals, awayGoals })}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}

function ScoreRow({
  match,
  isPending,
  onSave,
}: {
  match: Match
  isPending: boolean
  onSave: (homeGoals: number, awayGoals: number) => void
}): React.JSX.Element {
  const [home, setHome] = useState(match.homeGoals ?? 0)
  const [away, setAway] = useState(match.awayGoals ?? 0)
  const finished = match.status === 'finalizado'

  const localName =
    typeof match.homeTeamId === 'string' ? 'Local' : (match.homeTeamId?.name ?? 'Local')
  const visitanteName =
    typeof match.awayTeamId === 'string' ? 'Visitante' : (match.awayTeamId?.name ?? 'Visitante')

  function handleSave(): void {
    onSave(Math.max(0, Math.floor(Number(home) || 0)), Math.max(0, Math.floor(Number(away) || 0)))
  }

  return (
    <li className="rounded-lg border border-line p-3 dark:border-mauve">
<p className="text-xs text-tertiary dark:text-mauve-soft">
        {match.group} · Jornada {match.matchday}
      </p>
      <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
        <span className="flex-1 text-coffee/80 dark:text-mauve-soft">{localName}</span>
        <input
          type="number"
          min="0"
          value={home}
          onChange={(event) => setHome(Number(event.target.value))}
          className="w-14 rounded-lg border border-line bg-cream px-2 py-1 text-center text-sm text-coffee outline-none focus:border-lime dark:border-mauve dark:bg-coffee-elev dark:text-[#f3efe8]"
          aria-label={`Goles de ${localName}`}
        />
        <span className="text-tertiary/60 dark:text-mauve-soft">-</span>
        <input
          type="number"
          min="0"
          value={away}
          onChange={(event) => setAway(Number(event.target.value))}
          className="w-14 rounded-lg border border-line bg-cream px-2 py-1 text-center text-sm text-coffee outline-none focus:border-lime dark:border-mauve dark:bg-coffee-elev dark:text-[#f3efe8]"
          aria-label={`Goles de ${visitanteName}`}
        />
        <span className="flex-1 text-right text-coffee/80 dark:text-mauve-soft">{visitanteName}</span>
        <Button variant={finished ? 'outline' : 'primary'} size="sm" isDisabled={isPending} onPress={handleSave}>
          {finished ? 'Actualizar' : 'Guardar'}
        </Button>
      </div>
    </li>
  )
}