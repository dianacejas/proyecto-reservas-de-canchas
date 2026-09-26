import { Schema, model, Types, type InferSchemaType } from 'mongoose'

const paymentSchema = new Schema(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    provider: { type: String, enum: ['sandbox', 'mercadopago'], required: true },
    amount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['pendiente', 'pagado', 'fallido', 'cancelado'], default: 'pendiente' },
    externalId: { type: String, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = ret._id
        delete ret._id
        delete ret.__v
      },
    },
  }
)

paymentSchema.index({ status: 1 })

export type PaymentDoc = InferSchemaType<typeof paymentSchema> & { _id: Types.ObjectId }

export const Payment = model('Payment', paymentSchema)