import { Booking, Field, Payment, type BookingDoc } from '../models/index.js'
import { AppError } from '../utils/AppError.js'
import { assertFound } from '../utils/assertFound.js'
import { dayStart, parseDay } from '../utils/time.js'
import { DAILY_SLOTS } from '../utils/slots.js'

export interface DailyMetrics {
  date: string
  recaudacion: {
    mostrador: number
    pasarela: number
    total: number
  }
  saldoPorCobrar: {
    senasAbonadas: number
    saldoRestante: number
    total: number
  }
  ocupacion: {
    ocupados: number
    totalTurnos: number
    porcentaje: number
  }
  cancelaciones: {
    cantidad: number
    montoPerdido: number
  }
  turnos: {
    confirmadas: number
    pendientes: number
    pagadas: number
    bloqueadas: number
    canceladas: number
  }
}

export interface AdminCustomer {
  id: string
  name: string
  phone: string
  whatsapp: string | null
  userId: string | null
  totalReservas: number
  completadas: number
  canceladas: number
  inasistencias: number
  tasaCancelacion: number
  totalRecaudado: number
  ultimaReserva: string | null
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0)
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '')
}

function isLive(booking: { status: string; expiresAt?: Date | null }): boolean {
  if (booking.status !== 'pendiente') return true
  if (!booking.expiresAt) return true
  return booking.expiresAt.getTime() > Date.now()
}

export async function getDailyMetrics(dateKey: string): Promise<DailyMetrics> {
  const day = parseDay(dateKey)
  const [bookings, activeFieldsCount] = await Promise.all([
    Booking.find({ date: day }),
    Field.countDocuments({ isActive: true }),
  ])

  const liveBookings = bookings.filter(isLive)
  const bookingIds = liveBookings.map((booking) => booking._id)

  const payments = bookingIds.length
    ? await Payment.find({ bookingId: { $in: bookingIds }, status: 'pagado' })
    : []

  const mostrador = sum(
    payments.filter((payment) => payment.provider === 'mostrador').map((payment) => payment.amount)
  )
  const pasarela = sum(
    payments.filter((payment) => payment.provider !== 'mostrador').map((payment) => payment.amount)
  )

  const senasAbonadas = sum(
    liveBookings
      .filter((booking) => booking.paymentType === 'deposit')
      .map((booking) => booking.depositAmount)
  )
  const saldoRestante = sum(
    liveBookings
      .filter((booking) => booking.status === 'confirmada')
      .map((booking) => booking.remainingBalance)
  )

  const occupiedCells = new Set<string>()
  for (const booking of liveBookings) {
    if (booking.status === 'cancelada') continue
    const fieldId = booking.fieldId.toString()
    for (const slot of DAILY_SLOTS) {
      if (booking.startTime < slot.end && slot.start < booking.endTime) {
        occupiedCells.add(`${fieldId}:${slot.start}`)
      }
    }
  }

  const totalTurnos = activeFieldsCount * DAILY_SLOTS.length
  const ocupados = Math.min(occupiedCells.size, totalTurnos)
  const porcentaje = totalTurnos === 0 ? 0 : Math.round((ocupados / totalTurnos) * 100)

  const canceladas = bookings.filter((booking) => booking.status === 'cancelada')

  return {
    date: dateKey,
    recaudacion: {
      mostrador,
      pasarela,
      total: mostrador + pasarela,
    },
    saldoPorCobrar: {
      senasAbonadas,
      saldoRestante,
      total: senasAbonadas + saldoRestante,
    },
    ocupacion: {
      ocupados,
      totalTurnos,
      porcentaje,
    },
    cancelaciones: {
      cantidad: canceladas.length,
      montoPerdido: sum(canceladas.map((booking) => booking.totalAmount)),
    },
    turnos: {
      confirmadas: bookings.filter((booking) => booking.status === 'confirmada').length,
      pendientes: bookings.filter((booking) => booking.status === 'pendiente').length,
      pagadas: bookings.filter((booking) => booking.status === 'pagada').length,
      bloqueadas: bookings.filter((booking) => booking.type === 'mantenimiento').length,
      canceladas: canceladas.length,
    },
  }
}

