import { Router } from 'express'
import adminRoutes from './admin.js'
import authRoutes from './auth.js'
import bookingRoutes from './bookings.js'
import fieldRoutes from './fields.js'
import matchRoutes from './matches.js'
import paymentRoutes from './payments.js'
import teamRoutes from './teams.js'
import tournamentRoutes from './tournaments.js'
import communityRoutes from './community.js'
import { webhookLimiter } from '../middleware/rateLimit.js'
import { handleWebhook } from '../controllers/payments.controller.js'

const router = Router()

router.use('/admin', adminRoutes)
router.use('/auth', authRoutes)
router.use('/fields', fieldRoutes)
router.use('/bookings', bookingRoutes)
router.use('/tournaments', tournamentRoutes)
router.use('/teams', teamRoutes)
router.use('/matches', matchRoutes)
router.use('/payments', paymentRoutes)
router.use('/community', communityRoutes)
router.post('/webhooks/mercadopago', webhookLimiter, handleWebhook)

export default router