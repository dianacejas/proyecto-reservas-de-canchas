import { z } from 'zod'
import { objectIdSchema } from './common.js'

export const paymentTypeSchema = z.enum(['deposit', 'full'])

export const checkoutSchema = z.object({
  bookingId: objectIdSchema,
  paymentType: paymentTypeSchema.default('full'),
})

export const paymentIdParamsSchema = z.object({
  paymentId: objectIdSchema,
})

export type CheckoutInput = z.infer<typeof checkoutSchema>
export type PaymentIdParams = z.infer<typeof paymentIdParamsSchema>