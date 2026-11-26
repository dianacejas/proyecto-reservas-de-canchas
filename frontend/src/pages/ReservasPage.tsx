import { Alert, Button } from '@heroui/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  confirmSandboxPayment,
  createBooking,
  createCheckout,
  listBookings,
  listFields,
  queryKeys,
  updateBookingStatus,
} from '../api'
import { API_BASE_URL, getErrorMessage } from '../api/client'
import { useAuth } from '../auth/useAuth'
import BookingModal, { type BookingFormPayload } from '../components/booking/BookingModal'
import DateNav from '../components/booking/DateNav'
import FieldPicker from '../components/booking/FieldPicker'
import PaymentModal from '../components/booking/PaymentModal'
import ShareBookingModal from '../components/booking/ShareBookingModal'
import ErrorState from '../components/common/ErrorState'
import FadeUp from '../components/common/FadeUp'
import Skeleton from '../components/common/Skeleton'
import CourtGallery from '../components/courts/CourtGallery'
import VenueAdvantages from '../components/courts/VenueAdvantages'
import HeroSection, { type RoofFilter, type TimeBandFilter } from '../components/HeroSection'
import ServicesSection from '../components/services/ServicesSection'
import LocationSection from '../components/contact/LocationSection'
import {
  ArrowRightIcon,
  BoltIcon,
  FlameIcon,
  LockIcon,
  MoonIcon,
  SunIcon,
  UsersIcon,
} from '../components/common/Icons'
import WeatherBadge from '../components/booking/WeatherBadge'
import type { Booking, BookingStatus, Field, PaymentType } from '../types'
import { bookingDay, todayKey } from '../utils/date'
import { buildSlots, isPeakSlot, type GridSlot } from '../utils/slots'

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
  const [paidBookings, setPaidBookings] = useState<Booking[]>([])
  const [payingBooking, setPayingBooking] = useState<Booking | null>(null)
  const [sharingBooking, setSharingBooking] = useState<Booking | null>(null)
  const [timeBand, setTimeBand] = useState<TimeBandFilter>('todos')
  const [splitByTen, setSplitByTen] = useState(false)

  const fieldsQuery = useQuery({
    queryKey: queryKeys.fields(),
    queryFn: listFields,
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  })

  const activeFieldId = fieldId ?? fieldsQuery.data?.[0]?.id ?? null
  const field: Field | undefined =
    fieldsQuery.data?.find((item) => item.id === activeFieldId) ?? undefined

  const bookingsQuery = useQuery({
    queryKey: queryKeys.bookings(activeFieldId, date),
    queryFn: () => listBookings(activeFieldId as string, date),
    enabled: activeFieldId !== null,
  })

  const slots = useMemo<GridSlot[]>(() => {
    const dayBookings = (bookingsQuery.data ?? []).filter((booking) =>
      bookingDay(booking.date) === date
    )
    return buildSlots(dayBookings).map((slot) => ({
      ...slot,
      isPeak: isPeakSlot(date, slot.start),
    }))
  }, [bookingsQuery.data, date])

  const filteredSlots = useMemo(() => {
    if (timeBand === 'tarde') return slots.filter((s) => s.start < '19:00')
    if (timeBand === 'noche') return slots.filter((s) => s.start >= '19:00')
    return slots
  }, [slots, timeBand])

  function showNotice(kind: Notice['kind'], message: string): void {
    setNotice({ kind, message })
  }

  useEffect(() => {
    if (notice === null) return
    const timer = setTimeout(() => setNotice(null), 5000)
    return () => clearTimeout(timer)
  }, [notice])

  // Sincronización en tiempo real vía Server-Sent Events (SSE)
  useEffect(() => {
    const eventSource = new EventSource(`${API_BASE_URL}/bookings/stream`)

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as { date?: string }
        if (!payload.date || payload.date === date) {
          void queryClient.invalidateQueries({ queryKey: queryKeys.bookings() })
        }
      } catch {
        void queryClient.invalidateQueries({ queryKey: queryKeys.bookings() })
      }
    }

    return () => {
      eventSource.close()
    }
  }, [date, queryClient])

  const createMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: (booking) => {
      if (activeFieldId !== null) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.bookings(activeFieldId, date) })
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
    mutationFn: async ({
      booking,
      paymentType,
    }: {
      booking: Booking
      paymentType: PaymentType
    }) => {
      const checkout = await createCheckout(booking.id, paymentType)
      if (checkout.provider === 'mercadopago' && checkout.checkoutUrl !== null) {
        window.location.assign(checkout.checkoutUrl)
        return null
      }
      return confirmSandboxPayment(checkout.paymentId)
    },
    onSuccess: (payment, variables) => {
      if (payment === null) return
      setPayingBooking(null)
      setCreatedBookings((current) => current.filter((item) => item.id !== variables.booking.id))
      setPaidBookings((current) => [
        ...current.filter((item) => item.id !== variables.booking.id),
        { ...variables.booking, status: 'confirmada' },
      ])
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookings() })
      void queryClient.invalidateQueries({ queryKey: queryKeys.myBookings() })
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
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookings() })
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

  if (fieldsQuery.isError) {
    return <ErrorState message={getErrorMessage(fieldsQuery.error)} onRetry={() => void fieldsQuery.refetch()} />
  }

  const fields = fieldsQuery.data ?? []
  const freeSlotsCount = slots.filter((s) => s.kind === 'libre').length
  const freeNightSlotsCount = slots.filter((s) => s.kind === 'libre' && s.start >= '20:00').length
  const occupancyPct =
    slots.length > 0 ? Math.round(((slots.length - freeSlotsCount) / slots.length) * 100) : 0

  function handleQuickSearch(band: TimeBandFilter, roof: RoofFilter): void {
    setTimeBand(band)
    if (roof !== 'todas' && fields.length > 0) {
      const match = fields.find((f) => {
        const covered = f.isCovered ?? f.name.toLowerCase().includes('techad')
        return roof === 'techada' ? covered : !covered
      })
      if (match) setFieldId(match.id)
    }
  }

  return (
    <div className="w-full">
      <HeroSection onQuickSearch={handleQuickSearch} freeSlotsCount={freeSlotsCount} />

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-8 py-8 sm:py-16 md:py-28 space-y-12 sm:space-y-20 md:space-y-32">
        <div id="reservas" className="scroll-mt-24 sm:scroll-mt-28 space-y-8 sm:space-y-10">
          <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#c5d86d]/30 bg-[#c5d86d]/15 px-3 py-1 text-xs font-bold text-neutral-100">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#c5d86d] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#c5d86d]" />
                </span>
                {occupancyPct >= 50 ? (
                  <>
                    <FlameIcon className="size-3.5 text-[#c5d86d]" />
                    <span>
                      Alta demanda ({occupancyPct}% reservado) · Quedan {freeSlotsCount} turnos libres
                    </span>
                  </>
                ) : (
                  <>
                    <BoltIcon className="size-3.5 text-[#c5d86d]" />
                    <span>
                      Reserva inmediata · {freeSlotsCount} turnos disponibles para esta fecha
                    </span>
                  </>
                )}
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white">
                Elegí tu cancha <span className="text-neutral-400 font-light">|</span>{' '}
                <span className="text-[#c5d86d]">y horario</span>
              </h2>
              <p className="mt-2 text-base md:text-lg max-w-2xl text-neutral-400 leading-relaxed">
                Canchas sintéticas de alta gama. Reservá con el 50% de seña online.
              </p>
            </div>

            {/* Switch interactivo Modo Vaquita (÷ 10 jugadores) */}
            <button
              type="button"
              onClick={() => setSplitByTen((prev) => !prev)}
              aria-pressed={splitByTen}
              className={`inline-flex items-center gap-3 self-start rounded-2xl border px-4 py-2.5 text-xs font-bold transition-all cursor-pointer lg:self-auto ${
                splitByTen
                  ? 'border-[#c5d86d] bg-[#c5d86d]/20 text-white shadow-sm'
                  : 'border-white/10 bg-neutral-900 text-neutral-300 hover:border-[#c5d86d]'
              }`}
            >
              <span className="flex size-7 items-center justify-center rounded-lg bg-[#c5d86d]/25 text-[#c5d86d]">
                <UsersIcon className="size-4" />
              </span>
              <div className="text-left">
                <span className="block font-extrabold">Modo Vaquita (÷ 10 jugadores)</span>
                <span className="block text-[11px] font-medium text-neutral-400">
                  {splitByTen ? 'Mostrando precio individual c/u' : 'Ver cuánto paga cada jugador'}
                </span>
              </div>
              <span
                className={`ml-1 inline-flex h-5 w-9 items-center rounded-full p-0.5 transition-colors ${
                  splitByTen ? 'bg-[#c5d86d]' : 'bg-neutral-700'
                }`}
              >
                <span
                  className={`size-4 rounded-full bg-neutral-950 transition-transform ${
                    splitByTen ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </span>
            </button>
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
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] border-white/10 bg-neutral-900/50"
                  >
                    <div>
                      <p className="text-sm font-semibold">
                        {fieldName} · {bookingDay(booking.date)} · {booking.startTime} a {booking.endTime}
                      </p>
                      <p className="text-xs text-neutral-400">
                        Reserva pendiente de pago y confirmación.
                      </p>
                    </div>
                {isAuthenticated ? (
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onPress={() => setPayingBooking(booking)}
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
                  <span className="text-xs text-mauve-soft">
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

      {paidBookings.length > 0 && (
        <section className="space-y-3">
          {paidBookings.map((booking) => {
            return (
              <div
                key={booking.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 shadow-surface border-lime/40 bg-lime/10"
              >
                <div>
                  <p className="text-sm font-semibold">
                    ¡Pago confirmado! ·{' '}
                    {fields.find((item) => item.id === booking.fieldId)?.name ?? 'Tu cancha'} ·{' '}
                    {bookingDay(booking.date)} · {booking.startTime} a {booking.endTime}
                  </p>
                  <p className="text-xs text-mauve-soft">
                    Saldo pendiente en cancha: $
                    {booking.remainingBalance.toLocaleString('es-AR')}. Podés gestionarla en{' '}
                    <Link to="/mis-reservas" className="underline decoration-lime underline-offset-2">
                      Mis Reservas
                    </Link>
                    .
                  </p>
                </div>
                <Button variant="outline" size="sm" className="min-h-11" onPress={() => setSharingBooking(booking)}>
                  Compartir con el equipo
                </Button>
              </div>
            )
          })}
        </section>
      )}

      {fieldsQuery.isLoading ? (
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#c5d86d] opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#c5d86d]" />
            </span>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">
              Conectando con el complejo deportivo...
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldCardSkeleton />
            <FieldCardSkeleton />
          </div>
        </section>
      ) : fields.length === 0 ? (
        <ErrorState message="No hay canchas disponibles todavía." />
      ) : (
        <>
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-400">
              1. Elegí la cancha
            </h2>
            <FieldPicker
              fields={fields}
              selectedFieldId={activeFieldId}
              onSelect={setFieldId}
              splitByTen={splitByTen}
            />
          </section>

          <section className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">
                  2. Disponibilidad en {field?.name ?? 'Cancha'}
                </h2>
                <WeatherBadge
                  selectedDate={date}
                  isCovered={
                    field?.isCovered ??
                    /techad|indoor|cubiert|climat/i.test(`${field?.name ?? ''} ${field?.type ?? ''}`)
                  }
                />
              </div>
              <DateNav date={date} onChange={setDate} />
            </div>

            {/* Filtro rápido de franjas horarias */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/10 bg-neutral-900/60 px-3 py-2 shadow-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setTimeBand('todos')}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
                    timeBand === 'todos'
                      ? 'bg-[#c5d86d] text-neutral-950'
                      : 'text-neutral-400 hover:bg-neutral-800'
                  }`}
                >
                  Todos ({slots.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTimeBand('tarde')}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
                    timeBand === 'tarde'
                      ? 'bg-[#c5d86d] text-neutral-950'
                      : 'text-neutral-400 hover:bg-neutral-800'
                  }`}
                >
                  <SunIcon className="size-3.5" />
                  Tarde Promo (&lt; 19h)
                </button>
                <button
                  type="button"
                  onClick={() => setTimeBand('noche')}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
                    timeBand === 'noche'
                      ? 'bg-[#c5d86d] text-neutral-950'
                      : 'text-neutral-400 hover:bg-neutral-800'
                  }`}
                >
                  <MoonIcon className="size-3.5" />
                  Prime Nocturno (19h – 23h)
                </button>
              </div>
              {field && (
                <span className="text-xs font-semibold text-neutral-400">
                  {splitByTen
                    ? `Valor por jugador: $${Math.round(field.pricePerHour / 10).toLocaleString('es-AR')} c/u`
                    : `Valor turno completo: $${field.pricePerHour.toLocaleString('es-AR')}`}
                </span>
              )}
            </div>

            {bookingsQuery.isLoading ? (
              <SlotsSkeleton />
            ) : bookingsQuery.isError ? (
              <ErrorState
                message={getErrorMessage(bookingsQuery.error)}
                onRetry={() => void bookingsQuery.refetch()}
              />
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {filteredSlots.map((slot, index) => {
                  const isLibre = slot.kind === 'libre'
                  const slotBasePrice = slot.isPeak
                    ? field?.peakPricePerHour || field?.pricePerHour || 38000
                    : field?.standardPricePerHour || field?.pricePerHour || 38000
                  const displaySlotPrice = splitByTen
                    ? Math.round(slotBasePrice / 10)
                    : slotBasePrice
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
                  const booking = slot.booking

                  return (
                    <FadeUp key={slot.start} delayMs={Math.min(index, 8) * 30}>
                      {isLibre ? (
                        <button
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`group flex w-full items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900 p-3 text-left transition-all duration-150 active:scale-95 active:ring-2 active:ring-[#c5d86d] active:shadow-[0_0_20px_rgba(197,216,109,0.35)] ${
                            selectedSlot?.start === slot.start
                              ? 'ring-2 ring-[#c5d86d] shadow-[0_0_20px_rgba(197,216,109,0.35)]'
                              : 'hover:border-[#c5d86d] hover:shadow-md'
                          }`}
                        >
                          <div className="flex flex-col items-start gap-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-base font-bold text-white">
                                {slot.start}
                              </span>
                              {slot.start >= '20:00' && slot.start <= '22:00' && freeNightSlotsCount <= 2 && (
                                <span className="rounded bg-[#c5d86d]/20 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#c5d86d]">
                                  Último slot
                                </span>
                              )}
                            </div>
                            <span className="rounded-md bg-neutral-800 px-2 py-0.5 text-[10px] font-bold text-stone-300">
                              ${displaySlotPrice.toLocaleString('es-AR')} {splitByTen ? 'c/u' : ''} ·{' '}
                              {slot.isPeak ? 'Pico' : 'Promo'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-[#c5d86d]">
                            <span className="hidden sm:inline">Reservar</span>
                            <ArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-1" />
                          </div>
                        </button>
                      ) : (
                        <div className="flex w-full items-center justify-between rounded-xl border border-neutral-800/80 bg-neutral-900/40 p-3 opacity-75">
                          <div className="flex min-w-0 flex-col items-start gap-1">
                            <span className="font-mono text-base font-bold text-neutral-400">
                              {slot.start}
                            </span>
                            <div className="flex items-center gap-1">
                              <LockIcon className="size-3 shrink-0 text-neutral-500" />
                              <span className="truncate text-[10px] font-semibold text-neutral-400">
                                {chipMeta?.label ?? 'Ocupado'}
                              </span>
                            </div>
                          </div>
                          {isAdmin && booking !== undefined && slot.kind === 'pendiente' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 shrink-0 text-xs"
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
                              className="h-8 shrink-0 text-xs"
                              onPress={() =>
                                statusMutation.mutate({ id: booking.id, status: 'cancelada' })
                              }
                            >
                              Cancelar
                            </Button>
                          ) : (
                            <span className="text-[11px] font-medium text-neutral-500">
                              No disp.
                            </span>
                          )}
                        </div>
                      )}
                    </FadeUp>
                  )
                })}
              </div>
            )}
