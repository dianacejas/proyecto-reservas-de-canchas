import {
  addConsumptionSchema,
  blockCourtSchema,
  idParamsSchema,
  metricsQuerySchema,
  exportReportQuerySchema,
  settleBookingSchema,
  unblockCourtSchema,
  type IdParams,
} from '../schemas/index.js'
import { runResetSeed } from '../seed.js'
import { AppError } from '../utils/AppError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import {
  addConsumptionToBooking,
  blockCourt,
  completeBookingAtDoor,
  generateBalanceCsv,
  getMetricsReport,
  listCustomers,
  settleCounterBooking,
  unblockCourt,
} from '../services/admin.service.js'

export const getMetrics = asyncHandler(async (req, res) => {
  const queryResult = metricsQuerySchema.safeParse(req.query)
  const query = queryResult.success ? queryResult.data : {}
  res.json({ success: true, data: await getMetricsReport(query) })
})

export const getCustomers = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: await listCustomers() })
})

export const completeBooking = asyncHandler(async (req, res) => {
  const { id } = req.validData.params as IdParams
  res.json({ success: true, data: await completeBookingAtDoor(id) })
})

export const addBookingConsumption = asyncHandler(async (req, res) => {
  const paramsParsed = idParamsSchema.safeParse(req.params)
  if (!paramsParsed.success) {
    throw new AppError(400, 'ID de reserva inválido', paramsParsed.error.issues)
  }
  const bodyParsed = addConsumptionSchema.safeParse(req.body)
  if (!bodyParsed.success) {
    throw new AppError(400, 'Datos de consumo inválidos', bodyParsed.error.issues)
  }
  const updated = await addConsumptionToBooking(paramsParsed.data.id, bodyParsed.data)
  res.status(201).json({ success: true, data: updated })
})

export const settleBooking = asyncHandler(async (req, res) => {
  const paramsParsed = idParamsSchema.safeParse(req.params)
  if (!paramsParsed.success) {
    throw new AppError(400, 'ID de reserva inválido', paramsParsed.error.issues)
  }
  const bodyParsed = settleBookingSchema.safeParse(req.body)
  if (!bodyParsed.success) {
    throw new AppError(400, 'Método de pago inválido', bodyParsed.error.issues)
  }
  const settled = await settleCounterBooking(paramsParsed.data.id, bodyParsed.data.method)
  res.json({ success: true, data: settled })
})

export const blockCourtController = asyncHandler(async (req, res) => {
  const paramsParsed = idParamsSchema.safeParse(req.params)
  if (!paramsParsed.success) {
    throw new AppError(400, 'ID de cancha inválido', paramsParsed.error.issues)
  }
  const bodyParsed = blockCourtSchema.safeParse(req.body)
  if (!bodyParsed.success) {
    throw new AppError(400, 'Datos de bloqueo inválidos', bodyParsed.error.issues)
  }
  const blocked = await blockCourt(paramsParsed.data.id, bodyParsed.data)
  res.status(201).json({ success: true, data: blocked })
})

export const unblockCourtController = asyncHandler(async (req, res) => {
  const paramsParsed = idParamsSchema.safeParse(req.params)
  if (!paramsParsed.success) {
    throw new AppError(400, 'ID de cancha inválido', paramsParsed.error.issues)
  }
  const payload = { ...(req.query as Record<string, unknown>), ...(req.body as Record<string, unknown>) }
  const dataParsed = unblockCourtSchema.safeParse(payload)
  if (!dataParsed.success) {
    throw new AppError(400, 'Datos para desbloqueo inválidos', dataParsed.error.issues)
  }
  const result = await unblockCourt(paramsParsed.data.id, dataParsed.data)
  res.json(result)
})

export const resetSeedController = asyncHandler(async (_req, res) => {
  const summary = await runResetSeed()
  res.json({ success: true, message: 'Base de datos restablecida con éxito', data: summary })
})

export const exportReportController = asyncHandler(async (req, res) => {
  const queryResult = exportReportQuerySchema.safeParse(req.query)
  const { startDate, endDate } = queryResult.success ? queryResult.data : {}
  const { filename, csv } = await generateBalanceCsv(startDate, endDate)

  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
  res.status(200).send(csv)
})