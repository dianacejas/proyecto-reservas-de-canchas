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
    consumptions: [
      {
        name: { type: String, required: true, trim: true },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true, min: 0 },
        subtotal: { type: Number, required: true, min: 0 },
      },
    ],
    paymentStatus: { type: String, enum: ['senia_pagada', 'liquidada', 'pendiente'], default: 'pendiente' },
    counterPaymentMethod: { type: String, enum: ['efectivo', 'transferencia', 'debito'], default: null },
    settledAt: { type: Date, default: null },
    isBlocked: { type: Boolean, default: false },
    blockReason: { type: String, enum: ['mantenimiento', 'lluvia', 'otro'], default: null },
    creditNote: { type: Number, default: 0 },
    retainedDeposit: { type: Boolean, default: false },
    expiresAt: { type: Date, default: null },
    activeSlotKey: { type: String, default: null },
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

bookingSchema.pre('save', function () {
  if (this.status === 'cancelada') {
    this.activeSlotKey = null
  } else if (this.fieldId && this.date && this.startTime) {
    const d = new Date(this.date).toISOString().slice(0, 10)
    this.activeSlotKey = `${this.fieldId.toString()}_${d}_${this.startTime}`
  }
})

bookingSchema.index({ fieldId: 1, date: 1 })
bookingSchema.index({ fieldId: 1, date: 1, startTime: 1 })
bookingSchema.index({ status: 1, expiresAt: 1 })
bookingSchema.index({ userId: 1, date: 1 })
bookingSchema.index(
  { activeSlotKey: 1 },
  { unique: true, partialFilterExpression: { activeSlotKey: { $type: 'string' } } }
)

export type BookingDoc = InferSchemaType<typeof bookingSchema> & { _id: Types.ObjectId }

export const Booking = model('Booking', bookingSchema)
