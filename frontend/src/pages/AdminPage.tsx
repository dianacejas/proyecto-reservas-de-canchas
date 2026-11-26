import { Alert, Button, Chip, Modal, Tabs } from '@heroui/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  createTournament,
  deleteCommunityNotice,
  deleteTournament,
  listCommunityNotices,
  listTournaments,
  queryKeys,
} from '../api'
import { getErrorMessage } from '../api/client'
import AdminBookingGrid from '../components/admin/AdminBookingGrid'
import AdminCourts from '../components/admin/AdminCourts'
import AdminCustomers from '../components/admin/AdminCustomers'
import AdminMetrics from '../components/admin/AdminMetrics'
import ErrorState from '../components/common/ErrorState'
import Loading from '../components/common/Loading'
import { TextInput } from '../components/common/fields'
import type { CommunityNotice, Tournament, TournamentStatus } from '../types'
import { PILL_TAB_CLASS } from '../utils/tabs'

interface Notice {
  kind: 'success' | 'danger'
  message: string
}

const TOURNAMENT_STATUS_META: Record<
  TournamentStatus,
  { label: string; color: 'success' | 'warning' | 'danger' }
> = {
  inscripcion: { label: 'Inscripción', color: 'warning' },
  en_curso: { label: 'En curso', color: 'success' },
  finalizado: { label: 'Finalizado', color: 'danger' },
}

export default function AdminPage(): React.JSX.Element {
  const [notice, setNotice] = useState<Notice | null>(null)

  function showNotice(kind: Notice['kind'], message: string): void {
    setNotice({ kind, message })
  }

  return (
    <div className="w-full space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-white">Panel de administración</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Gestioná canchas y torneos del complejo.
        </p>
      </header>

      {notice !== null && (
        <Alert status={notice.kind}>
          <Alert.Description>{notice.message}</Alert.Description>
        </Alert>
      )}

      <Tabs.Root defaultSelectedKey="agenda">
        <Tabs.List className="grid w-full grid-cols-3 gap-1.5 rounded-2xl border border-white/5 bg-neutral-900/60 p-1.5 sm:flex sm:w-auto sm:max-w-full sm:gap-2 sm:overflow-x-auto sm:p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Tabs.Tab id="agenda" className={`${PILL_TAB_CLASS} text-center px-2 py-2 text-xs sm:px-4 sm:text-sm`}>Agenda</Tabs.Tab>
          <Tabs.Tab id="metricas" className={`${PILL_TAB_CLASS} text-center px-2 py-2 text-xs sm:px-4 sm:text-sm`}>Métricas</Tabs.Tab>
          <Tabs.Tab id="clientes" className={`${PILL_TAB_CLASS} text-center px-2 py-2 text-xs sm:px-4 sm:text-sm`}>Clientes</Tabs.Tab>
          <Tabs.Tab id="canchas" className={`${PILL_TAB_CLASS} text-center px-2 py-2 text-xs sm:px-4 sm:text-sm`}>Canchas</Tabs.Tab>
          <Tabs.Tab id="torneos" className={`${PILL_TAB_CLASS} text-center px-2 py-2 text-xs sm:px-4 sm:text-sm`}>Torneos</Tabs.Tab>
          <Tabs.Tab id="comunidad" className={`${PILL_TAB_CLASS} text-center px-2 py-2 text-xs sm:px-4 sm:text-sm`}>Comunidad</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel id="agenda">
          <AdminBookingGrid onNotice={showNotice} />
        </Tabs.Panel>

        <Tabs.Panel id="metricas">
          <AdminMetrics />
        </Tabs.Panel>

        <Tabs.Panel id="clientes">
          <AdminCustomers />
        </Tabs.Panel>

        <Tabs.Panel id="canchas">
          <AdminCourts onNotice={showNotice} />
        </Tabs.Panel>

        <Tabs.Panel id="torneos">
          <TorneosTab onNotice={showNotice} />
        </Tabs.Panel>

        <Tabs.Panel id="comunidad">
          <ComunidadModerationTab onNotice={showNotice} />
        </Tabs.Panel>
      </Tabs.Root>
    </div>
  )
}

