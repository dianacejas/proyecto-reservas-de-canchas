import { Alert, Button, Chip } from '@heroui/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  cancelMyBooking,
  confirmSandboxPayment,
  createCheckout,
  listMyBookings,
} from '../../api'
import { getErrorMessage } from '../../api/client'
import type { Booking, BookingStatus, PaymentType } from '../../types'
import { bookingDay, formatLong } from '../../utils/date'
import { CANCEL_WINDOW_HOURS, formatCurrency } from '../../utils/payments'
import { resolveFieldName } from '../../utils/whatsapp'
import ErrorState from '../common/ErrorState'
import Loading from '../common/Loading'
import PaymentModal from './PaymentModal'
import ShareBookingModal from './ShareBookingModal'

type Tab = 'upcoming' | 'history'

const STATUS_META: Record<BookingStatus, { label: string; color: 'warning' | 'success' | 'danger' | 'default' | 'accent' }> = {
  pendiente: { label: 'Pendiente', color: 'warning' },
  confirmada: { label: 'Confirmada', color: 'success' },
  pagada: { label: 'Pagada', color: 'success' },
  cancelada: { label: 'Cancelada', color: 'danger' },
  bloqueada: { label: 'Bloqueada', color: 'accent' },
}

function turnDate(booking: Booking): Date {
  return new Date(`${bookingDay(booking.date)}T${booking.startTime}:00`)
}

function hoursUntil(booking: Booking): number {
  return (turnDate(booking).getTime() - Date.now()) / 3_600_000
}

function canCancel(booking: Booking): boolean {
  return (
    (booking.status === 'pendiente' || booking.status === 'confirmada') &&
    hoursUntil(booking) > CANCEL_WINDOW_HOURS
  )
}

