import { Schema, model, Types, type InferSchemaType } from 'mongoose'

const bookingSchema = new Schema(
  {
    fieldId: { type: Schema.Types.ObjectId, ref: 'Field', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    clientInfo: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
    },
    status: { type: String, enum: ['pendiente', 'confirmada', 'cancelada', 'pagada', 'bloqueada'], default: 'pendiente' },
    type: { type: String, enum: ['amistoso', 'torneo', 'mantenimiento'], default: 'amistoso' },
    totalAmount: { type: Number, default: 0 },
    depositAmount: { type: Number, default: 0 },
    remainingBalance: { type: Number, default: 0 },
    paymentType: { type: String, enum: ['deposit', 'full'], default: 'full' },
    expiresAt: { type: Date },
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

bookingSchema.index({ fieldId: 1, date: 1 })
bookingSchema.index({ status: 1 })
bookingSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export type BookingDoc = InferSchemaType<typeof bookingSchema> & { _id: Types.ObjectId }

export const Booking = model('Booking', bookingSchema)
