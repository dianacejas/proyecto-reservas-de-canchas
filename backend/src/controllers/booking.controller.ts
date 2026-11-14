import type { Request, Response } from 'express'
import { Booking } from '../models/index.js'
import {
  idParamsSchema,
  type CreateAdminBookingInput,
  type CreateBookingInput,
  type IdParams,
  type ListBookingsQuery,
  type UpdateBookingInput,
} from '../schemas/index.js'
import {
  cancelClientBooking,
  createAdminBooking,
  createPublicBooking,
  deleteBookingById,
  listBookingsForUser,
  updateBookingById,
} from '../services/booking.service.js'
import { broadcastBookingStream, subscribeBookingStream } from '../services/bookingSse.service.js'
import { AppError } from '../utils/AppError.js'
import { assertFound } from '../utils/assertFound.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { parseDay } from '../utils/time.js'

export const streamBookings = (req: Request, res: Response): void => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
  })
  res.write(': connected\n\n')

  const unsubscribe = subscribeBookingStream(res)
  req.on('close', unsubscribe)
}

export const listBookings = asyncHandler(async (req, res) => {
  const query = (req.validData.query ?? {}) as ListBookingsQuery
  const filter: Record<string, unknown> = {}
  if (query.fieldId) filter.fieldId = query.fieldId
  if (query.date) filter.date = parseDay(query.date)
  if (query.status) filter.status = query.status

  const bookings = await Booking.find(filter)
    .populate('fieldId', 'name type')
    .sort({ date: 1, startTime: 1 })
    .lean()

  const data = bookings.map((b) => ({
    ...b,
    id: b._id.toString(),
    fieldId:
      typeof b.fieldId === 'object' && b.fieldId !== null && '_id' in b.fieldId
        ? { ...b.fieldId, id: String((b.fieldId as { _id: unknown })._id) }
        : b.fieldId,
  }))

  res.json({ success: true, data })
})

export const getBooking = asyncHandler(async (req, res) => {
  const { id } = req.validData.params as IdParams
  const booking = assertFound(
    await Booking.findById(id).populate('fieldId', 'name type').lean(),
    'Reserva no encontrada'
  )
  const data = {
    ...booking,
    id: booking._id.toString(),
    fieldId:
      typeof booking.fieldId === 'object' && booking.fieldId !== null && '_id' in booking.fieldId
        ? { ...booking.fieldId, id: String((booking.fieldId as { _id: unknown })._id) }
        : booking.fieldId,
  }
  res.json({ success: true, data })
})

export const createBooking = asyncHandler(async (req, res) => {
  const body = req.validData.body as CreateBookingInput
  const booking = await createPublicBooking({ ...body, userId: req.user?.id })
  broadcastBookingStream({
    courtId: booking.fieldId.toString(),
    date: new Date(booking.date).toISOString().slice(0, 10),
    timeSlot: `${booking.startTime}-${booking.endTime}`,
    status: booking.status,
  })
  res.status(201).json({ success: true, data: booking })
})

export const listMyBookings = asyncHandler(async (req, res) => {
  if (!req.user) throw new AppError(401, 'Se requiere autenticación')
  res.json({ success: true, data: await listBookingsForUser(req.user.id) })
})

export const cancelMyBooking = asyncHandler(async (req, res) => {
  if (!req.user) throw new AppError(401, 'Se requiere autenticación')
  const parsed = idParamsSchema.safeParse(req.params)
  if (!parsed.success) {
    throw new AppError(400, 'ID de reserva inválido', parsed.error.issues)
  }
  const { id } = parsed.data
  const booking = await cancelClientBooking(req.user.id, id, req.user.role === 'admin')
  broadcastBookingStream({
    courtId: booking.fieldId.toString(),
    date: new Date(booking.date).toISOString().slice(0, 10),
    timeSlot: `${booking.startTime}-${booking.endTime}`,
    status: booking.status,
  })
  res.json({ success: true, data: booking })
})

export const createAdminBookingController = asyncHandler(async (req, res) => {
  const body = req.validData.body as CreateAdminBookingInput
  const booking = await createAdminBooking(body)
  broadcastBookingStream({
    courtId: booking.fieldId.toString(),
    date: new Date(booking.date).toISOString().slice(0, 10),
    timeSlot: `${booking.startTime}-${booking.endTime}`,
    status: booking.status,
  })
  res.status(201).json({ success: true, data: booking })
})

export const updateBooking = asyncHandler(async (req, res) => {
  const { id } = req.validData.params as IdParams
  const body = req.validData.body as UpdateBookingInput
  const booking = await updateBookingById(id, body)
  broadcastBookingStream({
    courtId: booking.fieldId.toString(),
    date: new Date(booking.date).toISOString().slice(0, 10),
    timeSlot: `${booking.startTime}-${booking.endTime}`,
    status: booking.status,
  })
  res.json({ success: true, data: booking })
})

export const removeBooking = asyncHandler(async (req, res) => {
  const { id } = req.validData.params as IdParams
  const booking = await deleteBookingById(id)
  broadcastBookingStream({
    courtId: booking.fieldId.toString(),
    date: new Date(booking.date).toISOString().slice(0, 10),
    timeSlot: `${booking.startTime}-${booking.endTime}`,
    status: 'cancelada',
  })
  res.json({ success: true, data: booking })
})
