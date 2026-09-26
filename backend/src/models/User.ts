import { Schema, model, Types, type InferSchemaType } from 'mongoose'

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['admin', 'cliente'], default: 'cliente' },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = ret._id
        delete ret._id
        delete ret.__v
        delete ret.passwordHash
      },
    },
  }
)

export type UserDoc = InferSchemaType<typeof userSchema> & { _id: Types.ObjectId }

export const User = model('User', userSchema)