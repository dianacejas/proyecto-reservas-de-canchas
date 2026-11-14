import { Schema, model, Types, type InferSchemaType } from 'mongoose'

const fieldSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    sport: { type: String, default: 'futbol5', trim: true },
    type: { type: String, required: true, trim: true, default: 'Fútbol 5' },
    isCovered: { type: Boolean, default: false },
    dimensions: { type: String, default: '30 x 18 mts', trim: true },
    lighting: { type: String, default: 'LED 500 Lux', trim: true },
    features: { type: [String], default: ['Vestuarios', 'Parrillas'] },
    pricePerHour: { type: Number, required: true, min: 0 },
    standardPricePerHour: { type: Number, min: 0 },
    peakPricePerHour: { type: Number, min: 0 },
    peakHours: { type: [String], default: ['19:00', '20:00', '21:00', '22:00', '23:00'] },
    imageUrl: { type: String, default: '', trim: true },
    active: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    blocks: [
      {
        date: { type: String, required: true },
        timeSlot: { type: String, required: true },
        reason: { type: String, enum: ['mantenimiento', 'lluvia', 'otro'], default: 'mantenimiento' },
      },
    ],
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

fieldSchema.index({ isActive: 1 })

export type FieldDoc = InferSchemaType<typeof fieldSchema> & { _id: Types.ObjectId }
export type CourtDoc = FieldDoc

export const Field = model('Field', fieldSchema)
export const Court = Field
