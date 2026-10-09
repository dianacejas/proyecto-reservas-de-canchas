import type { DateQuery, IdParams } from '../schemas/index.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import {
  completeBookingAtDoor,
  getDailyMetrics,
  listCustomers,
} from '../services/admin.service.js'

export const getMetrics = asyncHandler(async (req, res) => {
  const { date } = req.validData.query as DateQuery
  res.json({ data: await getDailyMetrics(date) })
})

export const getCustomers = asyncHandler(async (_req, res) => {
  res.json({ data: await listCustomers() })
})

export const completeBooking = asyncHandler(async (req, res) => {
  const { id } = req.validData.params as IdParams
  res.json({ data: await completeBookingAtDoor(id) })
})