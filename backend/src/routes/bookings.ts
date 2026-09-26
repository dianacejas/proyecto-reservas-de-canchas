import { Router } from 'express'
import {
  createBooking,
  getBooking,
  listBookings,
  removeBooking,
  updateBooking,
} from '../controllers/booking.controller.js'
import { adminRequired } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import {
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

export default router