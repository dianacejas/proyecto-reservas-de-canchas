import {
  Team,
  Tournament,
  TournamentRegistration,
  type TournamentRegistrationDoc,
} from '../models/index.js'
import type { ApproveRegistrationInput, CreateRegistrationInput } from '../schemas/index.js'
import { AppError } from '../utils/AppError.js'
import { assertFound } from '../utils/assertFound.js'

export async function createRegistration(
  tournamentId: string,
  input: CreateRegistrationInput
): Promise<TournamentRegistrationDoc> {
  assertFound(await Tournament.findById(tournamentId), 'Torneo no encontrado')

  const duplicate = await TournamentRegistration.findOne({
    tournamentId,
    teamName: input.teamName,
    status: { $ne: 'rechazada' },
  })
  if (duplicate !== null) {
    throw new AppError(409, 'Ya existe una inscripción para ese equipo')
  }

  return TournamentRegistration.create({
    tournamentId,
    teamName: input.teamName,
    color: input.color,
    captainName: input.captainName,
    captainPhone: input.captainPhone,
    players: input.players.map((name, index) => ({ name, number: index + 1 })),
  })
}

export async function listRegistrations(
  tournamentId: string,
  status?: string
): Promise<TournamentRegistrationDoc[]> {
  const filter: Record<string, unknown> = { tournamentId }
  if (status) filter.status = status
  return TournamentRegistration.find(filter).sort({ createdAt: -1 })
}

export async function approveRegistration(
  tournamentId: string,
  registrationId: string,
  input: ApproveRegistrationInput
): Promise<{ registration: TournamentRegistrationDoc; team: unknown }> {
  const registration = assertFound(
    await TournamentRegistration.findOne({ _id: registrationId, tournamentId }),
    'Inscripción no encontrada'
  )
  if (registration.status === 'aprobada') {
    throw new AppError(409, 'La inscripción ya fue aprobada')
  }

  const team = await Team.create({
    name: registration.teamName,
    tournamentId,
    group: input.group,
    players: registration.players.map((player, index) => ({
      name: player.name,
      number: player.number ?? index + 1,
    })),
  })

  registration.status = 'aprobada'
  registration.assignedGroup = input.group
  registration.teamId = team._id
  await registration.save()

  return { registration, team }
}

export async function rejectRegistration(
  tournamentId: string,
  registrationId: string
): Promise<TournamentRegistrationDoc> {
  const registration = assertFound(
    await TournamentRegistration.findOne({ _id: registrationId, tournamentId }),
    'Inscripción no encontrada'
  )
  if (registration.status === 'rechazada') return registration
  registration.status = 'rechazada'
  await registration.save()
  return registration
}