export default function MyBookingsView(): React.JSX.Element {
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<Tab>('upcoming')
  const [payingBooking, setPayingBooking] = useState<Booking | null>(null)
  const [sharingBooking, setSharingBooking] = useState<Booking | null>(null)
  const [notice, setNotice] = useState<{ kind: 'success' | 'danger'; message: string } | null>(null)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(timer)
  }, [])

  const bookingsQuery = useQuery({ queryKey: ['my-bookings'], queryFn: listMyBookings })

  const { upcoming, history } = useMemo(() => {
    const all = bookingsQuery.data ?? []
    const upcomingList = all
      .filter((booking) => booking.status !== 'cancelada' && turnDate(booking).getTime() >= now)
      .sort((a, b) => turnDate(a).getTime() - turnDate(b).getTime())
    const historyList = all
      .filter((booking) => booking.status === 'cancelada' || turnDate(booking).getTime() < now)
      .sort((a, b) => turnDate(b).getTime() - turnDate(a).getTime())
    return { upcoming: upcomingList, history: historyList }
  }, [bookingsQuery.data, now])

  function invalidate(): void {
    void queryClient.invalidateQueries({ queryKey: ['my-bookings'] })
    void queryClient.invalidateQueries({ queryKey: ['bookings'] })
  }

  const payMutation = useMutation({
    mutationFn: async ({ booking, paymentType }: { booking: Booking; paymentType: PaymentType }) => {
      const checkout = await createCheckout(booking.id, paymentType)
      if (checkout.provider === 'mercadopago' && checkout.checkoutUrl !== null) {
        window.location.assign(checkout.checkoutUrl)
        return null
      }
      return confirmSandboxPayment(checkout.paymentId)
    },
    onSuccess: (payment) => {
      setPayingBooking(null)
      if (payment === null) return
      invalidate()
      setNotice({ kind: 'success', message: 'Pago confirmado. La reserva quedó confirmada.' })
    },
    onError: (error) => {
      setNotice({ kind: 'danger', message: getErrorMessage(error) })
    },
  })

  const cancelMutation = useMutation({
    mutationFn: (booking: Booking) => cancelMyBooking(booking.id),
    onSuccess: () => {
      invalidate()
      setNotice({ kind: 'success', message: 'Reserva cancelada. El turno quedó liberado.' })
    },
    onError: (error) => {
      setNotice({ kind: 'danger', message: getErrorMessage(error) })
    },
  })

  if (bookingsQuery.isLoading) return <Loading label="Cargando tus reservas…" />
  if (bookingsQuery.isError) {
    return (
      <ErrorState
        message={getErrorMessage(bookingsQuery.error)}
        onRetry={() => void bookingsQuery.refetch()}
      />
    )
  }

  const list = tab === 'upcoming' ? upcoming : history

  return (
    <div className="space-y-5">
      {notice !== null && (
        <Alert status={notice.kind}>
          <Alert.Description>{notice.message}</Alert.Description>
        </Alert>
      )}

      <div className="flex gap-2">
        <Button
          variant={tab === 'upcoming' ? 'secondary' : 'ghost'}
          size="sm"
          className="min-h-11 flex-1"
          onPress={() => setTab('upcoming')}
        >
          Próximos Turnos ({upcoming.length})
        </Button>
        <Button
          variant={tab === 'history' ? 'secondary' : 'ghost'}
          size="sm"
          className="min-h-11 flex-1"
          onPress={() => setTab('history')}
        >
          Historial ({history.length})
        </Button>
      </div>

      {list.length === 0 ? (
        <p className="rounded-xl border border-line bg-cream p-6 text-center text-sm text-tertiary dark:border-mauve dark:bg-coffee-elev dark:text-mauve-soft">
          {tab === 'upcoming'
            ? 'No tenés turnos próximos. '
            : 'Todavía no hay reservas en tu historial. '}
          <Link to="/#reservas" className="underline decoration-lime underline-offset-2">
            Reservá una cancha
          </Link>
        </p>
      ) : (
        <ul className="space-y-3">
          {list.map((booking) => {
            const fieldName = resolveFieldName(booking)
            const meta = STATUS_META[booking.status]
            const cancelable = canCancel(booking)
            return (
              <li
                key={booking.id}
                className="space-y-4 rounded-xl border border-line bg-cream p-4 shadow-surface dark:border-mauve dark:bg-coffee-elev"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-coffee dark:text-[#f3efe8]">{fieldName}</p>
                    <p className="text-sm text-tertiary dark:text-mauve-soft">
                      {formatLong(bookingDay(booking.date))} · {booking.startTime} a {booking.endTime}
                    </p>
                  </div>
                  <Chip color={meta.color} size="sm">
                    {meta.label}
                  </Chip>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                  <Amount label="Total" value={booking.totalAmount} />
                  <Amount
                    label={booking.paymentType === 'deposit' ? 'Seña abonada' : 'Abonado'}
                    value={booking.depositAmount}
                  />
                  <Amount label="Saldo en cancha" value={booking.remainingBalance} highlight />
                  <Amount
                    label="Cliente"
                    value={booking.clientInfo.name}
                    isCurrency={false}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {booking.status === 'pendiente' && (
                    <Button
                      variant="primary"
                      size="sm"
                      className="min-h-11"
                      onPress={() => setPayingBooking(booking)}
                    >
                      Pagar seña / total
                    </Button>
                  )}
                  {(booking.status === 'confirmada' || booking.status === 'pagada') && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="min-h-11"
                      onPress={() => setSharingBooking(booking)}
                    >
                      Compartir con el equipo
                    </Button>
                  )}
                  {cancelable && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="min-h-11"
                      isDisabled={cancelMutation.isPending}
                      onPress={() => cancelMutation.mutate(booking)}
                    >
                      Cancelar reserva
                    </Button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {payingBooking !== null && (
        <PaymentModal
          booking={payingBooking}
          fieldName={resolveFieldName(payingBooking)}
          isSubmitting={payMutation.isPending}
          onConfirm={(paymentType) => payMutation.mutate({ booking: payingBooking, paymentType })}
          onClose={() => setPayingBooking(null)}
        />
      )}

      {sharingBooking !== null && (
        <ShareBookingModal
          share={{
            fieldName: resolveFieldName(sharingBooking),
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

function Amount({
  label,
  value,
  highlight = false,
  isCurrency = true,
}: {
  label: string
  value: string | number
  highlight?: boolean
  isCurrency?: boolean
}): React.JSX.Element {
  return (
    <div className="rounded-lg border border-line bg-paper/70 px-3 py-2 dark:border-mauve dark:bg-mauve-deep/60">
      <p className="text-xs text-tertiary dark:text-mauve-soft">{label}</p>
      <p
        className={`font-semibold ${
          highlight ? 'text-coffee dark:text-lime' : 'text-coffee dark:text-[#f3efe8]'
        }`}
      >
        {isCurrency ? formatCurrency(Number(value)) : value}
      </p>
    </div>
  )
}
