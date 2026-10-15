import { Button, Chip, Modal, Tabs } from '@heroui/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import {
  createMatch,
  createTeam,
  getMatchdays,
  listTournamentTeams,
  updateMatchScore,
  updateTournament,
  updateTeamPlayers,
} from '../../api'
import { getErrorMessage } from '../../api/client'
import Loading from '../common/Loading'
import ErrorState from '../common/ErrorState'
import { ComboBoxInput, SelectInput, TextInput } from '../common/fields'
import MatchResultModal, { type MatchResultSubmit } from './MatchResultModal'
import RegistrationRequests from './RegistrationRequests'
import TeamCrest from './TeamCrest'
import type { Match, Team, TeamPlayer, TeamRef, TournamentStatus } from '../../types'
import { PILL_TAB_CLASS, PILL_TAB_LIST_CLASS } from '../../utils/tabs'

/* ---------- helpers ---------- */

function teamLabel(team: string | TeamRef | null | undefined): string {
  if (team === null || team === undefined) return 'Sin equipo'
  return typeof team === 'object' ? team.name : 'Sin equipo'
}

function teamId(team: string | TeamRef | null | undefined): string | null {
  if (team === null || team === undefined) return null
  return typeof team === 'object' ? team.id : team
}

/** Genera todos los emparejamientos round-robin para una lista de equipos */
function roundRobinPairs(teams: Team[]): { home: Team; away: Team }[] {
  const n = teams.length
  if (n < 2) return []
  // Algoritmo de rotación circular (Berger tables)
  const list = [...teams]
  if (n % 2 !== 0) list.push({ id: 'bye', name: 'Libre' } as Team)
  const m = list.length
  const pairs: { home: Team; away: Team }[] = []
  for (let round = 0; round < m - 1; round++) {
    for (let i = 0; i < m / 2; i++) {
      const home = list[i]
      const away = list[m - 1 - i]
      if (home.id !== 'bye' && away.id !== 'bye') {
        pairs.push({ home, away })
      }
    }
    // Rotar: fijar primer elemento, rotar el resto
    list.splice(1, 0, list.pop()!)
  }
  return pairs
}

const STATUS_LABEL: Record<TournamentStatus, string> = {
  inscripcion: 'Inscripción abierta',
  en_curso: 'En curso',
  finalizado: 'Finalizado',
}

/* ======================================================================
   AdminPanel principal
   ====================================================================== */

export default function AdminPanel({
  tournamentId,
  tournamentName,
  tournamentStatus,
}: {
  tournamentId: string
  tournamentName: string
  tournamentStatus: TournamentStatus
}): React.JSX.Element {
  const queryClient = useQueryClient()

  const invalidateAll = (): void => {
    void queryClient.invalidateQueries({ queryKey: ['teams', tournamentId] })
    void queryClient.invalidateQueries({ queryKey: ['matchdays', tournamentId] })
    void queryClient.invalidateQueries({ queryKey: ['standings', tournamentId] })
    void queryClient.invalidateQueries({ queryKey: ['stats', tournamentId] })
    void queryClient.invalidateQueries({ queryKey: ['top-scorers', tournamentId] })
    void queryClient.invalidateQueries({ queryKey: ['playoffs', tournamentId] })
    void queryClient.invalidateQueries({ queryKey: ['tournament', tournamentId] })
    void queryClient.invalidateQueries({ queryKey: ['tournaments'] })
  }

  return (
    <section className="space-y-4 rounded-2xl border border-line bg-cream p-5 shadow-surface dark:border-mauve dark:bg-coffee-elev">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-tertiary dark:text-mauve-soft">
          Panel de administración
        </h2>
        <p className="mt-0.5 text-xs text-tertiary dark:text-mauve-soft">
          Gestioná equipos, fixture y resultados del torneo.
        </p>
      </div>

      <Tabs.Root defaultSelectedKey="config">
        <Tabs.List className={PILL_TAB_LIST_CLASS}>
          <Tabs.Tab id="config" className={PILL_TAB_CLASS}>Configuración</Tabs.Tab>
          <Tabs.Tab id="equipos" className={PILL_TAB_CLASS}>Equipos</Tabs.Tab>
          <Tabs.Tab id="fixture" className={PILL_TAB_CLASS}>Fixture</Tabs.Tab>
          <Tabs.Tab id="inscripciones" className={PILL_TAB_CLASS}>Inscripciones</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel id="config">
          <ConfigTab
            tournamentId={tournamentId}
            tournamentName={tournamentName}
            tournamentStatus={tournamentStatus}
            onSaved={invalidateAll}
          />
        </Tabs.Panel>

        <Tabs.Panel id="equipos">
          <EquiposTab tournamentId={tournamentId} onChanged={invalidateAll} />
        </Tabs.Panel>

        <Tabs.Panel id="fixture">
          <FixtureTab tournamentId={tournamentId} onChanged={invalidateAll} />
        </Tabs.Panel>

        <Tabs.Panel id="inscripciones">
          <RegistrationRequests tournamentId={tournamentId} />
        </Tabs.Panel>
      </Tabs.Root>
    </section>
  )
}

