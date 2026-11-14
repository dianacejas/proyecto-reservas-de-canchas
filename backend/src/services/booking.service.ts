import { env } from '../config/env.js'
import { Booking, Field, Match, User, type BookingDoc } from '../models/index.js'
import type { CreateAdminBookingInput, UpdateBookingInput } from '../schemas/index.js'
import { AppError } from '../utils/AppError.js'
import { assertFound } from '../utils/assertFound.js'
import { dayStart } from '../utils/time.js'

export function calculateSlotHours(startTime: string, endTime: string): number {
  const [startHour, startMinute] = startTime.split(':').map(Number)
  const [endHour, endMinute] = endTime.split(':').map(Number)
  return Math.max((endHour * 60 + endMinute - (startHour * 60 + startMinute)) / 60, 0)
}

function slotHours(startTime: string, endTime: string): number {
  return calculateSlotHours(startTime, endTime)
}

export function isPeakTime(
  date: Date,
  startTime: string,
  peakHours: string[] = ['19:00', '20:00', '21:00', '22:00', '23:00']
): boolean {
  const d = new Date(date)
  const dayOfWeek = d.getUTCDay()
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
  if (isWeekend) return true

  const startHour = startTime.slice(0, 5)
  if (peakHours.includes(startHour)) return true
  const [hour] = startHour.split(':').map(Number)
  return hour >= 19
}

export function resolveFieldPricePerHour(
  field: {
    pricePerHour: number
    standardPricePerHour?: number | null
    peakPricePerHour?: number | null
    peakHours?: string[] | null
  },
  date: Date,
  startTime: string
): number {
  const isPeak = isPeakTime(date, startTime, field.peakHours ?? undefined)
  if (isPeak && field.peakPricePerHour && field.peakPricePerHour > 0) {
    return field.peakPricePerHour
  }
  if (!isPeak && field.standardPricePerHour && field.standardPricePerHour > 0) {
    return field.standardPricePerHour
  }
  return field.pricePerHour
}

function slotTotal(
  field: {
    pricePerHour: number
    standardPricePerHour?: number | null
    peakPricePerHour?: number | null
    peakHours?: string[] | null
  },
  date: Date,
  startTime: string,
  endTime: string
): number {
  const price = resolveFieldPricePerHour(field, date, startTime)
  return Math.round(price * slotHours(startTime, endTime))
}

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function pendingExpiryFrom(now: Date = new Date()): Date {
  return new Date(now.getTime() + env.PENDING_TTL_MINUTES * 60 * 1000)
}

function handleBookingConflictError(err: unknown): never {
  if (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: unknown }).code === 11000
  ) {
    throw new AppError(409, 'El horario solicitado ya se encuentra reservado')
  }
  throw err
}

export interface SlotInput {
  fieldId: string
  date: Date
  startTime: string
  endTime: string
}

export interface CreatePublicBookingInput {
  fieldId: string
  date: Date
  startTime: string
  endTime: string
  clientInfo: { name: string; phone: string }
  userId?: string
}

export interface AvailabilityOptions {
  excludeId?: string
}

export async function findConflictingBooking(
  slot: SlotInput,
  options: AvailabilityOptions = {}
): Promise<BookingDoc | null> {
  const filter: Record<string, unknown> = {
    fieldId: slot.fieldId,
    date: dayStart(slot.date),
    status: { $ne: 'cancelada' },
    $nor: [{ status: 'pendiente', expiresAt: { $ne: null, $lte: new Date() } }],
    $expr: {
      $and: [
        { $lt: ['$startTime', slot.endTime] },
        { $lt: [slot.startTime, '$endTime'] },
      ],
    },
  }
  if (options.excludeId !== undefined) filter._id = { $ne: options.excludeId }
  return Booking.findOne(filter)
}

export async function createPublicBooking(body: CreatePublicBookingInput): Promise<BookingDoc> {
  const field = await Field.findOne({ _id: body.fieldId, isActive: true })
  if (!field) throw new AppError(404, 'La cancha seleccionada no está disponible')

  const slot: SlotInput = {
    fieldId: body.fieldId,
    date: dayStart(body.date),
    startTime: body.startTime,
    endTime: body.endTime,
  }
  const conflict = await findConflictingBooking(slot)
  if (conflict) throw new AppError(409, 'El horario solicitado ya se encuentra reservado')

  const totalAmount = slotTotal(field, body.date, body.startTime, body.endTime)

  try {
    return await Booking.create({
      ...slot,
      userId: body.userId,
      clientInfo: body.clientInfo,
      status: 'pendiente',
      type: 'amistoso',
      totalAmount,
      depositAmount: 0,
      remainingBalance: totalAmount,
      paymentType: 'full',
      expiresAt: pendingExpiryFrom(),
    })
  } catch (err) {
    handleBookingConflictError(err)
  }
}

