import rateLimit from 'express-rate-limit'
import { env } from '../config/env.js'

const MINUTE = 60 * 1000

/**
 * Fuerza bruta sobre autenticación: pocos intentos por minuto y por IP.
 * Aplica a /api/auth/login y /api/auth/register.
 */
export const authLimiter = rateLimit({
  windowMs: MINUTE,
  limit: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: {
      message: 'Demasiados intentos. Esperá un minuto antes de volver a probar.',
    },
  },
})

/**
 * Spam de reservas: evita que una misma IP bloquee turnos creando reservas
 * públicas en masa. Ventana amplia porque un cliente legítimo no reserva
 * decenas de turnos seguidos.
 */
export const bookingCreateLimiter = rateLimit({
  windowMs: 15 * MINUTE,
  limit: env.BOOKING_RATE_LIMIT_MAX,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: {
      message: 'Demasiadas reservas desde esta conexión. Probá más tarde o contactanos por WhatsApp.',
    },
  },
})

/**
 * Webhook de pagos: límite generoso, solo para contener abuso automatizado.
 */
export const webhookLimiter = rateLimit({
  windowMs: MINUTE,
  limit: 120,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
})
