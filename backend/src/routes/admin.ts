import { Router } from 'express'
import {
  addBookingConsumption,
  blockCourtController,
  completeBooking,
  exportReportController,
  getCustomers,
  getMetrics,
  resetSeedController,
  settleBooking,
  unblockCourtController,
} from '../controllers/admin.controller.js'
import { updateCourt } from '../controllers/court.controller.js'
import { adminRequired } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import {
  addConsumptionSchema,
  blockCourtSchema,
  idParamsSchema,
  metricsQuerySchema,
  settleBookingSchema,
} from '../schemas/index.js'

const router = Router()

router.use(adminRequired)

router.get('/reports/export', exportReportController)
router.get('/metrics', validate(metricsQuerySchema, 'query'), getMetrics)
router.get('/customers', getCustomers)
router.post('/bookings/:id/complete', validate(idParamsSchema, 'params'), completeBooking)
router.post(
  '/bookings/:id/consumptions',
  validate(idParamsSchema, 'params'),
  validate(addConsumptionSchema, 'body'),
  addBookingConsumption
)
router.patch(
  '/bookings/:id/settle',
  validate(idParamsSchema, 'params'),
  validate(settleBookingSchema, 'body'),
  settleBooking
)
router.post(
  '/courts/:id/block',
  validate(idParamsSchema, 'params'),
  validate(blockCourtSchema, 'body'),
  blockCourtController
)
router.delete('/courts/:id/block', validate(idParamsSchema, 'params'), unblockCourtController)
router.patch('/courts/:id', updateCourt)
router.patch('/fields/:id', updateCourt)
router.post(
  '/fields/:id/block',
  validate(idParamsSchema, 'params'),
  validate(blockCourtSchema, 'body'),
  blockCourtController
)
router.delete('/fields/:id/block', validate(idParamsSchema, 'params'), unblockCourtController)
router.post('/reset-seed', resetSeedController)

export default router