import { createHmac, timingSafeEqual } from 'node:crypto'
import type { Request } from 'express'
import { env } from '../config/env.js'
import type { CheckoutInput, PaymentIdParams } from '../schemas/index.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import {
  confirmMercadoPagoPayment,
  confirmSandboxPayment,
  createCheckout,
  fetchMercadoPagoPayment,
  getPaymentInfo,
} from '../services/payments.service.js'

export const checkout = asyncHandler(async (req, res) => {
  const body = req.validData.body as CheckoutInput
  res.status(201).json({ data: await createCheckout(body.bookingId, body.paymentType) })
})

export const confirmSandbox = asyncHandler(async (req, res) => {
  const { paymentId } = req.validData.params as PaymentIdParams
  res.json({ data: await confirmSandboxPayment(paymentId) })
})

export const getPayment = asyncHandler(async (req, res) => {
  const { paymentId } = req.validData.params as PaymentIdParams
  res.json({ data: await getPaymentInfo(paymentId) })
})

/** Extrae el id del pago desde el body (formato nuevo) o el query (IPN viejo). */
function extractPaymentId(req: Request): string | null {
  const fromBody = (req.body as { data?: { id?: unknown } } | undefined)?.data?.id
  const fromQuery = req.query.id
  const value = fromBody ?? fromQuery
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  return null
}

/**
 * Valida el header `x-signature` de Mercado Pago (HMAC-SHA256). Si no hay
 * `MERCADO_PAGO_WEBHOOK_SECRET` configurado se omite (entorno de desarrollo).
 */
function isValidSignature(req: Request, dataId: string): boolean {
  const secret = env.MERCADO_PAGO_WEBHOOK_SECRET
  if (secret === undefined || secret.length === 0) return true

  const signature = req.header('x-signature')
  const requestId = req.header('x-request-id') ?? ''
  if (signature === undefined) return false

  const parts: Record<string, string> = {}
  for (const chunk of signature.split(',')) {
    const [key, value] = chunk.split('=')
    if (key !== undefined && value !== undefined) parts[key.trim()] = value.trim()
  }
  const ts = parts.ts
  const v1 = parts.v1
  if (ts === undefined || v1 === undefined) return false

  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${ts};`
  const expected = createHmac('sha256', secret).update(manifest).digest('hex')
  const expectedBuffer = Buffer.from(expected)
  const receivedBuffer = Buffer.from(v1)
  return (
    expectedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(expectedBuffer, receivedBuffer)
  )
}

export const handleWebhook = asyncHandler(async (req, res) => {
  if (env.PAYMENT_PROVIDER !== 'mercadopago') {
    res.status(400).json({ error: { message: 'Webhook deshabilitado: el proveedor de pagos no es Mercado Pago' } })
    return
  }

  const paymentId = extractPaymentId(req)
  if (paymentId === null) {
    // Notificación sin pago asociado (p. ej. merchant_order): se acepta y se ignora.
    res.sendStatus(200)
    return
  }

  if (!isValidSignature(req, paymentId)) {
    res.status(401).json({ error: { message: 'Firma del webhook inválida' } })
    return
  }

  const mercadoPagoPayment = await fetchMercadoPagoPayment(paymentId)
  await confirmMercadoPagoPayment(mercadoPagoPayment)
  res.sendStatus(200)
})
