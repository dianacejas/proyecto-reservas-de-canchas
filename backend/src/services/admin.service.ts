import { Booking, Field, Payment, type BookingDoc } from '../models/index.js'
import { AppError } from '../utils/AppError.js'
import { assertFound } from '../utils/assertFound.js'
import { dayStart, parseDay } from '../utils/time.js'
import { DAILY_SLOTS } from '../utils/slots.js'
import { broadcastBookingStream } from './bookingSse.service.js'
import type { AddConsumptionInput, BlockCourtInput, MetricsQuery, SettleBookingInput, UnblockCourtInput } from '../schemas/index.js'

export interface DailyMetrics {
  date: string
  startDate?: string
  endDate?: string
  onlineRevenue: number
  counterRevenue: {
    efectivo: number
    transferencia: number
    debito: number
    total: number
  }
  totalRevenue: number
  occupancyRate: number
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
  topCourt?: {
    name: string
    totalRevenue: number
    bookingsCount: number
  } | null
  peakHour?: {
    timeSlot: string
    occupancyPercentage: number
    bookingsCount: number
  } | null
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

export async function getMetricsReport(
  params: MetricsQuery = {}
): Promise<DailyMetrics> {
  const isRange = Boolean(params.startDate && params.endDate)
  const startDay = params.startDate ? parseDay(params.startDate) : (params.date ? parseDay(params.date) : dayStart(new Date()))
  const endDay = params.endDate ? parseDay(params.endDate) : (params.date ? parseDay(params.date) : dayStart(new Date()))

  const dateFilter = {
    $gte: startDay,
    $lte: new Date(endDay.getTime() + 24 * 60 * 60 * 1000 - 1),
  }

  const [bookings, activeFieldsCount] = await Promise.all([
    Booking.find({ date: dateFilter }).lean(),
    Field.countDocuments({ isActive: true }),
  ])

  const liveBookings = bookings.filter(isLive)
  const bookingIds = liveBookings.map((b) => b._id)

  const payments = bookingIds.length
    ? await Payment.find({ bookingId: { $in: bookingIds }, status: 'pagado' }).lean()
    : []

  let efectivo = 0
  let transferencia = 0
  let debito = 0

  for (const b of liveBookings) {
    if (b.status === 'pagada') {
      const balanceSettled = Math.max(b.totalAmount - b.depositAmount, 0)
      if (b.counterPaymentMethod === 'efectivo') efectivo += balanceSettled
      else if (b.counterPaymentMethod === 'transferencia') transferencia += balanceSettled
      else if (b.counterPaymentMethod === 'debito') debito += balanceSettled
    }
  }

  for (const p of payments) {
    if (p.provider === 'mostrador') {
      if (p.externalId === 'efectivo' && efectivo === 0) efectivo += p.amount
      else if (p.externalId === 'transferencia' && transferencia === 0) transferencia += p.amount
      else if (p.externalId === 'debito' && debito === 0) debito += p.amount
    }
  }

  const fallbackMostrador = sum(
    payments.filter((payment) => payment.provider === 'mostrador').map((payment) => payment.amount)
  )
  const counterTotal = efectivo + transferencia + debito || fallbackMostrador

  const onlineRevenue = sum(
    payments.filter((payment) => payment.provider !== 'mostrador').map((payment) => payment.amount)
  ) || sum(
    liveBookings.filter((b) => b.depositAmount > 0 && b.status !== 'cancelada').map((b) => b.depositAmount)
  )

  const totalRevenue = onlineRevenue + counterTotal

  const daysCount = Math.max(1, Math.round((endDay.getTime() - startDay.getTime()) / (24 * 60 * 60 * 1000)) + 1)
  const totalTurnos = activeFieldsCount * DAILY_SLOTS.length * daysCount

  const occupiedCells = new Set<string>()
  for (const booking of liveBookings) {
    if (booking.status === 'cancelada') continue
    const fieldId = booking.fieldId.toString()
    const dStr = new Date(booking.date).toISOString().slice(0, 10)
    for (const slot of DAILY_SLOTS) {
      if (booking.startTime < slot.end && slot.start < booking.endTime) {
        occupiedCells.add(`${fieldId}:${dStr}:${slot.start}`)
      }
    }
  }

  const ocupados = Math.min(occupiedCells.size, totalTurnos)
  const occupancyRate = totalTurnos === 0 ? 0 : Math.round((ocupados / totalTurnos) * 100)

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

  const canceladas = bookings.filter((booking) => booking.status === 'cancelada')
  const dateLabel = isRange ? `${params.startDate} a ${params.endDate}` : (params.date ?? new Date(startDay).toISOString().slice(0, 10))

  // Cancha con mayor recaudación
  const allFields = await Field.find().lean()
  const fieldNameMap = new Map<string, string>(allFields.map((f) => [f._id.toString(), f.name]))
  const courtStats = new Map<string, { totalRevenue: number; bookingsCount: number }>()

  for (const b of liveBookings) {
    if (b.status === 'cancelada') continue
    const fid = b.fieldId.toString()
    const stat = courtStats.get(fid) ?? { totalRevenue: 0, bookingsCount: 0 }
    stat.totalRevenue += b.totalAmount
    stat.bookingsCount += 1
    courtStats.set(fid, stat)
  }

  let topCourt: DailyMetrics['topCourt'] = null
  let maxRevenue = -1
  for (const [fid, stat] of courtStats.entries()) {
    if (stat.totalRevenue > maxRevenue) {
      maxRevenue = stat.totalRevenue
      topCourt = {
        name: fieldNameMap.get(fid) || 'Cancha',
        totalRevenue: stat.totalRevenue,
        bookingsCount: stat.bookingsCount,
      }
    }
  }

  // Franja horaria con mayor demanda
  const slotBookings = new Map<string, number>()
  for (const slot of DAILY_SLOTS) {
    slotBookings.set(slot.start, 0)
  }
  for (const b of liveBookings) {
    if (b.status === 'cancelada') continue
    for (const slot of DAILY_SLOTS) {
      if (b.startTime < slot.end && slot.start < b.endTime) {
        slotBookings.set(slot.start, (slotBookings.get(slot.start) ?? 0) + 1)
      }
    }
  }

  const slotCapacity = Math.max(1, activeFieldsCount * daysCount)
  let peakHour: DailyMetrics['peakHour'] = null
  let maxOccupancy = -1
  for (const [start, count] of slotBookings.entries()) {
    const occ = Math.round((count / slotCapacity) * 100)
    if (occ > maxOccupancy) {
      maxOccupancy = occ
      peakHour = {
        timeSlot: `${start} hs`,
        occupancyPercentage: Math.min(100, occ),
        bookingsCount: count,
      }
    }
  }

  return {
    date: dateLabel,
    startDate: params.startDate,
    endDate: params.endDate,
    onlineRevenue,
    counterRevenue: {
      efectivo,
      transferencia,
      debito,
      total: counterTotal,
    },
    totalRevenue,
    occupancyRate,
    topCourt,
    peakHour,
    recaudacion: {
      mostrador: counterTotal,
      pasarela: onlineRevenue,
      total: totalRevenue,
    },
    saldoPorCobrar: {
      senasAbonadas,
      saldoRestante,
      total: senasAbonadas + saldoRestante,
    },
    ocupacion: {
      ocupados,
      totalTurnos,
      porcentaje: occupancyRate,
    },
    cancelaciones: {
      cantidad: canceladas.length,
      montoPerdido: sum(canceladas.map((booking) => booking.totalAmount)),
    },
    turnos: {
      confirmadas: bookings.filter((booking) => booking.status === 'confirmada').length,
      pendientes: bookings.filter((booking) => booking.status === 'pendiente').length,
      pagadas: bookings.filter((booking) => booking.status === 'pagada').length,
      bloqueadas: bookings.filter((booking) => booking.type === 'mantenimiento' || booking.isBlocked).length,
      canceladas: canceladas.length,
    },
  }
}

export async function getDailyMetrics(dateKey: string): Promise<DailyMetrics> {
  return getMetricsReport({ date: dateKey })
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
    Booking.find({ type: 'amistoso' }).sort({ _id: -1 }).lean(),
    Payment.find({ status: 'pagado' }).lean(),
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

export async function addConsumptionToBooking(
  id: string,
  input: AddConsumptionInput
): Promise<BookingDoc> {
  const booking = assertFound(
    await Booking.findById(id).populate('fieldId', 'name type'),
    'Reserva no encontrada'
  )

  if (booking.status === 'cancelada') {
    throw new AppError(409, 'No se pueden añadir consumos a una reserva cancelada')
  }

  const subtotal = Math.round(input.quantity * input.unitPrice)
  const item = {
    name: input.name,
    quantity: input.quantity,
    unitPrice: input.unitPrice,
    subtotal,
  }

  booking.consumptions.push(item)
  booking.remainingBalance = (booking.remainingBalance ?? 0) + subtotal
  booking.totalAmount = (booking.totalAmount ?? 0) + subtotal

  await booking.save()

  broadcastBookingStream({
    courtId: booking.fieldId.toString(),
    date: new Date(booking.date).toISOString().slice(0, 10),
    timeSlot: `${booking.startTime}-${booking.endTime}`,
    status: booking.status,
  })

  return booking
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

export async function settleCounterBooking(
  id: string,
  method: SettleBookingInput['method']
): Promise<BookingDoc> {
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
  if (booking.status !== 'confirmada') {
    throw new AppError(409, 'Solo se puede liquidar el saldo de reservas confirmadas')
  }
  if (booking.remainingBalance <= 0) {
    throw new AppError(409, 'La reserva no posee saldo pendiente a cobrar')
  }

  const amountToSettle = booking.remainingBalance

  await Payment.create({
    bookingId: booking._id,
    provider: 'mostrador',
    amount: amountToSettle,
    paymentType: 'full',
    status: 'pagado',
    externalId: method,
  })

  booking.set({
    remainingBalance: 0,
    paymentStatus: 'liquidada',
    counterPaymentMethod: method,
    settledAt: new Date(),
    status: 'pagada',
    expiresAt: null,
  })

  await booking.save()

  broadcastBookingStream({
    courtId: booking.fieldId.toString(),
    date: new Date(booking.date).toISOString().slice(0, 10),
    timeSlot: `${booking.startTime}-${booking.endTime}`,
    status: 'pagada',
  })

  return booking
}

export async function blockCourt(
  courtId: string,
  input: BlockCourtInput
): Promise<BookingDoc> {
  assertFound(await Field.findById(courtId), 'Cancha no encontrada')
  const day = parseDay(input.date)
  const reason = input.reason ?? 'mantenimiento'

  let startTime = input.startTime
  let endTime = input.endTime
  if (!startTime && input.timeSlot) {
    const parts = input.timeSlot.split(/[-–—]/).map((s) => s.trim())
    startTime = parts[0]
    endTime = parts[1]
  }
  if (!startTime) throw new AppError(400, 'Debe indicar el horario de inicio o franja horaria')
  if (!endTime) {
    const [h, m] = startTime.split(':').map(Number)
    endTime = `${String(h + 1).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }

  const conflicting = await Booking.findOne({
    fieldId: courtId,
    date: day,
    status: { $in: ['confirmada', 'pagada'] },
    $or: [
      { depositAmount: { $gt: 0 } },
      { paymentStatus: { $in: ['senia_pagada', 'liquidada'] } },
    ],
    $expr: {
      $and: [
        { $lt: ['$startTime', endTime] },
        { $lt: [startTime, '$endTime'] },
      ],
    },
  })

  if (conflicting) {
    throw new AppError(409, 'No se puede bloquear el horario: existe un turno confirmado con seña pagada')
  }

  // Remover reservas pendientes o bloques previos en ese horario
  await Booking.deleteMany({
    fieldId: courtId,
    date: day,
    $expr: {
      $and: [
        { $lt: ['$startTime', endTime] },
        { $lt: [startTime, '$endTime'] },
      ],
    },
  })

  const blockBooking = await Booking.create({
    fieldId: courtId,
    date: day,
    startTime,
    endTime,
    clientInfo: { name: `Mantenimiento (${reason})`, phone: '000000' },
    status: 'bloqueada',
    type: 'mantenimiento',
    isBlocked: true,
    blockReason: reason,
  })

  const timeSlotLabel = `${startTime}-${endTime}`
  await Field.updateOne(
    { _id: courtId },
    {
      $pull: { blocks: { date: input.date, timeSlot: timeSlotLabel } },
    }
  )
  await Field.updateOne(
    { _id: courtId },
    {
      $push: { blocks: { date: input.date, timeSlot: timeSlotLabel, reason } },
    }
  )

  broadcastBookingStream({
    courtId,
    date: input.date,
    timeSlot: timeSlotLabel,
    status: 'bloqueada',
  })

  return blockBooking
}

export async function unblockCourt(
  courtId: string,
  input: UnblockCourtInput
): Promise<{ success: boolean; message: string }> {
  const day = parseDay(input.date)
  let startTime = input.startTime
  if (!startTime && input.timeSlot) {
    startTime = input.timeSlot.split(/[-–—]/)[0].trim()
  }
  if (!startTime) throw new AppError(400, 'Debe especificar la hora del turno a desbloquear')

  const filter: Record<string, unknown> = {
    fieldId: courtId,
    date: day,
    startTime,
    $or: [{ isBlocked: true }, { type: 'mantenimiento' }, { status: 'bloqueada' }],
  }

  const booking = await Booking.findOne(filter)
  if (booking) {
    booking.set({ status: 'cancelada', activeSlotKey: null })
    await booking.save()
    await booking.deleteOne()
  }

  const timeSlotPattern = input.timeSlot ?? (booking ? `${booking.startTime}-${booking.endTime}` : undefined)

  await Field.updateOne(
    { _id: courtId },
    {
      $pull: {
        blocks: {
          date: input.date,
          ...(timeSlotPattern ? { timeSlot: timeSlotPattern } : {}),
        },
      },
    }
  )

  broadcastBookingStream({
    courtId,
    date: input.date,
    timeSlot: timeSlotPattern ?? `${startTime}:00`,
    status: 'cancelada',
  })

  return { success: true, message: 'Horario desbloqueado correctamente' }
}

export async function generateBalanceCsv(
  startDate?: string,
  endDate?: string
): Promise<{ filename: string; csv: string }> {
  const filter: Record<string, unknown> = {}
  if (startDate && endDate) {
    const s = dayStart(parseDay(startDate))
    const e = dayStart(parseDay(endDate))
    filter.date = { $gte: s, $lte: e }
  } else if (startDate) {
    filter.date = { $gte: dayStart(parseDay(startDate)) }
  } else if (endDate) {
    filter.date = { $lte: dayStart(parseDay(endDate)) }
  }

  const bookings = await Booking.find(filter)
    .populate('fieldId', 'name')
    .sort({ date: 1, startTime: 1 })
    .lean()

  const headers = [
    'Fecha',
    'Turno',
    'Cancha',
    'Cliente',
    'MetodoPago',
    'SeniaOnline',
    'SaldoMostrador',
    'Total',
    'Estado',
  ]
  const rows = [headers.join(',')]

  for (const b of bookings) {
    const dStr = new Date(b.date).toISOString().slice(0, 10)
    const turno = `${b.startTime}-${b.endTime}`
    const cancha =
      typeof b.fieldId === 'object' && b.fieldId !== null && 'name' in b.fieldId
        ? String(b.fieldId.name)
        : 'Cancha'
    const cliente = b.clientInfo?.name ? `"${b.clientInfo.name.replace(/"/g, '""')}"` : 'Sin cliente'
    const metodoPago = b.counterPaymentMethod || (b.paymentType === 'full' ? 'mercadopago' : 'seña')
    const senia = b.depositAmount ?? 0
    const saldoMostrador =
      b.status === 'pagada'
        ? Math.max(b.totalAmount - b.depositAmount, 0)
        : (b.remainingBalance ?? 0)
    const total = b.totalAmount ?? 0
    const estado = b.status

    rows.push([
      dStr,
      turno,
      `"${cancha}"`,
      cliente,
      metodoPago,
      senia,
      saldoMostrador,
      total,
      estado,
    ].join(','))
  }

  const todayStr = new Date().toISOString().slice(0, 10)
  const filename = `copa5-balance-${startDate || todayStr}.csv`
  return {
    filename,
    csv: '\uFEFF' + rows.join('\r\n'),
  }
}