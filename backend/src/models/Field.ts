import { Schema, model, Types, type InferSchemaType } from 'mongoose'

const fieldSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true, default: 'Fútbol 5' },
    pricePerHour: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, default: '', trim: true },
    isActive: { type: Boolean, default: true },
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

export const Field = model('Field', fieldSchema)