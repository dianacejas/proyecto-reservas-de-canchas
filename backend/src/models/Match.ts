import { Schema, model, Types, type InferSchemaType } from 'mongoose'

const matchSchema = new Schema(
  {
    tournamentId: { type: Schema.Types.ObjectId, ref: 'Tournament', required: true, index: true },
    group: { type: String, required: true, trim: true },
    matchday: { type: Number, required: true, min: 1 },
    fase: {
      type: String,
      enum: ['grupos', 'octavos', 'cuartos', 'semifinal', 'final'],
      default: 'grupos',
    },
    homeTeamId: { type: Schema.Types.ObjectId, ref: 'Team', default: null },
    awayTeamId: { type: Schema.Types.ObjectId, ref: 'Team', default: null },
    homeGoals: { type: Number, min: 0, default: null },
    awayGoals: { type: Number, min: 0, default: null },
    homePenalties: { type: Number, min: 0, default: null },
    awayPenalties: { type: Number, min: 0, default: null },
    status: { type: String, enum: ['programado', 'finalizado'], default: 'programado' },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', default: null },
    nextMatchId: { type: Schema.Types.ObjectId, ref: 'Match', default: null },
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

matchSchema.index({ tournamentId: 1, group: 1, matchday: 1 })
matchSchema.index({ status: 1 })

export type MatchDoc = InferSchemaType<typeof matchSchema> & { _id: Types.ObjectId }

export const Match = model('Match', matchSchema)