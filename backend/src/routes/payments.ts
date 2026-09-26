import { Router } from 'express'
import { checkout, confirmSandbox, getPayment, handleWebhook } from '../controllers/payments.controller.js'
import { authRequired } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { checkoutSchema, paymentIdParamsSchema } from '../schemas/index.js'

const router = Router()

router.post('/checkout', authRequired, validate(checkoutSchema), checkout)
router.get('/sandbox/:paymentId', authRequired, validate(paymentIdParamsSchema, 'params'), getPayment)
router.post('/sandbox/:paymentId/confirm', validate(paymentIdParamsSchema, 'params'), confirmSandbox)
router.get('/sandbox/:paymentId/confirm', validate(paymentIdParamsSchema, 'params'), confirmSandbox)
router.post('/webhook', handleWebhook)

export default router