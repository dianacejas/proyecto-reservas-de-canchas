import { Button, Chip, Modal } from '@heroui/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { createAdminBooking, listBookingsByDate, listFields, updateBookingStatus } from '../../api'
import { getErrorMessage } from '../../api/client'
import ErrorState from '../common/ErrorState'
import Loading from '../common/Loading'
import DateNav from '../booking/DateNav'
import type { Booking, BookingStatus, Field } from '../../types'
import { bookingDay, formatLong, todayKey } from '../../utils/date'

interface Notice {
  kind: 'success' | 'danger'
  message: string
}

interface SlotDef {
  start: string
  end: string
  label: string
}

const START_HOUR = 18
const END_HOUR = 23

const SLOTS: SlotDef[] = Array.from({ length: END_HOUR - START_HOUR }, (_, index) => {
  const hour = START_HOUR + index
  const start = `${hour}`.padStart(2, '0')
  const end = `${hour + 1}`.padStart(2, '0')
  return { start: `${start}:00`, end: `${end}:00`, label: `${start}:00 – ${end}:00` }
})

interface NewSlotForm {
  kind: 'reserva' | 'bloqueo'
  field: Field
  slot: SlotDef
}

function overlaps(start: string, end: string, booking: Booking): boolean {
  return booking.status !== 'cancelada' && booking.startTime < end && start < booking.endTime
}

function bookingForSlot(bookings: Booking[], fieldId: string, slot: SlotDef): Booking | undefined {
  return bookings.find((booking) => {
    const bookingFieldId = typeof booking.fieldId === 'string' ? booking.fieldId : booking.fieldId.id
    return bookingFieldId === fieldId && overlaps(slot.start, slot.end, booking)
  })
}

function bookingChip(booking: Booking): { label: string; color: 'success' | 'warning' | 'accent' } {
  if (booking.type === 'mantenimiento') return { label: 'Bloqueo', color: 'warning' }
  if (booking.type === 'torneo') return { label: 'Torneo', color: 'accent' }
  if (booking.status === 'pendiente') return { label: 'Pendiente', color: 'warning' }
  return { label: 'Confirmada', color: 'success' }
}

function whatsappLink(booking: Booking, fieldName: string): string | null {
  const phone = booking.clientInfo.phone.replace(/\D/g, '')
  if (booking.type === 'mantenimiento' || phone.length < 6) return null
  const dateLabel = formatLong(bookingDay(booking.date))
  const status = booking.status === 'confirmada' ? 'está confirmada' : 'está pendiente de confirmación'
  const text = `Hola ${booking.clientInfo.name}! Tu reserva en ${fieldName} el ${dateLabel} de ${booking.startTime} a ${booking.endTime} ${status}.`
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
}

