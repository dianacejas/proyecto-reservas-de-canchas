import { Button, Chip } from '@heroui/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  approveTournamentRegistration,
  listTournamentRegistrations,
  rejectTournamentRegistration,
} from '../../api'
import { getErrorMessage } from '../../api/client'
import type { RegistrationStatus, TournamentRegistration } from '../../types'
import Loading from '../common/Loading'
import ErrorState from '../common/ErrorState'

const STATUS_META: Record<RegistrationStatus, { label: string; color: 'warning' | 'success' | 'danger' }> = {
  pendiente_aprobacion: { label: 'Pendiente', color: 'warning' },
  aprobada: { label: 'Aprobada', color: 'success' },
  rechazada: { label: 'Rechazada', color: 'danger' },
}

export default function RegistrationRequests({
  tournamentId,
}: {
  tournamentId: string
}): React.JSX.Element {
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const registrationsQuery = useQuery({
    queryKey: ['registrations', tournamentId],
    queryFn: () => listTournamentRegistrations(tournamentId),
  })

  const invalidateAll = (): void => {
    void queryClient.invalidateQueries({ queryKey: ['registrations', tournamentId] })
    void queryClient.invalidateQueries({ queryKey: ['teams', tournamentId] })
    void queryClient.invalidateQueries({ queryKey: ['standings', tournamentId] })
  }

  const approveMutation = useMutation({
    mutationFn: ({ id, group }: { id: string; group: string }) =>
      approveTournamentRegistration(tournamentId, id, group),
    onSuccess: () => {
      setError(null)
      invalidateAll()
    },
    onError: (err) => setError(getErrorMessage(err)),
  })

  const rejectMutation = useMutation({
    mutationFn: (id: string) => rejectTournamentRegistration(tournamentId, id),
    onSuccess: () => {
      setError(null)
      invalidateAll()
    },
    onError: (err) => setError(getErrorMessage(err)),
  })

  if (registrationsQuery.isLoading) return <Loading label="Cargando inscripciones…" />
  if (registrationsQuery.isError) {
    return (
      <ErrorState
        message={getErrorMessage(registrationsQuery.error)}
        onRetry={() => void registrationsQuery.refetch()}
      />
    )
  }

  const registrations = registrationsQuery.data ?? []
  const pending = registrations.filter((item) => item.status === 'pendiente_aprobacion')
  const resolved = registrations.filter((item) => item.status !== 'pendiente_aprobacion')
  const isPending = approveMutation.isPending || rejectMutation.isPending

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-coffee dark:text-[#f3efe8]">
          Inscripciones ({pending.length} pendientes)
        </h3>
        <p className="mt-0.5 text-xs text-tertiary dark:text-mauve-soft">
          Aprobá los equipos para sumarlos a un grupo del torneo.
        </p>
      </div>

      {error !== null && (
        <Chip color="danger" size="sm" className="h-auto py-1">
          {error}
        </Chip>
      )}

      {registrations.length === 0 ? (
        <p className="py-4 text-center text-sm text-tertiary dark:text-mauve-soft">
          Todavía no hay inscripciones.
        </p>
      ) : (
        <>
          <ul className="space-y-2">
            {pending.map((registration) => (
              <PendingRow
                key={registration.id}
                registration={registration}
                isPending={isPending}
                onApprove={(group) => approveMutation.mutate({ id: registration.id, group })}
                onReject={() => rejectMutation.mutate(registration.id)}
              />
            ))}
          </ul>
          {resolved.length > 0 && (
            <ul className="space-y-1.5">
              {resolved.map((registration) => (
                <ResolvedRow key={registration.id} registration={registration} />
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}

function PendingRow({
  registration,
  isPending,
  onApprove,
  onReject,
}: {
  registration: TournamentRegistration
  isPending: boolean
  onApprove: (group: string) => void
  onReject: () => void
}): React.JSX.Element {
  const [group, setGroup] = useState('Grupo A')

  return (
    <li className="rounded-lg border border-line p-3 dark:border-mauve">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="size-4 shrink-0 rounded-full border border-line dark:border-mauve"
          style={{ backgroundColor: registration.color }}
          aria-hidden="true"
        />
        <span className="font-semibold text-coffee dark:text-[#f3efe8]">{registration.teamName}</span>
        <Chip color="warning" size="sm">
          Pendiente
        </Chip>
      </div>
      <p className="mt-1 text-xs text-tertiary dark:text-mauve-soft">
        Capitán: {registration.captainName} · {registration.captainPhone} · {registration.players.length}{' '}
        jugadores
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={group}
          onChange={(event) => setGroup(event.target.value)}
          placeholder="Grupo"
          className="w-32 rounded-lg border border-line bg-cream px-3 py-1.5 text-sm text-coffee outline-none transition-colors focus:border-lime dark:border-mauve dark:bg-coffee-elev dark:text-[#f3efe8]"
        />
        <Button
          size="sm"
          variant="primary"
          isDisabled={isPending || group.trim().length === 0}
          onPress={() => onApprove(group.trim())}
        >
          Aprobar
        </Button>
        <Button size="sm" variant="outline" isDisabled={isPending} onPress={onReject}>
          Rechazar
        </Button>
      </div>
    </li>
  )
}

function ResolvedRow({ registration }: { registration: TournamentRegistration }): React.JSX.Element {
  const meta = STATUS_META[registration.status]
  return (
    <li className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line px-3 py-2 text-sm dark:border-mauve">
      <span className="text-coffee/80 dark:text-mauve-soft">
        {registration.teamName}
        {registration.assignedGroup !== null && ` · ${registration.assignedGroup}`}
      </span>
      <Chip color={meta.color} size="sm">
        {meta.label}
      </Chip>
    </li>
  )
}