interface CustomerAggregate {
  id: string
  name: string
  phone: string
  userId: string | null
  totalReservas: number
  completadas: number
  canceladas: number
  inasistencias: number
  totalRecaudado: number
  ultimaReserva: Date | null
}

export async function listCustomers(): Promise<AdminCustomer[]> {
  const [bookings, payments] = await Promise.all([
    // El _id ordena por creación: el primero que aparece por cliente es el más reciente.
    Booking.find({ type: 'amistoso' }).sort({ _id: -1 }),
    Payment.find({ status: 'pagado' }),
  ])

  const paidByBooking = new Map<string, number>()
  for (const payment of payments) {
    const key = payment.bookingId.toString()
    paidByBooking.set(key, (paidByBooking.get(key) ?? 0) + payment.amount)
  }

  const today = dayStart(new Date())
  const groups = new Map<string, CustomerAggregate>()

  for (const booking of bookings) {
    const clientName = booking.clientInfo?.name ?? 'Sin nombre'
    const clientPhone = booking.clientInfo?.phone ?? ''
    const phone = normalizePhone(clientPhone)
    if (phone.length < 6) continue

    const userId = booking.userId ? booking.userId.toString() : null
    const key = userId ? `user:${userId}` : `phone:${phone}`

    let group = groups.get(key)
    if (group === undefined) {
      group = {
        id: key,
        name: clientName,
        phone: clientPhone,
        userId,
        totalReservas: 0,
        completadas: 0,
        canceladas: 0,
        inasistencias: 0,
        totalRecaudado: 0,
        ultimaReserva: null,
      }
      groups.set(key, group)
    }

    const bookingDate = new Date(booking.date)
    if (group.ultimaReserva === null || bookingDate > group.ultimaReserva) {
      group.ultimaReserva = bookingDate
    }

    group.totalReservas += 1
    group.totalRecaudado += paidByBooking.get(booking._id.toString()) ?? 0

    if (booking.status === 'cancelada') {
      group.canceladas += 1
    } else if (booking.status === 'pagada') {
      group.completadas += 1
    } else if (booking.status === 'confirmada' && bookingDate < today) {
      if (booking.remainingBalance > 0) group.inasistencias += 1
      else group.completadas += 1
    }
  }

  return Array.from(groups.values())
    .map((group) => {
      const normalized = normalizePhone(group.phone)
      const perdidas = group.canceladas + group.inasistencias
      return {
        id: group.id,
        name: group.name,
        phone: group.phone,
        whatsapp: normalized.length >= 6 ? normalized : null,
        userId: group.userId,
        totalReservas: group.totalReservas,
        completadas: group.completadas,
        canceladas: group.canceladas,
        inasistencias: group.inasistencias,
        tasaCancelacion:
          group.totalReservas === 0 ? 0 : Math.round((perdidas / group.totalReservas) * 100),
        totalRecaudado: group.totalRecaudado,
        ultimaReserva: group.ultimaReserva ? group.ultimaReserva.toISOString().slice(0, 10) : null,
      }
    })
    .sort((a, b) => b.totalReservas - a.totalReservas || a.name.localeCompare(b.name))
}

export async function completeBookingAtDoor(id: string): Promise<BookingDoc> {
  const booking = assertFound(
    await Booking.findById(id).populate('fieldId', 'name type'),
    'Reserva no encontrada'
  )

  if (booking.type === 'mantenimiento') {
    throw new AppError(409, 'Un bloqueo operativo no se puede cobrar')
  }
  if (booking.status === 'cancelada') {
    throw new AppError(409, 'La reserva está cancelada')
  }
  if (booking.status === 'pagada') return booking

  const pending = Math.max(booking.remainingBalance ?? 0, 0)
  if (pending > 0) {
    await Payment.create({
      bookingId: booking._id,
      provider: 'mostrador',
      amount: pending,
      paymentType: 'full',
      status: 'pagado',
    })
  }

  booking.set({ status: 'pagada', remainingBalance: 0, expiresAt: null })
  await booking.save()
  return booking
}