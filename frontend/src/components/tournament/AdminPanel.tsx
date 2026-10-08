import { Button, Chip } from '@heroui/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { createTeam, getMatchdays, listTournamentTeams, updateMatchScore } from '../../api'
import { getErrorMessage } from '../../api/client'
import Loading from '../common/Loading'
import ErrorState from '../common/ErrorState'
import MatchResultModal, { type MatchResultSubmit } from './MatchResultModal'
import RegistrationRequests from './RegistrationRequests'
import TeamCrest from './TeamCrest'
import type { Match, TeamPlayer, TeamRef } from '../../types'

interface NewTeamForm {
  name: string
  group: string
}

function teamLabel(team: string | TeamRef | null | undefined): string {
  if (team === null || team === undefined) return 'Sin equipo'
  return typeof team === 'object' ? team.name : 'Sin equipo'
}

export default function AdminPanel({ tournamentId }: { tournamentId: string }): React.JSX.Element {
  const queryClient = useQueryClient()
  const [team, setTeam] = useState<NewTeamForm>({ name: '', group: 'Grupo A' })
  const [formError, setFormError] = useState<string | null>(null)
  const [editingMatch, setEditingMatch] = useState<Match | null>(null)
  const [scoreError, setScoreError] = useState<string | null>(null)

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

  const playersByTeam = useMemo(() => {
    const map: Record<string, TeamPlayer[]> = {}
    for (const team of teamsQuery.data ?? []) map[team.id] = team.players
    return map
  }, [teamsQuery.data])

  const invalidateAll = (): void => {
    void queryClient.invalidateQueries({ queryKey: ['teams', tournamentId] })
    void queryClient.invalidateQueries({ queryKey: ['matchdays', tournamentId] })
    void queryClient.invalidateQueries({ queryKey: ['standings', tournamentId] })
    void queryClient.invalidateQueries({ queryKey: ['stats', tournamentId] })
    void queryClient.invalidateQueries({ queryKey: ['top-scorers', tournamentId] })
    void queryClient.invalidateQueries({ queryKey: ['playoffs', tournamentId] })
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
    mutationFn: ({ id, ...input }: { id: string } & MatchResultSubmit) => updateMatchScore(id, input),
    onSuccess: () => {
      invalidateAll()
      setEditingMatch(null)
      setScoreError(null)
    },
    onError: (err) => setScoreError(getErrorMessage(err)),
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
                <ResultRow
                  key={match.id}
                  match={match}
                  onEdit={() => {
                    setScoreError(null)
                    setEditingMatch(match)
                  }}
                />
              ))}
            </ul>
          )}
        </div>
      </div>

      {editingMatch !== null && (
        <MatchResultModal
          match={editingMatch}
          isPending={scoreMutation.isPending}
          error={scoreError}
          playersByTeam={playersByTeam}
          onClose={() => setEditingMatch(null)}
          onError={setScoreError}
          onSubmit={(input) => scoreMutation.mutate({ id: editingMatch.id, ...input })}
        />
      )}

      <div className="border-t border-line pt-5 dark:border-mauve">
        <RegistrationRequests tournamentId={tournamentId} />
      </div>
    </section>
  )
}

function ResultRow({ match, onEdit }: { match: Match; onEdit: () => void }): React.JSX.Element {
  const finished = match.status === 'finalizado'
  const local = teamLabel(match.homeTeamId)
  const visitante = teamLabel(match.awayTeamId)

  return (
    <li className="rounded-lg border border-line p-3 dark:border-mauve">
      <p className="text-xs text-tertiary dark:text-mauve-soft">
        {match.group} · Jornada {match.matchday}
      </p>
      <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="flex min-w-0 items-center gap-2">
          <TeamCrest name={local} size="xs" />
          <span className="min-w-0 truncate text-coffee/80 dark:text-mauve-soft">{local}</span>
        </span>
        <span
          className={`shrink-0 px-1 font-bold tabular-nums ${
            finished ? 'text-coffee dark:text-[#f3efe8]' : 'text-tertiary/60 dark:text-mauve-soft'
          }`}
        >
          {finished ? `${match.homeGoals ?? 0} - ${match.awayGoals ?? 0}` : 'vs'}
        </span>
        <span className="flex min-w-0 items-center gap-2">
          <span className="min-w-0 truncate text-coffee/80 dark:text-mauve-soft">{visitante}</span>
          <TeamCrest name={visitante} size="xs" />
        </span>
        <Button variant={finished ? 'outline' : 'primary'} size="sm" onPress={onEdit}>
          {finished ? 'Actualizar' : 'Cargar resultado'}
        </Button>
      </div>
    </li>
  )
}