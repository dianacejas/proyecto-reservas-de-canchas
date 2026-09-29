import { Alert, Button, Chip } from '@heroui/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  confirmSandboxPayment,
  createBooking,
  createCheckout,
  listBookings,
  listFields,
  updateBookingStatus,
} from '../api'
import { getErrorMessage } from '../api/client'
import { useAuth } from '../auth/useAuth'
import BookingModal, { type BookingFormPayload } from '../components/booking/BookingModal'
import DateNav from '../components/booking/DateNav'
import FieldPicker from '../components/booking/FieldPicker'
import ErrorState from '../components/common/ErrorState'
import FadeUp from '../components/common/FadeUp'
import Skeleton from '../components/common/Skeleton'
import CourtGallery from '../components/courts/CourtGallery'
import ServicesSection from '../components/services/ServicesSection'
import LocationSection from '../components/contact/LocationSection'
import type { Booking, BookingStatus, Field } from '../types'
import { bookingDay, todayKey } from '../utils/date'
import { buildSlots, type GridSlot } from '../utils/slots'

interface Notice {
  kind: 'success' | 'danger'
  message: string
}

const TORNEO_LABEL = 'Bloqueada (torneo)'
const BLOQUEO_LABEL = 'Bloqueada (mantenimiento)'

export default function ReservasPage(): React.JSX.Element {
  const queryClient = useQueryClient()
  const { isAdmin, isAuthenticated } = useAuth()
  const [date, setDate] = useState(todayKey())
  const [fieldId, setFieldId] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<GridSlot | null>(null)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [createdBookings, setCreatedBookings] = useState<Booking[]>([])

  const fieldsQuery = useQuery({ queryKey: ['fields'], queryFn: listFields })

  const activeFieldId = fieldId ?? fieldsQuery.data?.[0]?.id ?? null
  const field: Field | undefined =
    fieldsQuery.data?.find((item) => item.id === activeFieldId) ?? undefined

  const bookingsQuery = useQuery({
    queryKey: ['bookings', activeFieldId, date],
    queryFn: () => listBookings(activeFieldId as string, date),
    enabled: activeFieldId !== null,
  })

  const slots = useMemo<GridSlot[]>(() => {
    const dayBookings = (bookingsQuery.data ?? []).filter((booking) =>
      bookingDay(booking.date) === date
    )
    return buildSlots(dayBookings)
  }, [bookingsQuery.data, date])

  function showNotice(kind: Notice['kind'], message: string): void {
    setNotice({ kind, message })
  }

  useEffect(() => {
    if (notice === null) return
    const timer = setTimeout(() => setNotice(null), 5000)
    return () => clearTimeout(timer)
  }, [notice])

  const createMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: (booking) => {
      if (activeFieldId !== null) {
        void queryClient.invalidateQueries({ queryKey: ['bookings', activeFieldId, date] })
      }
      setSelectedSlot(null)
      setCreatedBookings((current) => [...current, booking])
      showNotice('success', 'Reserva solicitada correctamente.')
    },
    onError: (error) => {
      showNotice('danger', getErrorMessage(error))
    },
  })

  const payMutation = useMutation({
    mutationFn: async (booking: Booking) => {
      const checkout = await createCheckout(booking.id)
      if (checkout.provider === 'mercadopago' && checkout.checkoutUrl !== null) {
        window.location.assign(checkout.checkoutUrl)
        return null
      }
      return confirmSandboxPayment(checkout.paymentId)
    },
    onSuccess: (payment) => {
      if (payment === null) return
      setCreatedBookings((current) => current.filter((item) => item.id !== payment.bookingId))
      void queryClient.invalidateQueries({ queryKey: ['bookings'] })
      showNotice('success', 'Pago confirmado. La reserva quedó confirmada.')
    },
    onError: (error) => {
      showNotice('danger', getErrorMessage(error))
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookingStatus }) =>
      updateBookingStatus(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['bookings'] })
      showNotice('success', 'Estado de la reserva actualizado.')
    },
    onError: (error) => {
      showNotice('danger', getErrorMessage(error))
    },
  })

  async function handleSubmit(payload: BookingFormPayload): Promise<void> {
    if (field === undefined || selectedSlot === null) return
    await createMutation.mutateAsync({
      fieldId: field.id,
      date,
      startTime: selectedSlot.start,
      endTime: selectedSlot.end,
      clientInfo: payload.clientInfo,
    })
  }

  if (fieldsQuery.isLoading) {
    return (
      <div className="space-y-8">
        <header>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-mauve/30 bg-lime/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-coffee dark:border-lime/30 dark:bg-lime/10 dark:text-lime">
            Copa 5 · Complejo Deportivo
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Reservá tu cancha</h1>
          <p className="mt-1 text-sm text-tertiary dark:text-mauve-soft">
            Elegí cancha y día, y reservá el horario que quieras. Las reservas de torneo aparecen
            bloqueadas.
          </p>
        </header>

        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-tertiary dark:text-mauve-soft">
            Elegí la cancha
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldCardSkeleton />
            <FieldCardSkeleton />
          </div>
        </section>
      </div>
    )
  }
  if (fieldsQuery.isError) {
    return <ErrorState message={getErrorMessage(fieldsQuery.error)} onRetry={() => void fieldsQuery.refetch()} />
  }

  const fields = fieldsQuery.data ?? []

  return (
    <div className="space-y-8">
      <header>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-mauve/30 bg-lime/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-coffee dark:border-lime/30 dark:bg-lime/10 dark:text-lime">
          Copa 5 · Complejo Deportivo
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Reservá tu cancha</h1>
        <p className="mt-1 text-sm text-tertiary dark:text-mauve-soft">
          Elegí cancha y día, y reservá el horario que quieras. Las reservas de torneo aparecen
          bloqueadas.
        </p>
      </header>

      {notice !== null && (
        <Alert status={notice.kind}>
          <Alert.Description>{notice.message}</Alert.Description>
        </Alert>
      )}

      {createdBookings.length > 0 && (
        <section className="space-y-3">
          {createdBookings.map((booking) => {
            const fieldName =
              typeof booking.fieldId === 'string'
                ? fields.find((item) => item.id === booking.fieldId)?.name ?? 'Cancha'
                : booking.fieldId.name
            return (
              <div
                key={booking.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-cream p-4 shadow-surface dark:border-mauve dark:bg-coffee-elev"
              >
                <div>
                  <p className="text-sm font-semibold">
                    {fieldName} · {bookingDay(booking.date)} · {booking.startTime} a {booking.endTime}
                  </p>
                  <p className="text-xs text-tertiary dark:text-mauve-soft">
                    Reserva pendiente de pago y confirmación.
                  </p>
                </div>
                {isAuthenticated ? (
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      isDisabled={payMutation.isPending}
                      onPress={() => payMutation.mutate(booking)}
                    >
                      Pagar ahora
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onPress={() =>
                        setCreatedBookings((current) =>
                          current.filter((item) => item.id !== booking.id)
                        )
                      }
                    >
                      Quitar
                    </Button>
                  </div>
                ) : (
                  <span className="text-xs text-tertiary dark:text-mauve-soft">
                    <Link to="/login" className="underline decoration-lime underline-offset-2">
                      Iniciá sesión
                    </Link>{' '}
                    para pagar online.
                  </span>
                )}
              </div>
            )
          })}
        </section>
      )}

      {fields.length === 0 ? (
        <ErrorState message="No hay canchas disponibles todavía." />
      ) : (
        <>
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-tertiary dark:text-mauve-soft">
              Elegí la cancha
            </h2>
            <FieldPicker fields={fields} selectedFieldId={activeFieldId} onSelect={setFieldId} />
          </section>

          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-tertiary dark:text-mauve-soft">
                Disponibilidad
              </h2>
              <DateNav date={date} onChange={setDate} />
            </div>

            {bookingsQuery.isLoading ? (
              <SlotsSkeleton />
            ) : bookingsQuery.isError ? (
              <ErrorState
                message={getErrorMessage(bookingsQuery.error)}
                onRetry={() => void bookingsQuery.refetch()}
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {slots.map((slot, index) => {
                  const chipMeta =
                    slot.kind === 'torneo'
                      ? { label: TORNEO_LABEL, color: 'accent' as const }
                      : slot.kind === 'mantenimiento'
                        ? { label: BLOQUEO_LABEL, color: 'warning' as const }
                        : slot.kind === 'confirmada'
                          ? { label: 'Confirmada', color: 'success' as const }
                          : slot.kind === 'pendiente'
                            ? { label: 'Pendiente', color: 'warning' as const }
                            : null
                  const ocupado = slot.kind !== 'libre'
                  const booking = slot.booking
                  const isAlertChip =
                    slot.kind === 'torneo' || slot.kind === 'mantenimiento' || slot.kind === 'pendiente'
                  return (
                    <FadeUp key={slot.start} delayMs={Math.min(index, 8) * 40}>
                      <div
                        className={`flex h-full items-center justify-between gap-3 rounded-xl border p-4 shadow-surface transition-all duration-300 ${
                          ocupado
                            ? 'border-line bg-cream/70 dark:border-mauve/70 dark:bg-mauve-deep/50'
                            : 'border-lime/60 bg-cream hover:-translate-y-0.5 hover:shadow-xl dark:border-lime/50 dark:bg-coffee-elev'
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span
                            className={`font-mono text-sm font-semibold ${
                              ocupado
                                ? 'text-coffee/70 dark:text-mauve-soft'
                                : 'text-coffee dark:text-[#f3efe8]'
                            }`}
                          >
                            {slot.label}
                          </span>
                          {chipMeta !== null && booking !== undefined && (
                            <Chip
                              color={chipMeta.color}
                              size="sm"
                              className={isAlertChip ? 'animate-pulse' : undefined}
                            >
                              {chipMeta.label}
                            </Chip>
                          )}
                        </div>
                        {slot.kind === 'libre' ? (
                          <Button variant="primary" size="sm" onPress={() => setSelectedSlot(slot)}>
                            Reservar
                          </Button>
                        ) : isAdmin && booking !== undefined && slot.kind === 'pendiente' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onPress={() =>
                              statusMutation.mutate({ id: booking.id, status: 'confirmada' })
                            }
                          >
                            Confirmar
                          </Button>
                        ) : isAdmin && booking !== undefined && slot.kind === 'confirmada' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onPress={() =>
                              statusMutation.mutate({ id: booking.id, status: 'cancelada' })
                            }
                          >
                            Cancelar
                          </Button>
                        ) : null}
                      </div>
                    </FadeUp>
                  )
                })}
              </div>
            )}
          </section>
        </>
      )}

      <CourtGallery />
      <ServicesSection />
      <LocationSection />

      {field !== undefined && selectedSlot !== null && (
        <BookingModal
          field={field}
          date={date}
          slot={selectedSlot}
          isSubmitting={createMutation.isPending}
          onSubmit={handleSubmit}
          onClose={() => setSelectedSlot(null)}
        />
      )}
    </div>
  )
}

function FieldCardSkeleton(): React.JSX.Element {
  return (
    <div className="overflow-hidden rounded-2xl border-2 border-transparent bg-cream shadow-surface dark:bg-coffee-elev">
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  )
}

function SlotsSkeleton(): React.JSX.Element {
  return (
    <div
      role="status"
      aria-label="Consultando horarios"
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          className="flex items-center justify-between gap-3 rounded-xl border border-line bg-cream p-4 shadow-surface dark:border-mauve dark:bg-coffee-elev"
        >
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-8 w-24" />
        </div>
      ))}
    </div>
  )
}