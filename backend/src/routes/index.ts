import { Router } from 'express'
import authRoutes from './auth.js'
import bookingRoutes from './bookings.js'
import fieldRoutes from './fields.js'
import matchRoutes from './matches.js'
import paymentRoutes from './payments.js'
import teamRoutes from './teams.js'
import tournamentRoutes from './tournaments.js'

const router = Router()

router.use('/auth', authRoutes)
router.use('/fields', fieldRoutes)
router.use('/bookings', bookingRoutes)
router.use('/tournaments', tournamentRoutes)
router.use('/teams', teamRoutes)
router.use('/matches', matchRoutes)
router.use('/payments', paymentRoutes)

export default router