export async function createTournamentBooking(
  slot: SlotInput,
  tournamentName?: string
): Promise<BookingDoc> {
  const normalized: SlotInput = {
    ...slot,
    date: dayStart(slot.date),
  }
  const conflict = await findConflictingBooking(normalized)
  if (conflict) throw new AppError(409, 'El horario asignado al partido ya se encuentra reservado')

  try {
    return await Booking.create({
      ...normalized,
      clientInfo: { name: tournamentName ?? 'Reserva de torneo', phone: '000000' },
      status: 'confirmada',
      type: 'torneo',
    })
  } catch (err) {
    handleBookingConflictError(err)
  }
}

export async function createAdminBooking(body: CreateAdminBookingInput): Promise<BookingDoc> {
  const field = await Field.findOne({ _id: body.fieldId, isActive: true })
  if (!field) throw new AppError(404, 'La cancha seleccionada no está disponible')

  const slot: SlotInput = {
    fieldId: body.fieldId,
    date: dayStart(body.date),
    startTime: body.startTime,
    endTime: body.endTime,
  }
  const conflict = await findConflictingBooking(slot)
  if (conflict) throw new AppError(409, 'El horario seleccionado ya se encuentra reservado')

  try {
    if (body.kind === 'bloqueo') {
      return await Booking.create({
        ...slot,
        clientInfo: { name: body.clientInfo?.name ?? 'Bloqueo operativo', phone: '000000' },
        status: 'confirmada',
        type: 'mantenimiento',
      })
    }

    return await Booking.create({
      ...slot,
      clientInfo: body.clientInfo as CreateAdminBookingInput['clientInfo'],
      status: 'confirmada',
      type: 'amistoso',
    })
  } catch (err) {
    handleBookingConflictError(err)
  }
}

export async function updateBookingById(
  id: string,
  body: UpdateBookingInput
): Promise<BookingDoc> {
  const booking = assertFound(await Booking.findById(id), 'Reserva no encontrada')

  const fieldId = body.fieldId ?? booking.fieldId.toString()
  const date = body.date ?? booking.date
  const startTime = body.startTime ?? booking.startTime
  const endTime = body.endTime ?? booking.endTime

  const slotChanged =
    body.fieldId !== undefined ||
    body.date !== undefined ||
    body.startTime !== undefined ||
    body.endTime !== undefined

  if (slotChanged) {
    const conflict = await findConflictingBooking(
      { fieldId, date, startTime, endTime },
      { excludeId: booking._id.toString() }
    )
    if (conflict) throw new AppError(409, 'El nuevo horario ya se encuentra reservado')
  }

  if (body.status === 'cancelada' && booking.status !== 'cancelada') {
    await Match.updateMany({ bookingId: booking._id }, { $set: { bookingId: null } })
  }

  booking.set({ ...body, fieldId, date: dayStart(date), startTime, endTime })
  if (body.status !== undefined && body.status !== 'pendiente') {
    booking.set('expiresAt', null)
  }
  try {
    await booking.save()
  } catch (err) {
    handleBookingConflictError(err)
  }
  return booking
}

export async function listBookingsForUser(userId: string): Promise<unknown[]> {
  const bookings = await Booking.find({ userId })
    .populate('fieldId', 'name type pricePerHour')
    .sort({ date: 1, startTime: 1 })
    .lean()
  return bookings.map((b) => ({
    ...b,
    id: b._id.toString(),
    fieldId:
      typeof b.fieldId === 'object' && b.fieldId !== null && '_id' in b.fieldId
        ? { ...b.fieldId, id: String((b.fieldId as { _id: unknown })._id) }
        : b.fieldId,
  }))
}

export async function cancelClientBooking(
  userId: string,
  bookingId: string,
  isAdmin = false
): Promise<BookingDoc> {
  const booking = assertFound(await Booking.findById(bookingId), 'Reserva no encontrada')

  if (!isAdmin && booking.userId?.toString() !== userId) {
    throw new AppError(403, 'No podés cancelar una reserva que no es tuya')
  }
  if (booking.status !== 'pendiente' && booking.status !== 'confirmada') {
    throw new AppError(409, 'La reserva ya no se puede cancelar')
  }

  const turnStart = new Date(`${dateKey(booking.date)}T${booking.startTime}:00-03:00`)
  const diffHours = (turnStart.getTime() - Date.now()) / 3_600_000

  if (diffHours >= 24) {
    booking.set({
      status: 'cancelada',
      expiresAt: null,
      activeSlotKey: null,
      creditNote: booking.depositAmount,
      retainedDeposit: false,
    })
    if (booking.userId && booking.depositAmount > 0) {
      await User.updateOne({ _id: booking.userId }, { $inc: { creditBalance: booking.depositAmount } })
    }
  } else {
    booking.set({
      status: 'cancelada',
      expiresAt: null,
      activeSlotKey: null,
      creditNote: 0,
      retainedDeposit: true,
    })
  }

  await booking.save()
  await Match.updateMany({ bookingId: booking._id }, { $set: { bookingId: null } })
  return booking
}

export async function deleteBookingById(id: string): Promise<BookingDoc> {
  const booking = assertFound(await Booking.findById(id), 'Reserva no encontrada')
  await Match.updateMany({ bookingId: booking._id }, { $set: { bookingId: null } })
  await booking.deleteOne()
  return booking
}
