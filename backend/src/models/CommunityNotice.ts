import { Schema, model, type InferSchemaType, Types } from 'mongoose'

const communityNoticeSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['falta_uno', 'desafio_rival'],
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    date: { type: String, required: true, trim: true },
    timeSlot: { type: String, required: true, trim: true },
    courtName: { type: String, trim: true, default: '' },
    contactPhone: { type: String, required: true, trim: true },
    positionNeeded: {
      type: String,
      trim: true,
      default: 'Cualquiera',
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    authorName: {
      type: String,
      trim: true,
      default: 'Jugador Copa 5',
    },
    status: {
      type: String,
      enum: ['abierto', 'completado'],
      default: 'abierto',
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 172800, // TTL 48 horas
    },
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

communityNoticeSchema.index({ status: 1, date: 1 })

export type CommunityNoticeDoc = InferSchemaType<typeof communityNoticeSchema> & {
  _id: Types.ObjectId
}

export const CommunityNotice = model('CommunityNotice', communityNoticeSchema)
