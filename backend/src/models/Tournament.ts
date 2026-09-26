import { Schema, model, Types, type InferSchemaType } from 'mongoose'

const tournamentSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['inscripcion', 'en_curso', 'finalizado'],
      default: 'inscripcion',
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

export type TournamentDoc = InferSchemaType<typeof tournamentSchema> & { _id: Types.ObjectId }

export const Tournament = model('Tournament', tournamentSchema)