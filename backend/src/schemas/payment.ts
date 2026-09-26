import { z } from 'zod'
import { objectIdSchema } from './common.js'

export const checkoutSchema = z.object({
  bookingId: objectIdSchema,
})

export const paymentIdParamsSchema = z.object({
  paymentId: objectIdSchema,
})

export type CheckoutInput = z.infer<typeof checkoutSchema>
export type PaymentIdParams = z.infer<typeof paymentIdParamsSchema>