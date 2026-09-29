import { Router } from 'express'
import {
  createAdminBookingController,
  createBooking,
  getBooking,
  listBookings,
  removeBooking,
  updateBooking,
} from '../controllers/booking.controller.js'
import { adminRequired } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import {
  createAdminBookingSchema,
  createBookingSchema,
  idParamsSchema,
  listBookingsQuerySchema,
  updateBookingSchema,
} from '../schemas/index.js'

const router = Router()

router.get('/', validate(listBookingsQuerySchema, 'query'), listBookings)
router.post('/', validate(createBookingSchema), createBooking)
router.get('/:id', validate(idParamsSchema, 'params'), getBooking)
router.put('/:id', adminRequired, validate(idParamsSchema, 'params'), validate(updateBookingSchema), updateBooking)
router.delete('/:id', adminRequired, validate(idParamsSchema, 'params'), removeBooking)
router.post('/admin', adminRequired, validate(createAdminBookingSchema), createAdminBookingController)

export default router