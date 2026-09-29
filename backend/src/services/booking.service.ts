import { Booking, Field, Match, type BookingDoc } from '../models/index.js'
import type { CreateAdminBookingInput, UpdateBookingInput } from '../schemas/index.js'
import { AppError } from '../utils/AppError.js'
import { assertFound } from '../utils/assertFound.js'
import { dayStart } from '../utils/time.js'

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

  return Booking.create({
    ...slot,
    clientInfo: body.clientInfo,
    status: 'pendiente',
    type: 'amistoso',
  })
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

  return Booking.create({
    ...normalized,
    clientInfo: { name: tournamentName ?? 'Reserva de torneo', phone: '000000' },
    status: 'confirmada',
    type: 'torneo',
  })
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

  if (body.kind === 'bloqueo') {
    return Booking.create({
      ...slot,
      clientInfo: { name: body.clientInfo?.name ?? 'Bloqueo operativo', phone: '000000' },
      status: 'confirmada',
      type: 'mantenimiento',
    })
  }

  return Booking.create({
    ...slot,
    clientInfo: body.clientInfo as CreateAdminBookingInput['clientInfo'],
    status: 'confirmada',
    type: 'amistoso',
  })
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
  await booking.save()
  return booking
}

export async function deleteBookingById(id: string): Promise<BookingDoc> {
  const booking = assertFound(await Booking.findById(id), 'Reserva no encontrada')
  await Match.updateMany({ bookingId: booking._id }, { $set: { bookingId: null } })
  await booking.deleteOne()
  return booking
}