/* ======================================================================
   Pestaña: Configuración (nombre + estado)
   ====================================================================== */

function ConfigTab({
  tournamentId,
  tournamentName,
  tournamentStatus,
  onSaved,
}: {
  tournamentId: string
  tournamentName: string
  tournamentStatus: TournamentStatus
  onSaved: () => void
}): React.JSX.Element {
  const [name, setName] = useState(tournamentName)
  const [status, setStatus] = useState<TournamentStatus>(tournamentStatus)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const mutation = useMutation({
    mutationFn: () => updateTournament(tournamentId, { name: name.trim(), status }),
    onSuccess: () => {
      setError(null)
      setSaved(true)
      onSaved()
      setTimeout(() => setSaved(false), 2500)
    },
    onError: (err) => setError(getErrorMessage(err)),
  })

  const hasChanges = name.trim() !== tournamentName || status !== tournamentStatus

  return (
    <div className="mt-4 space-y-4">
      <TextInput
        label="Nombre del torneo"
        value={name}
        onValueChange={(value) => { setName(value); setSaved(false) }}
      />

      <div className="space-y-1.5">
        <SelectInput
          label="Estado"
          value={status}
          onValueChange={(value) => { setStatus(value as TournamentStatus); setSaved(false) }}
          options={(Object.keys(STATUS_LABEL) as TournamentStatus[]).map((s) => ({
            key: s,
            label: STATUS_LABEL[s],
          }))}
        />
        <p className="text-xs text-tertiary dark:text-mauve-soft">
          Cambiá a <strong>Inscripción</strong> para aceptar solicitudes, <strong>En curso</strong> para empezar a jugar o <strong>Finalizado</strong> para cerrar el torneo.
        </p>
      </div>

      {error !== null && (
        <Chip color="danger" size="sm" className="h-auto py-1">{error}</Chip>
      )}
      {saved && (
        <Chip color="success" size="sm" className="h-auto py-1">✓ Cambios guardados</Chip>
      )}

      <Button
        variant="primary"
        isDisabled={mutation.isPending || !hasChanges || name.trim().length === 0}
        onPress={() => mutation.mutate()}
      >
        {mutation.isPending ? 'Guardando…' : 'Guardar cambios'}
      </Button>
    </div>
  )
}

/* ======================================================================
   Pestaña: Equipos y Planteles
   ====================================================================== */

