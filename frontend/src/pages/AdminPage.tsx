import { Alert, Button, Chip, Modal, Tabs } from '@heroui/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  createField,
  createTournament,
  deleteField,
  deleteTournament,
  listFields,
  listTournaments,
  updateField,
} from '../api'
import { getErrorMessage } from '../api/client'
import AdminBookingGrid from '../components/admin/AdminBookingGrid'
import AdminCustomers from '../components/admin/AdminCustomers'
import AdminMetrics from '../components/admin/AdminMetrics'
import ErrorState from '../components/common/ErrorState'
import Loading from '../components/common/Loading'
import type { Field, Tournament, TournamentStatus } from '../types'

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
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Panel de administración</h1>
        <p className="mt-1 text-sm text-tertiary dark:text-mauve-soft">
          Gestioná canchas y torneos del complejo.
        </p>
      </header>

      {notice !== null && (
        <Alert status={notice.kind}>
          <Alert.Description>{notice.message}</Alert.Description>
        </Alert>
      )}

      <Tabs.Root defaultSelectedKey="agenda">
        <Tabs.List>
          <Tabs.Tab id="agenda">Agenda</Tabs.Tab>
          <Tabs.Tab id="metricas">Métricas</Tabs.Tab>
          <Tabs.Tab id="clientes">Clientes</Tabs.Tab>
          <Tabs.Tab id="canchas">Canchas</Tabs.Tab>
          <Tabs.Tab id="torneos">Torneos</Tabs.Tab>
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
          <CanchasTab onNotice={showNotice} />
        </Tabs.Panel>

        <Tabs.Panel id="torneos">
          <TorneosTab onNotice={showNotice} />
        </Tabs.Panel>
      </Tabs.Root>
    </div>
  )
}

interface FieldFormState {
  id: string | null
  name: string
  type: string
  price: string
  imageUrl: string
  isActive: boolean
}

