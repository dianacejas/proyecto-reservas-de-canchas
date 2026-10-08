import { Schema, model, Types, type InferSchemaType } from 'mongoose'

export const REGISTRATION_STATUSES = ['pendiente_aprobacion', 'aprobada', 'rechazada'] as const

const registrationPlayerSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    number: { type: Number, min: 0, max: 99, default: null },
  },
  { _id: false }
)

const tournamentRegistrationSchema = new Schema(
  {
    tournamentId: { type: Schema.Types.ObjectId, ref: 'Tournament', required: true, index: true },
    teamName: { type: String, required: true, trim: true },
    color: { type: String, trim: true, default: '#16a34a' },
    captainName: { type: String, required: true, trim: true },
    captainPhone: { type: String, required: true, trim: true },
    players: { type: [registrationPlayerSchema], default: [] },
    status: { type: String, enum: REGISTRATION_STATUSES, default: 'pendiente_aprobacion' },
    assignedGroup: { type: String, trim: true, default: null },
    teamId: { type: Schema.Types.ObjectId, ref: 'Team', default: null },
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

tournamentRegistrationSchema.index({ tournamentId: 1, status: 1 })

export type TournamentRegistrationDoc = InferSchemaType<typeof tournamentRegistrationSchema> & {
  _id: Types.ObjectId
}

export const TournamentRegistration = model('TournamentRegistration', tournamentRegistrationSchema)