function TorneosTab({ onNotice }: { onNotice: (kind: Notice['kind'], message: string) => void }): React.JSX.Element {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const tournamentsQuery = useQuery({ queryKey: queryKeys.tournaments(), queryFn: listTournaments })
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [pendingDelete, setPendingDelete] = useState<Tournament | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)

  const invalidateTournaments = () => void queryClient.invalidateQueries({ queryKey: queryKeys.tournaments() })

  const createMutation = useMutation({
    mutationFn: () => createTournament({ name: name.trim() }),
    onSuccess: (tournament) => {
      invalidateTournaments()
      setCreating(false)
      setName('')
      onNotice('success', 'Torneo creado.')
      navigate(`/torneos/${tournament.id}`)
    },
    onError: (err) => {
      setCreateError(getErrorMessage(err))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTournament(id),
    onSuccess: () => {
      invalidateTournaments()
      setPendingDelete(null)
      onNotice('success', 'Torneo eliminado.')
    },
    onError: (err) => {
      setPendingDelete(null)
      onNotice('danger', getErrorMessage(err))
    },
  })

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-400">{tournaments.length} torneos</p>
        <Button variant="primary" size="sm" onPress={() => { setCreateError(null); setName(''); setCreating(true) }}>
          Nuevo torneo
        </Button>
      </div>

      {tournaments.length === 0 ? (
        <p className="py-8 text-center text-sm text-neutral-400">No hay torneos creados.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-neutral-800 bg-neutral-900/90 shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead className="bg-neutral-800/80 text-xs font-bold uppercase tracking-wider text-neutral-400">
              <tr>
                <th className="px-4 py-3 font-bold">Nombre</th>
                <th className="px-4 py-3 font-bold">Estado</th>
                <th className="px-4 py-3 font-bold">Equipos</th>
                <th className="px-4 py-3 font-bold">Partidos</th>
                <th className="px-4 py-3 text-right font-bold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {tournaments.map((tournament) => {
                const meta = TOURNAMENT_STATUS_META[tournament.status]
                return (
                  <tr key={tournament.id} className="bg-neutral-900/60 hover:bg-neutral-800/60 transition-colors">
                    <td className="px-4 py-3 font-semibold text-white">{tournament.name}</td>
                    <td className="px-4 py-3">
                      <Chip color={meta.color} size="sm">
                        {meta.label}
                      </Chip>
                    </td>
                    <td className="px-4 py-3 font-bold text-neutral-200">
                      {tournament.teamsCount ?? '-'}
                    </td>
                    <td className="px-4 py-3 font-bold text-neutral-200">
                      {tournament.matchesCount ?? '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onPress={() => navigate(`/torneos/${tournament.id}`)}>
                          Ver
                        </Button>
                        <Button variant="danger-soft" size="sm" onPress={() => setPendingDelete(tournament)}>
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {creating && (
        <Modal.Root isOpen onOpenChange={(open) => open || setCreating(false)}>
<Modal.Backdrop variant="blur" />
            <Modal.Container size="md">
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>Nuevo torneo</Modal.Heading>
                <Modal.CloseTrigger />
              </Modal.Header>
              <Modal.Body>
                <div className="space-y-3">
                  <TextInput
                    label="Nombre"
                    value={name}
                    onValueChange={setName}
                    placeholder="Ej: Copa Canchas 2026"
                  />
                  {createError !== null && (
                    <Chip color="danger" size="sm" className="h-auto py-1">
                      {createError}
                    </Chip>
                  )}
                </div>
              </Modal.Body>
              <Modal.Footer className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  variant="secondary"
                  className="min-h-11 w-full sm:w-auto"
                  onPress={() => setCreating(false)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  className="min-h-11 w-full sm:w-auto"
                  isDisabled={createMutation.isPending || name.trim().length === 0}
                  onPress={() => createMutation.mutate()}
                >
                  {createMutation.isPending ? 'Creando…' : 'Crear torneo'}
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Root>
      )}

      {pendingDelete !== null && (
        <ConfirmDialog
          title="Eliminar torneo"
          message={`¿Eliminar «${pendingDelete.name}» con todos sus equipos y partidos?`}
          isPending={deleteMutation.isPending}
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => deleteMutation.mutate(pendingDelete.id)}
        />
      )}
    </div>
  )
}

function ComunidadModerationTab({
  onNotice,
}: {
  onNotice: (kind: Notice['kind'], message: string) => void
}): React.JSX.Element {
  const queryClient = useQueryClient()
  const noticesQuery = useQuery({
    queryKey: ['community-notices'],
    queryFn: listCommunityNotices,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCommunityNotice(id),
    onSuccess: (_deleted, id) => {
      queryClient.setQueryData<CommunityNotice[]>(['community-notices'], (old = []) =>
        old.filter((n) => n.id !== id),
      )
      void queryClient.invalidateQueries({ queryKey: ['community-notices'] })
      onNotice('success', 'Aviso eliminado del tablón comunitario.')
    },
    onError: (err) => {
      onNotice('danger', getErrorMessage(err))
    },
  })

  if (noticesQuery.isLoading) return <Loading label="Cargando avisos comunitarios…" />
  if (noticesQuery.isError) {
    return (
      <ErrorState
        message={getErrorMessage(noticesQuery.error)}
        onRetry={() => void noticesQuery.refetch()}
      />
    )
  }

  const notices = noticesQuery.data ?? []

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-white">Moderación del Tablón Comunitario</h2>
          <p className="text-xs text-neutral-400">
            Supervisá los avisos activos (expiran automáticamente a las 48h) y eliminá publicaciones indebidas.
          </p>
        </div>
        <span className="rounded-full border border-neutral-800 bg-neutral-900 px-3 py-1 text-xs font-bold text-neutral-300">
          {notices.length} avisos activos
        </span>
      </div>

      {notices.length === 0 ? (
        <p className="rounded-2xl border border-neutral-800 bg-neutral-900/50 py-8 text-center text-sm text-neutral-400">
          No hay avisos activos para moderar.
        </p>
      ) : (
        <div className="rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900/90 shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[44rem] text-left text-sm">
              <thead className="border-b border-neutral-800 bg-neutral-950/70 text-xs font-bold uppercase tracking-wider text-neutral-400">
                <tr>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Aviso / Descripción</th>
                  <th className="px-4 py-3">Autor</th>
                  <th className="px-4 py-3">Turno / Contacto</th>
                  <th className="px-4 py-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {notices.map((notice) => (
                  <tr key={notice.id} className="transition-colors hover:bg-neutral-800/40">
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          notice.type === 'falta_uno'
                            ? 'bg-[#c5d86d]/15 text-[#c5d86d]'
                            : 'bg-amber-500/15 text-amber-300'
                        }`}
                      >
                        {notice.type === 'falta_uno' ? 'Falta 1' : 'Desafío'}
                      </span>
                    </td>
                    <td className="max-w-xs px-4 py-3">
                      <p className="truncate font-bold text-white">{notice.title}</p>
                      <p className="truncate text-xs text-neutral-400">{notice.description}</p>
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-neutral-300">
                      {notice.authorName || 'Jugador Copa 5'}
                    </td>
                    <td className="px-4 py-3 text-xs text-neutral-400">
                      <div>{notice.date} · {notice.timeSlot}</div>
                      <div className="font-mono text-[11px] text-neutral-500">{notice.contactPhone}</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="danger-soft"
                        size="sm"
                        isDisabled={deleteMutation.isPending}
                        onPress={() => deleteMutation.mutate(notice.id)}
                      >
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

interface ConfirmDialogProps {
  title: string
  message: string
  isPending: boolean
  onCancel: () => void
  onConfirm: () => void
}

function ConfirmDialog({ title, message, isPending, onCancel, onConfirm }: ConfirmDialogProps): React.JSX.Element {
  return (
    <Modal.Root isOpen onOpenChange={(open) => open || onCancel()}>
<Modal.Backdrop variant="blur" />
        <Modal.Container size="md">
        <Modal.Dialog>
          <Modal.Header>
            <Modal.Heading>{title}</Modal.Heading>
            <Modal.CloseTrigger />
          </Modal.Header>
          <Modal.Body>
            <p className="text-sm text-neutral-300">{message}</p>
          </Modal.Body>
          <Modal.Footer className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" className="min-h-11 w-full sm:w-auto" onPress={onCancel}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              className="min-h-11 w-full sm:w-auto"
              isDisabled={isPending}
              onPress={onConfirm}
            >
              {isPending ? 'Eliminando…' : 'Eliminar'}
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Root>
  )
}