function EquiposTab({
  tournamentId,
  onChanged,
}: {
  tournamentId: string
  onChanged: () => void
}): React.JSX.Element {
  const [newTeamName, setNewTeamName] = useState('')
  const [newTeamGroup, setNewTeamGroup] = useState('Grupo A')
  const [formError, setFormError] = useState<string | null>(null)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)

  const teamsQuery = useQuery({
    queryKey: ['teams', tournamentId],
    queryFn: () => listTournamentTeams(tournamentId),
  })

  const groups = useMemo(() => {
    const seen = new Map<string, number>()
    for (const t of teamsQuery.data ?? []) seen.set(t.group, (seen.get(t.group) ?? 0) + 1)
    return [...seen.entries()].sort(([a], [b]) => a.localeCompare(b))
  }, [teamsQuery.data])

  const teamMutation = useMutation({
    mutationFn: () =>
      createTeam({ name: newTeamName.trim(), tournamentId, group: newTeamGroup.trim() || 'Grupo A' }),
    onSuccess: () => {
      setNewTeamName('')
      setFormError(null)
      onChanged()
    },
    onError: (err) => setFormError(getErrorMessage(err)),
  })

  if (teamsQuery.isLoading) return <Loading label="Cargando equipos…" />
  if (teamsQuery.isError) {
    return <ErrorState message={getErrorMessage(teamsQuery.error)} onRetry={() => void teamsQuery.refetch()} />
  }

  return (
    <div className="mt-4 space-y-5">
      {/* Formulario agregar equipo */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-coffee dark:text-[#f3efe8]">Agregar equipo</h3>
        <div className="flex flex-wrap gap-3">
          <TextInput
            aria-label="Nombre del equipo"
            className="min-w-40 flex-1"
            value={newTeamName}
            onValueChange={setNewTeamName}
            placeholder="Nombre del equipo"
          />
          <ComboBoxInput
            aria-label="Grupo"
            className="w-32"
            fullWidth={false}
            value={newTeamGroup}
            onValueChange={setNewTeamGroup}
            options={groups.map(([g]) => g)}
            placeholder="Grupo"
          />
          <Button
            variant="primary"
            isDisabled={teamMutation.isPending || newTeamName.trim().length === 0}
            onPress={() => teamMutation.mutate()}
          >
            {teamMutation.isPending ? 'Agregando…' : 'Agregar'}
          </Button>
        </div>
        {formError !== null && (
          <Chip color="danger" size="sm" className="h-auto py-1">{formError}</Chip>
        )}
      </div>

      {/* Lista por grupo */}
      {(teamsQuery.data ?? []).length === 0 ? (
        <p className="py-4 text-center text-sm text-tertiary dark:text-mauve-soft">
          Todavía no hay equipos.
        </p>
      ) : (
        <div className="space-y-3">
          {groups.map(([group, count]) => (
            <div key={group} className="rounded-lg border border-line p-3 dark:border-mauve">
              <p className="text-xs font-semibold uppercase tracking-wide text-tertiary dark:text-mauve-soft">
                {group} ({count})
              </p>
              <ul className="mt-2 space-y-1.5">
                {(teamsQuery.data ?? [])
                  .filter((t) => t.group === group)
                  .map((t) => (
                    <li key={t.id} className="flex items-center justify-between gap-2 text-sm">
                      <span className="flex items-center gap-2 text-coffee/80 dark:text-mauve-soft">
                        <TeamCrest name={t.name} size="xs" />
                        {t.name}
                        <span className="text-xs text-tertiary">
                          ({t.players.length} jugadores)
                        </span>
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onPress={() => setEditingTeam(t)}
                      >
                        Editar plantel
                      </Button>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {editingTeam !== null && (
        <PlayersModal
          team={editingTeam}
          onClose={() => setEditingTeam(null)}
          onSaved={() => { onChanged(); setEditingTeam(null) }}
        />
      )}
    </div>
  )
}

/* ---------- Modal edición de plantel ---------- */

function PlayersModal({
  team,
  onClose,
  onSaved,
}: {
  team: Team
  onClose: () => void
  onSaved: () => void
}): React.JSX.Element {
  const [players, setPlayers] = useState<{ name: string; number: string }[]>(
    team.players.length > 0
      ? team.players.map((p) => ({ name: p.name, number: String(p.number) }))
      : [{ name: '', number: '' }]
  )
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () =>
      updateTeamPlayers(
        team.id,
        players
          .filter((p) => p.name.trim().length > 0)
          .map((p) => ({ name: p.name.trim(), number: parseInt(p.number) || 0 }))
      ),
    onSuccess: onSaved,
    onError: (err) => setError(getErrorMessage(err)),
  })

  function updatePlayer(i: number, field: 'name' | 'number', value: string): void {
    setPlayers((prev) => {
      const next = [...prev]
      next[i] = { ...next[i], [field]: value }
      return next
    })
  }

  function addPlayer(): void {
    setPlayers((prev) => [...prev, { name: '', number: '' }])
  }

  function removePlayer(i: number): void {
    setPlayers((prev) => prev.filter((_, idx) => idx !== i))
  }

  return (
    <Modal.Root isOpen onOpenChange={(open) => open || onClose()}>
      <Modal.Backdrop variant="blur" />
      <Modal.Container size="lg">
        <Modal.Dialog>
          <Modal.Header>
            <Modal.Heading>Plantel — {team.name}</Modal.Heading>
            <Modal.CloseTrigger />
          </Modal.Header>
          <Modal.Body>
            <div className="space-y-2">
              <p className="text-xs text-tertiary dark:text-mauve-soft">
                Los nombres de los jugadores se usan para registrar goles y tarjetas en los partidos.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-20 shrink-0 text-xs font-semibold uppercase tracking-wide text-tertiary dark:text-mauve-soft">
                    N°
                  </span>
                  <span className="flex-1 text-xs font-semibold uppercase tracking-wide text-tertiary dark:text-mauve-soft">
                    Nombre del jugador
                  </span>
                  <span className="w-8 shrink-0" aria-hidden="true" />
                </div>
                {players.map((p, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <TextInput
                      aria-label={`Número de camiseta del jugador ${i + 1}`}
                      type="number"
                      min={0}
                      max={99}
                      className="w-20 shrink-0"
                      inputClassName="text-center"
                      value={p.number}
                      onValueChange={(value) => updatePlayer(i, 'number', value)}
                      placeholder="#"
                    />
                    <TextInput
                      aria-label={`Nombre del jugador ${i + 1}`}
                      className="flex-1"
                      value={p.name}
                      onValueChange={(value) => updatePlayer(i, 'name', value)}
                      placeholder={`Jugador ${i + 1}`}
                    />
                    <Button
                      variant="danger-soft"
                      size="sm"
                      onPress={() => removePlayer(i)}
                    >
                      ✕
                    </Button>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" onPress={addPlayer}>
                + Agregar jugador
              </Button>
              {error !== null && (
                <Chip color="danger" size="sm" className="h-auto py-1">{error}</Chip>
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
              isDisabled={mutation.isPending}
              onPress={() => mutation.mutate()}
            >
              {mutation.isPending ? 'Guardando…' : 'Guardar plantel'}
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Root>
  )
}

/* ======================================================================
   Pestaña: Fixture
   ====================================================================== */

function FixtureTab({
  tournamentId,
  onChanged,
}: {
  tournamentId: string
  onChanged: () => void
}): React.JSX.Element {
  const [editingMatch, setEditingMatch] = useState<Match | null>(null)
  const [scoreError, setScoreError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [genGroup, setGenGroup] = useState('')
  const [genError, setGenError] = useState<string | null>(null)
  const [genSuccess, setGenSuccess] = useState(false)

  const teamsQuery = useQuery({
    queryKey: ['teams', tournamentId],
    queryFn: () => listTournamentTeams(tournamentId),
  })

  const matchdaysQuery = useQuery({
    queryKey: ['matchdays', tournamentId],
    queryFn: () => getMatchdays(tournamentId),
  })

  const groups = useMemo(() => {
    const seen = new Set<string>()
    for (const t of teamsQuery.data ?? []) seen.add(t.group)
    return [...seen].sort((a, b) => a.localeCompare(b))
  }, [teamsQuery.data])

  const playersByTeam = useMemo(() => {
    const map: Record<string, TeamPlayer[]> = {}
    for (const t of teamsQuery.data ?? []) map[t.id] = t.players
    return map
  }, [teamsQuery.data])

  const matches = (matchdaysQuery.data ?? []).flatMap((md) => md.matches)

  const scoreMutation = useMutation({
    mutationFn: ({ id, ...input }: { id: string } & MatchResultSubmit) =>
      updateMatchScore(id, input),
    onSuccess: () => {
      onChanged()
      setEditingMatch(null)
      setScoreError(null)
    },
    onError: (err) => setScoreError(getErrorMessage(err)),
  })

  // Generar fixture round-robin para un grupo
  const queryClient = useQueryClient()
  async function handleGenerateFixture(): Promise<void> {
    const group = genGroup.trim()
    if (group.length === 0) { setGenError('Elegí un grupo para generar el fixture'); return }
    const groupTeams = (teamsQuery.data ?? []).filter((t) => t.group === group)
    if (groupTeams.length < 2) { setGenError(`El grupo "${group}" necesita al menos 2 equipos`); return }
    setGenError(null)
    const pairs = roundRobinPairs(groupTeams)
    // Agrupar por jornada (los pares se distribuyen en rounds)
    const teamsInRound = groupTeams.length % 2 === 0 ? groupTeams.length : groupTeams.length + 1
    const matchesPerRound = teamsInRound / 2
    try {
      // Verificar si ya hay partidos en ese grupo
      const existing = matches.filter((m) => {
        const hId = teamId(m.homeTeamId)
        const aId = teamId(m.awayTeamId)
        return groupTeams.some((t) => t.id === hId || t.id === aId)
      })
      if (existing.length > 0) {
        setGenError(`Ya existen ${existing.length} partidos en ese grupo. Borrá los partidos existentes antes de generar el fixture.`)
        return
      }
      for (let i = 0; i < pairs.length; i++) {
        const matchday = Math.floor(i / matchesPerRound) + 1
        await createMatch({
          tournamentId,
          group,
          matchday,
          fase: 'grupos',
          homeTeamId: pairs[i].home.id,
          awayTeamId: pairs[i].away.id,
        })
      }
      setGenSuccess(true)
      setGenerating(false)
      onChanged()
      void queryClient.invalidateQueries({ queryKey: ['matchdays', tournamentId] })
      setTimeout(() => setGenSuccess(false), 3000)
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'Error generando el fixture')
    }
  }

  if (teamsQuery.isLoading || matchdaysQuery.isLoading) return <Loading label="Cargando…" />

  return (
    <div className="mt-4 space-y-5">
      {/* Generar fixture automático */}
      <div className="rounded-lg border border-line p-4 dark:border-mauve space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-coffee dark:text-[#f3efe8]">
            Generar fixture de grupos
          </h3>
          <p className="mt-0.5 text-xs text-tertiary dark:text-mauve-soft">
            Crea automáticamente todos los partidos para que cada equipo del grupo enfrente a todos los demás.
          </p>
        </div>

        {groups.length === 0 ? (
          <p className="text-sm text-tertiary dark:text-mauve-soft">
            No hay equipos cargados. Primero agregá equipos desde la pestaña Equipos.
          </p>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <SelectInput
              aria-label="Grupo"
              className="w-48"
              fullWidth={false}
              value={genGroup}
              onValueChange={(value) => { setGenGroup(value); setGenError(null) }}
              options={groups.map((g) => ({ key: g, label: g }))}
              placeholder="— Elegir grupo —"
            />
            <Button
              variant="primary"
              isDisabled={genGroup.trim().length === 0}
              onPress={() => {
                setGenError(null)
                setGenerating(true)
              }}
            >
              Generar
            </Button>
          </div>
        )}
        {genError !== null && (
          <Chip color="danger" size="sm" className="h-auto py-1">{genError}</Chip>
        )}
        {genSuccess && (
          <Chip color="success" size="sm" className="h-auto py-1">✓ Fixture generado correctamente</Chip>
        )}
      </div>

      {/* Confirmar generación */}
      {generating && (
        <Modal.Root isOpen onOpenChange={(open) => open || setGenerating(false)}>
          <Modal.Backdrop variant="blur" />
          <Modal.Container size="sm">
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>¿Confirmar generación?</Modal.Heading>
                <Modal.CloseTrigger />
              </Modal.Header>
              <Modal.Body>
                <p className="text-sm text-tertiary dark:text-mauve-soft">
                  Se crearán todos los partidos del grupo <strong>{genGroup}</strong> (cada equipo contra
                  todos). Esta acción no se puede deshacer automáticamente.
                </p>
              </Modal.Body>
              <Modal.Footer className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button variant="secondary" className="min-h-11 w-full sm:w-auto" onPress={() => setGenerating(false)}>
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  className="min-h-11 w-full sm:w-auto"
                  onPress={() => void handleGenerateFixture()}
                >
                  Confirmar y generar
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Root>
      )}

      {/* Lista de partidos + cargar resultados */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-coffee dark:text-[#f3efe8]">Resultados de partidos</h3>
        {matches.length === 0 ? (
          <p className="py-6 text-center text-sm text-tertiary dark:text-mauve-soft">
            El fixture aún no fue generado. Usá el botón de arriba para crearlo.
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
    </div>
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