function CanchasTab({ onNotice }: { onNotice: (kind: Notice['kind'], message: string) => void }): React.JSX.Element {
  const queryClient = useQueryClient()
  const fieldsQuery = useQuery({ queryKey: ['fields'], queryFn: listFields })
  const [form, setForm] = useState<FieldFormState | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Field | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const invalidateFields = () => void queryClient.invalidateQueries({ queryKey: ['fields'] })

  const saveMutation = useMutation({
    mutationFn: async (state: FieldFormState) => {
      const price = Number(state.price)
      if (Number.isNaN(price) || price < 0) {
        throw new Error('El precio debe ser un número mayor o igual a 0')
      }
      const payload = {
        name: state.name.trim(),
        type: state.type.trim() || 'Fútbol 5',
        pricePerHour: price,
        imageUrl: state.imageUrl.trim(),
        isActive: state.isActive,
      }
      return state.id === null ? createField(payload) : updateField(state.id, payload)
    },
    onSuccess: () => {
      invalidateFields()
      setForm(null)
      onNotice('success', 'Cancha guardada.')
    },
    onError: (err) => {
      setFormError(getErrorMessage(err))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteField(id),
    onSuccess: () => {
      invalidateFields()
      setPendingDelete(null)
      onNotice('success', 'Cancha eliminada.')
    },
    onError: (err) => {
      setPendingDelete(null)
      onNotice('danger', getErrorMessage(err))
    },
  })

  if (fieldsQuery.isLoading) return <Loading label="Cargando canchas…" />
  if (fieldsQuery.isError) {
    return (
      <ErrorState
        message={getErrorMessage(fieldsQuery.error)}
        onRetry={() => void fieldsQuery.refetch()}
      />
    )
  }

  const fields = fieldsQuery.data ?? []

  function openCreate(): void {
    setFormError(null)
    setForm({ id: null, name: '', type: 'Fútbol 5', price: '', imageUrl: '', isActive: true })
  }

  function openEdit(field: Field): void {
    setFormError(null)
    setForm({
      id: field.id,
      name: field.name,
      type: field.type,
      price: String(field.pricePerHour),
      imageUrl: field.imageUrl ?? '',
      isActive: field.isActive,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-tertiary dark:text-mauve-soft">{fields.length} canchas registradas</p>
        <Button variant="primary" size="sm" onPress={openCreate}>
          Nueva cancha
        </Button>
      </div>

      {fields.length === 0 ? (
        <p className="py-8 text-center text-sm text-tertiary dark:text-mauve-soft">No hay canchas creadas.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line dark:border-mauve">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <thead className="bg-[#f1ebe3] text-tertiary dark:bg-mauve-deep dark:text-mauve-soft">
              <tr>
                <th className="px-4 py-2 font-medium">Nombre</th>
                <th className="px-4 py-2 font-medium">Tipo</th>
                <th className="px-4 py-2 font-medium">Precio/hora</th>
                <th className="px-4 py-2 font-medium">Estado</th>
                <th className="px-4 py-2 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line dark:divide-mauve/60">
              {fields.map((field) => (
                <tr key={field.id} className="bg-cream dark:bg-coffee-elev">
                  <td className="px-4 py-3 font-medium">{field.name}</td>
                  <td className="px-4 py-3 text-tertiary dark:text-mauve-soft">{field.type}</td>
                  <td className="px-4 py-3">${field.pricePerHour}</td>
                  <td className="px-4 py-3">
                    <Chip color={field.isActive ? 'success' : 'warning'} size="sm">
                      {field.isActive ? 'Activa' : 'Inactiva'}
                    </Chip>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onPress={() => openEdit(field)}>
                        Editar
                      </Button>
                      <Button variant="danger-soft" size="sm" onPress={() => setPendingDelete(field)}>
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {form !== null && (
        <Modal.Root isOpen onOpenChange={(open) => open || setForm(null)}>
<Modal.Backdrop variant="blur" />
            <Modal.Container size="md">
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>{form.id === null ? 'Nueva cancha' : 'Editar cancha'}</Modal.Heading>
                <Modal.CloseTrigger />
              </Modal.Header>
              <Modal.Body>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-coffee/80 dark:text-mauve-soft" htmlFor="f-name">
                      Nombre
                    </label>
                    <input
                      id="f-name"
                      type="text"
                      value={form.name}
                      onChange={(event) => setForm({ ...form, name: event.target.value })}
                      placeholder="Ej: Cancha Alpha"
                      className="min-h-11 w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-coffee outline-none transition-colors focus:border-lime dark:border-mauve dark:bg-coffee-elev dark:text-[#f3efe8]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-coffee/80 dark:text-mauve-soft" htmlFor="f-type">
                      Tipo de superficie
                    </label>
                    <input
                      id="f-type"
                      type="text"
                      value={form.type}
                      onChange={(event) => setForm({ ...form, type: event.target.value })}
                      placeholder="Ej: Fútbol 5"
                      className="min-h-11 w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-coffee outline-none transition-colors focus:border-lime dark:border-mauve dark:bg-coffee-elev dark:text-[#f3efe8]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-coffee/80 dark:text-mauve-soft" htmlFor="f-price">
                      Precio por hora ($)
                    </label>
                    <input
                      id="f-price"
                      type="number"
                      min="0"
                      value={form.price}
                      onChange={(event) => setForm({ ...form, price: event.target.value })}
                      placeholder="Ej: 35000"
                      className="min-h-11 w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-coffee outline-none transition-colors focus:border-lime dark:border-mauve dark:bg-coffee-elev dark:text-[#f3efe8]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-coffee/80 dark:text-mauve-soft" htmlFor="f-image">
                      Imagen (URL)
                    </label>
                    <input
                      id="f-image"
                      type="text"
                      value={form.imageUrl}
                      onChange={(event) => setForm({ ...form, imageUrl: event.target.value })}
                      placeholder="Ej: https://…/nocturna.jpg"
                      className="min-h-11 w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-coffee outline-none transition-colors focus:border-lime dark:border-mauve dark:bg-coffee-elev dark:text-[#f3efe8]"
                    />
                    {form.imageUrl.trim() !== '' && (
                      <img
                        src={form.imageUrl.trim()}
                        alt="Vista previa"
                        loading="lazy"
                        className="h-16 w-24 rounded-lg border border-line object-cover dark:border-mauve"
                      />
                    )}
                  </div>
                  <label className="flex min-h-11 items-center gap-2.5 text-sm text-coffee/80 dark:text-mauve-soft">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(event) => setForm({ ...form, isActive: event.target.checked })}
                      className="size-5 shrink-0 accent-[#8ea63f]"
                    />
                    Cancha activa (visible para reservas)
                  </label>
                  {formError !== null && (
                    <Chip color="danger" size="sm" className="h-auto py-1">
                      {formError}
                    </Chip>
                  )}
                </div>
              </Modal.Body>
              <Modal.Footer className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  variant="secondary"
                  className="min-h-11 w-full sm:w-auto"
                  onPress={() => setForm(null)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  className="min-h-11 w-full sm:w-auto"
                  isDisabled={saveMutation.isPending || form.name.trim().length === 0}
                  onPress={() => saveMutation.mutate(form)}
                >
                  {saveMutation.isPending ? 'Guardando…' : 'Guardar'}
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Root>
      )}

      {pendingDelete !== null && (
        <ConfirmDialog
          title="Eliminar cancha"
          message={`¿Eliminar «${pendingDelete.name}»? Esta acción no se puede deshacer.`}
          isPending={deleteMutation.isPending}
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => deleteMutation.mutate(pendingDelete.id)}
        />
      )}
    </div>
  )
}

function TorneosTab({ onNotice }: { onNotice: (kind: Notice['kind'], message: string) => void }): React.JSX.Element {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const tournamentsQuery = useQuery({ queryKey: ['tournaments'], queryFn: listTournaments })
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [pendingDelete, setPendingDelete] = useState<Tournament | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)

  const invalidateTournaments = () => void queryClient.invalidateQueries({ queryKey: ['tournaments'] })

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
        <p className="text-sm text-tertiary dark:text-mauve-soft">{tournaments.length} torneos</p>
        <Button variant="primary" size="sm" onPress={() => { setCreateError(null); setName(''); setCreating(true) }}>
          Nuevo torneo
        </Button>
      </div>

      {tournaments.length === 0 ? (
        <p className="py-8 text-center text-sm text-tertiary dark:text-mauve-soft">No hay torneos creados.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line dark:border-mauve">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead className="bg-[#f1ebe3] text-tertiary dark:bg-mauve-deep dark:text-mauve-soft">
              <tr>
                <th className="px-4 py-2 font-medium">Nombre</th>
                <th className="px-4 py-2 font-medium">Estado</th>
                <th className="px-4 py-2 font-medium">Equipos</th>
                <th className="px-4 py-2 font-medium">Partidos</th>
                <th className="px-4 py-2 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line dark:divide-mauve/60">
              {tournaments.map((tournament) => {
                const meta = TOURNAMENT_STATUS_META[tournament.status]
                return (
                  <tr key={tournament.id} className="bg-cream dark:bg-coffee-elev">
                    <td className="px-4 py-3 font-medium">{tournament.name}</td>
                    <td className="px-4 py-3">
                      <Chip color={meta.color} size="sm">
                        {meta.label}
                      </Chip>
                    </td>
                    <td className="px-4 py-3 text-tertiary dark:text-mauve-soft">
                      {tournament.teamsCount ?? '-'}
                    </td>
                    <td className="px-4 py-3 text-tertiary dark:text-mauve-soft">
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
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-coffee/80 dark:text-mauve-soft" htmlFor="t-name">
                      Nombre
                    </label>
                    <input
                      id="t-name"
                      type="text"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Ej: Copa Canchas 2026"
                      className="min-h-11 w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-coffee outline-none transition-colors focus:border-lime dark:border-mauve dark:bg-coffee-elev dark:text-[#f3efe8]"
                    />
                  </div>
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
            <p className="text-sm text-tertiary dark:text-mauve-soft">{message}</p>
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