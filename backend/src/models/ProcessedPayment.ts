import { Schema, model, Types, type InferSchemaType } from 'mongoose'

const processedPaymentSchema = new Schema(
  {
    paymentId: { type: String, required: true, unique: true, index: true },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    status: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 30 * 24 * 60 * 60 },
  },
  {
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

export type ProcessedPaymentDoc = InferSchemaType<typeof processedPaymentSchema> & { _id: Types.ObjectId }

export const ProcessedPayment = model('ProcessedPayment', processedPaymentSchema)