export default function AdminBookingGrid({
  onNotice,
}: {
  onNotice: (kind: Notice['kind'], message: string) => void
}): React.JSX.Element {
  const queryClient = useQueryClient()
  const [date, setDate] = useState(todayKey())
  const [newSlot, setNewSlot] = useState<NewSlotForm | null>(null)
  const [detail, setDetail] = useState<Booking | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const fieldsQuery = useQuery({ queryKey: ['fields'], queryFn: listFields })

  const bookingsQuery = useQuery({
    queryKey: ['admin-bookings', date],
    queryFn: () => listBookingsByDate(date),
  })

  function invalidate(): void {
    void queryClient.invalidateQueries({ queryKey: ['admin-bookings', date] })
    void queryClient.invalidateQueries({ queryKey: ['bookings'] })
  }

  const createMutation = useMutation({
    mutationFn: createAdminBooking,
    onSuccess: () => {
      invalidate()
      setNewSlot(null)
      onNotice('success', 'Operación registrada en la agenda.')
    },
    onError: (err) => setFormError(getErrorMessage(err)),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookingStatus }) => updateBookingStatus(id, status),
    onSuccess: () => {
      invalidate()
      setDetail(null)
      onNotice('success', 'Estado de la reserva actualizado.')
    },
    onError: (err) => onNotice('danger', getErrorMessage(err)),
  })

  const fields = fieldsQuery.data ?? []
  const bookings = bookingsQuery.data ?? []

  const grid = SLOTS.map((slot) => ({
    slot,
    cells: fields.map((field) => ({
      field,
      booking: bookingForSlot(bookings, field.id, slot),
    })),
  }))

  if (fieldsQuery.isLoading) return <Loading label="Cargando agenda…" />
  if (fieldsQuery.isError) {
    return <ErrorState message={getErrorMessage(fieldsQuery.error)} onRetry={() => void fieldsQuery.refetch()} />
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-tertiary dark:text-mauve-soft">
          Grilla diaria de turnos: tocá un bloque para operar la reserva.
        </p>
        <DateNav date={date} onChange={setDate} />
      </div>

      {bookingsQuery.isLoading ? (
        <Loading label="Consultando agenda…" />
      ) : bookingsQuery.isError ? (
        <ErrorState message={getErrorMessage(bookingsQuery.error)} onRetry={() => void bookingsQuery.refetch()} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-line dark:border-mauve">
          <div className="overflow-x-auto">
            <table className="w-full min-w-155 text-left text-sm" aria-label="Agenda diaria">
              <thead className="bg-[#f1ebe3] text-tertiary dark:bg-mauve-deep dark:text-mauve-soft">
                <tr>
                  <th className="sticky left-0 z-10 bg-[#f1ebe3] px-3 py-2 font-medium dark:bg-mauve-deep">
                    Horario
                  </th>
                  {fields.map((field) => (
                    <th key={field.id} className="px-3 py-2 font-medium">
                      {field.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line dark:divide-mauve/60">
                {grid.map((row) => (
                  <tr key={row.slot.start} className="bg-cream dark:bg-coffee-elev">
                    <td className="sticky left-0 z-10 whitespace-nowrap bg-cream px-3 py-2 font-mono text-xs font-semibold text-coffee dark:bg-coffee-elev dark:text-[#f3efe8]">
                      {row.slot.label}
                    </td>
                    {row.cells.map((cell) => {
                      const booking = cell.booking
                      if (booking === undefined) {
                        return (
                          <td key={cell.field.id} className="px-2 py-2">
                            <div className="flex min-h-16 flex-col items-stretch justify-center gap-1.5 rounded-lg border border-dashed border-line px-2 py-1.5 dark:border-mauve/60">
                              <span className="text-xs text-tertiary/70 dark:text-mauve-soft">Libre</span>
                              <div className="flex gap-1">
                                <Button
                                  variant="primary"
                                  size="sm"
                                  className="h-7 flex-1 px-1 text-xs"
                                  onPress={() => {
                                    setFormError(null)
                                    setNewSlot({ kind: 'reserva', field: cell.field, slot: row.slot })
                                  }}
                                >
                                  Reservar
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 px-1 text-xs"
                                  onPress={() => {
                                    setFormError(null)
                                    setNewSlot({ kind: 'bloqueo', field: cell.field, slot: row.slot })
                                  }}
                                >
                                  Bloquear
                                </Button>
                              </div>
                            </div>
                          </td>
                        )
                      }
                      return (
                        <td key={cell.field.id} className="px-2 py-2">
                          <CellCard
                            booking={booking}
                            fieldName={cell.field.name}
                            onOpen={() => setDetail(booking)}
                            onConfirm={() =>
                              statusMutation.mutate({ id: booking.id, status: 'confirmada' })
                            }
                            onCancel={() =>
                              statusMutation.mutate({ id: booking.id, status: 'cancelada' })
                            }
                          />
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {newSlot !== null && (
        <NewSlotModal
          form={newSlot}
          date={date}
          isSubmitting={createMutation.isPending}
          error={formError}
          onError={setFormError}
          onClose={() => setNewSlot(null)}
          onSubmit={(payload) => createMutation.mutate(payload)}
        />
      )}

      {detail !== null && (
        <BookingDetailModal
          booking={detail}
          fieldName={
            typeof detail.fieldId === 'string'
              ? fields.find((item) => item.id === detail.fieldId)?.name ?? 'Cancha'
              : detail.fieldId.name
          }
          isPending={statusMutation.isPending}
          onClose={() => setDetail(null)}
          onConfirm={() => statusMutation.mutate({ id: detail.id, status: 'confirmada' })}
          onCancel={() => statusMutation.mutate({ id: detail.id, status: 'cancelada' })}
        />
      )}
    </div>
  )
}

function CellCard({
  booking,
  fieldName,
  onOpen,
  onConfirm,
  onCancel,
}: {
  booking: Booking
  fieldName: string
  onOpen: () => void
  onConfirm: () => void
  onCancel: () => void
}): React.JSX.Element {
  const chip = bookingChip(booking)
  const waLink = whatsappLink(booking, fieldName)

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex min-h-16 w-full flex-col items-start gap-1.5 rounded-lg border border-line bg-paper/70 px-2 py-1.5 text-left transition-colors hover:border-mauve/60 dark:border-mauve/70 dark:bg-mauve-deep/60 dark:hover:border-lime/60"
    >
      <div className="flex w-full items-center justify-between gap-2">
        <Chip color={chip.color} size="sm">
          {chip.label}
        </Chip>
        <span className="text-xs text-tertiary dark:text-mauve-soft">{booking.startTime}</span>
      </div>
      <span className="truncate text-xs font-medium text-coffee/80 dark:text-mauve-soft">
        {booking.type === 'mantenimiento' ? booking.clientInfo.name : booking.clientInfo.name}
      </span>
      <div className="flex w-full gap-1" onClick={(event) => event.stopPropagation()}>
        {waLink !== null && (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-7 items-center rounded-md bg-[#25d366] px-2 text-xs font-semibold text-[#04210e] transition-colors hover:bg-[#1fd05f]"
          >
            WhatsApp
          </a>
        )}
        {booking.status === 'pendiente' && (
          <Button variant="primary" size="sm" className="h-7 flex-1 px-1 text-xs" onPress={onConfirm}>
            Confirmar
          </Button>
        )}
        {booking.status !== 'cancelada' && (
          <Button variant="ghost" size="sm" className="h-7 px-1 text-xs" onPress={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </button>
  )
}

interface NewSlotSubmitPayload {
  fieldId: string
  date: string
  startTime: string
  endTime: string
  kind: 'reserva' | 'bloqueo'
  clientInfo: { name: string; phone: string } | null
}

function NewSlotModal({
  form,
  date,
  isSubmitting,
  error,
  onError,
  onClose,
  onSubmit,
}: {
  form: NewSlotForm
  date: string
  isSubmitting: boolean
  error: string | null
  onError: (err: string | null) => void
  onClose: () => void
  onSubmit: (payload: NewSlotSubmitPayload) => void
}): React.JSX.Element {
  const [kind, setKind] = useState(form.kind)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [note, setNote] = useState('')

  const canSubmit =
    !isSubmitting &&
    (kind === 'bloqueo' || (name.trim().length > 0 && phone.trim().length >= 6))

  function handleSubmit(): void {
    onError(null)
    const base = {
      fieldId: form.field.id,
      date,
      startTime: form.slot.start,
      endTime: form.slot.end,
      kind,
    }
    if (kind === 'bloqueo') {
      onSubmit({
        ...base,
        clientInfo: note.trim().length > 0 ? { name: note.trim(), phone: '000000' } : null,
      })
      return
    }
    onSubmit({ ...base, clientInfo: { name: name.trim(), phone: phone.trim() } })
  }

  const inputClass =
    'w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-coffee outline-none transition-colors focus:border-lime dark:border-mauve dark:bg-coffee-elev dark:text-[#f3efe8]'

  return (
    <Modal.Root isOpen onOpenChange={(open) => open || onClose()}>
      <Modal.Backdrop />
      <Modal.Container>
        <Modal.Dialog>
          <Modal.Header>
            <Modal.Heading>{kind === 'bloqueo' ? 'Bloqueo operativo' : 'Reserva de mostrador'}</Modal.Heading>
            <Modal.CloseTrigger />
          </Modal.Header>
          <Modal.Body>
            <div className="space-y-3">
              <div className="grid gap-2 text-sm">
                <div className="flex items-center justify-between gap-3 rounded-lg border border-line bg-paper/70 px-3 py-2 dark:border-mauve dark:bg-mauve-deep/60">
                  <span className="text-tertiary dark:text-mauve-soft">Cancha</span>
                  <span className="font-medium text-coffee dark:text-[#f3efe8]">{form.field.name}</span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-lg border border-line bg-paper/70 px-3 py-2 dark:border-mauve dark:bg-mauve-deep/60">
                  <span className="text-tertiary dark:text-mauve-soft">Horario</span>
                  <span className="font-medium text-coffee dark:text-[#f3efe8]">
                    {formatLong(date)} · {form.slot.label}
                  </span>
                </div>
                {kind === 'reserva' && (
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-line bg-paper/70 px-3 py-2 dark:border-mauve dark:bg-mauve-deep/60">
                    <span className="text-tertiary dark:text-mauve-soft">Total estimado</span>
                    <span className="font-semibold text-coffee dark:text-lime">${form.field.pricePerHour}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={kind === 'reserva' ? 'primary' : 'outline'}
                  size="sm"
                  onPress={() => setKind('reserva')}
                >
                  Reserva mostrador
                </Button>
                <Button
                  variant={kind === 'bloqueo' ? 'primary' : 'outline'}
                  size="sm"
                  onPress={() => setKind('bloqueo')}
                >
                  Bloqueo operativo
                </Button>
              </div>

              {kind === 'reserva' ? (
                <>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-coffee/80 dark:text-mauve-soft" htmlFor="ag-name">
                      Nombre y apellido
                    </label>
                    <input
                      id="ag-name"
                      type="text"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Ej: Juan Pérez"
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-coffee/80 dark:text-mauve-soft" htmlFor="ag-phone">
                      Teléfono
                    </label>
                    <input
                      id="ag-phone"
                      type="tel"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      placeholder="Ej: 11 5555 1234"
                      className={inputClass}
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-coffee/80 dark:text-mauve-soft" htmlFor="ag-note">
                    Motivo (opcional, visible en la grilla)
                  </label>
                  <input
                    id="ag-note"
                    type="text"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Ej: Mantenimiento de césped"
                    className={inputClass}
                  />
                </div>
              )}

              {error !== null && (
                <Chip color="danger" size="sm" className="h-auto py-1">
                  {error}
                </Chip>
              )}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onPress={onClose}>
              Cancelar
            </Button>
            <Button variant="primary" isDisabled={!canSubmit} onPress={handleSubmit}>
              {isSubmitting
                ? 'Guardando…'
                : kind === 'bloqueo'
                  ? 'Bloquear horario'
                  : 'Registrar reserva'}
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Root>
  )
}

function BookingDetailModal({
  booking,
  fieldName,
  isPending,
  onClose,
  onConfirm,
  onCancel,
}: {
  booking: Booking
  fieldName: string
  isPending: boolean
  onClose: () => void
  onConfirm: () => void
  onCancel: () => void
}): React.JSX.Element {
  const chip = bookingChip(booking)
  const waLink = whatsappLink(booking, fieldName)
  const row = 'flex items-center justify-between gap-3 rounded-lg border border-line bg-paper/70 px-3 py-2 dark:border-mauve dark:bg-mauve-deep/60'
  const label = 'text-tertiary dark:text-mauve-soft'
  const value = 'font-medium capitalize text-coffee dark:text-[#f3efe8]'

  return (
    <Modal.Root isOpen onOpenChange={(open) => open || onClose()}>
      <Modal.Backdrop />
      <Modal.Container>
        <Modal.Dialog>
          <Modal.Header>
            <Modal.Heading>
              <span className="flex items-center gap-2">
                Turno {booking.startTime}
                <Chip color={chip.color} size="sm">
                  {chip.label}
                </Chip>
              </span>
            </Modal.Heading>
            <Modal.CloseTrigger />
          </Modal.Header>
          <Modal.Body>
            <div className="space-y-3 text-sm">
              <div className={row}>
                <span className={label}>Cancha</span>
                <span className={value}>{fieldName}</span>
              </div>
              <div className={row}>
                <span className={label}>Fecha</span>
                <span className={value}>{formatLong(bookingDay(booking.date))}</span>
              </div>
              <div className={row}>
                <span className={label}>Horario</span>
                <span className={value}>
                  {booking.startTime} a {booking.endTime}
                </span>
              </div>
              <div className={row}>
                <span className={label}>Cliente</span>
                <span className={value}>{booking.clientInfo.name}</span>
              </div>
              {booking.type !== 'mantenimiento' && (
                <div className={row}>
                  <span className={label}>Teléfono</span>
                  <span className={value}>{booking.clientInfo.phone}</span>
                </div>
              )}
            </div>
          </Modal.Body>
          <Modal.Footer>
            {waLink !== null && (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-lg bg-[#25d366] px-4 py-2 text-sm font-semibold text-[#04210e] transition-colors hover:bg-[#1fd05f]"
              >
                WhatsApp
              </a>
            )}
            <Button variant="secondary" onPress={onClose}>
              Cerrar
            </Button>
            {booking.status === 'pendiente' && (
              <Button variant="primary" isDisabled={isPending} onPress={onConfirm}>
                Confirmar
              </Button>
            )}
            {booking.status !== 'cancelada' && (
              <Button variant="danger" isDisabled={isPending} onPress={onCancel}>
                Cancelar
              </Button>
            )}
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Root>
  )
}