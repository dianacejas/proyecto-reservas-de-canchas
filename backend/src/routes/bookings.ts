import { Router } from 'express'
import {
  cancelMyBooking,
  createAdminBookingController,
  createBooking,
  getBooking,
  listBookings,
  listMyBookings,
  removeBooking,
  updateBooking,
} from '../controllers/booking.controller.js'
import { adminRequired, authOptional, authRequired } from '../middleware/auth.js'
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
router.get('/mine', authRequired, listMyBookings)
router.post('/', authOptional, validate(createBookingSchema), createBooking)
router.patch('/:id/cancel', authRequired, validate(idParamsSchema, 'params'), cancelMyBooking)
router.get('/:id', validate(idParamsSchema, 'params'), getBooking)
router.put('/:id', adminRequired, validate(idParamsSchema, 'params'), validate(updateBookingSchema), updateBooking)
router.delete('/:id', adminRequired, validate(idParamsSchema, 'params'), removeBooking)
router.post('/admin', adminRequired, validate(createAdminBookingSchema), createAdminBookingController)

export default router