</section>
        </>
      )}
        </div>

        <VenueAdvantages />

        <CourtGallery />
        <ServicesSection />
        <LocationSection />
      </div>

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

      {payingBooking !== null && (
        <PaymentModal
          booking={payingBooking}
          fieldName={fields.find((item) => item.id === payingBooking.fieldId)?.name ?? 'Tu cancha'}
          isSubmitting={payMutation.isPending}
          onConfirm={(paymentType) => payMutation.mutate({ booking: payingBooking, paymentType })}
          onClose={() => setPayingBooking(null)}
        />
      )}

      {sharingBooking !== null && (
        <ShareBookingModal
          share={{
            fieldName: fields.find((item) => item.id === sharingBooking.fieldId)?.name ?? 'Tu cancha',
            dateKey: bookingDay(sharingBooking.date),
            startTime: sharingBooking.startTime,
            endTime: sharingBooking.endTime,
            totalAmount: sharingBooking.totalAmount,
          }}
          onClose={() => setSharingBooking(null)}
        />
      )}
    </div>
  )
}

function FieldCardSkeleton(): React.JSX.Element {
  return (
    <div className="overflow-hidden rounded-2xl border-2 border-transparent shadow-surface bg-neutral-900/50">
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
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
    >
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          className="flex items-center justify-between gap-3 rounded-xl border p-4 shadow-surface border-white/10 bg-neutral-900/50"
        >
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-8 w-24" />
        </div>
      ))}
    </div>
  )
}