import { env } from '../config/env.js'
import type { CheckoutInput, PaymentIdParams } from '../schemas/index.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import {
  confirmSandboxPayment,
  createCheckout,
  getPaymentInfo,
} from '../services/payments.service.js'

export const checkout = asyncHandler(async (req, res) => {
  const body = req.validData.body as CheckoutInput
  res.status(201).json({ data: await createCheckout(body.bookingId) })
})

export const confirmSandbox = asyncHandler(async (req, res) => {
  const { paymentId } = req.validData.params as PaymentIdParams
  res.json({ data: await confirmSandboxPayment(paymentId) })
})

export const getPayment = asyncHandler(async (req, res) => {
  const { paymentId } = req.validData.params as PaymentIdParams
  res.json({ data: await getPaymentInfo(paymentId) })
})

export const handleWebhook = asyncHandler(async (_req, res) => {
  if (env.PAYMENT_PROVIDER !== 'mercadopago') {
    res.status(400).json({ error: { message: 'Webhook deshabilitado: el proveedor de pagos no es Mercado Pago' } })
    return
  }
  res.sendStatus(200)
})