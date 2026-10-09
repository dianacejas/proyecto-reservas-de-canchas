import { Router } from 'express'
import {
  completeBooking,
  getCustomers,
  getMetrics,
} from '../controllers/admin.controller.js'
import { adminRequired } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { dateQuerySchema, idParamsSchema } from '../schemas/index.js'

const router = Router()

router.use(adminRequired)

router.get('/metrics', validate(dateQuerySchema, 'query'), getMetrics)
router.get('/customers', getCustomers)
router.post('/bookings/:id/complete', validate(idParamsSchema, 'params'), completeBooking)

export default router