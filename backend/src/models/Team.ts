import { Schema, model, Types, type InferSchemaType } from 'mongoose'

const teamSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    tournamentId: { type: Schema.Types.ObjectId, ref: 'Tournament', required: true, index: true },
    group: { type: String, required: true, trim: true, default: 'Grupo A' },
    players: [
      {
        name: { type: String, required: true, trim: true },
        number: { type: Number, required: true, min: 0, max: 99 },
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

teamSchema.index({ tournamentId: 1, group: 1 })

export type TeamDoc = InferSchemaType<typeof teamSchema> & { _id: Types.ObjectId }

export const Team = model('Team', teamSchema)