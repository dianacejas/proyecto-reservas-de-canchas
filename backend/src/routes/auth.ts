import { Router } from 'express'
import { login, me, register } from '../controllers/auth.controller.js'
import { authRequired } from '../middleware/auth.js'
import { authLimiter } from '../middleware/rateLimit.js'
import { validate } from '../middleware/validate.js'
import { loginSchema, registerSchema } from '../schemas/index.js'

const router = Router()

router.post('/register', authLimiter, validate(registerSchema), register)
router.post('/login', authLimiter, validate(loginSchema), login)
router.get('/me', authRequired, me)

export default router