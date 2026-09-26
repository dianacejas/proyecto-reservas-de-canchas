import { Booking } from '../models/index.js'
import type { CreateBookingInput, IdParams, ListBookingsQuery, UpdateBookingInput } from '../schemas/index.js'
import {
  createPublicBooking,
  deleteBookingById,
  updateBookingById,
} from '../services/booking.service.js'
import { assertFound } from '../utils/assertFound.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { parseDay } from '../utils/time.js'

export const listBookings = asyncHandler(async (req, res) => {
  const query = (req.validData.query ?? {}) as ListBookingsQuery
  const filter: Record<string, unknown> = {}
  if (query.fieldId) filter.fieldId = query.fieldId
  if (query.date) filter.date = parseDay(query.date)
  if (query.status) filter.status = query.status

  const bookings = await Booking.find(filter)
    .populate('fieldId', 'name type')
    .sort({ date: 1, startTime: 1 })
  res.json({ data: bookings })
})

export const getBooking = asyncHandler(async (req, res) => {
  const { id } = req.validData.params as IdParams
  res.json({
    data: assertFound(await Booking.findById(id).populate('fieldId', 'name type'), 'Reserva no encontrada'),
  })
})

export const createBooking = asyncHandler(async (req, res) => {
  const body = req.validData.body as CreateBookingInput
  res.status(201).json({ data: await createPublicBooking(body) })
})

export const updateBooking = asyncHandler(async (req, res) => {
  const { id } = req.validData.params as IdParams
  const body = req.validData.body as UpdateBookingInput
  res.json({ data: await updateBookingById(id, body) })
})

export const removeBooking = asyncHandler(async (req, res) => {
  const { id } = req.validData.params as IdParams
  res.json({ data: await deleteBookingById(id) })
})