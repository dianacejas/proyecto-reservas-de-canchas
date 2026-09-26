import mongoose from 'mongoose'
import { connectDB } from './config/db.js'
import { Booking, Field, Match, Team, Tournament, User } from './models/index.js'
import { createPublicBooking } from './services/booking.service.js'
import { createMatch } from './services/match.service.js'
import { hashPassword } from './utils/password.js'

const ROSTER = ['Dani', 'Leo', 'Marco', 'Andrés', 'Tino', 'Rafa', 'Seba']

function makePlayers(): { name: string; number: number }[] {
  return ROSTER.map((name, number) => ({ name, number }))
}

function nextDay(daysFromNow: number): Date {
  return new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000)
}

async function seed(): Promise<void> {
  await connectDB()

  await Promise.all([
    Field.deleteMany({}),
    Booking.deleteMany({}),
    Team.deleteMany({}),
    Match.deleteMany({}),
    Tournament.deleteMany({}),
    User.deleteMany({}),
  ])

  const [admin, cliente] = await User.create([
    {
      name: 'Administrador',
      email: 'admin@canchas.com',
      passwordHash: hashPassword('admin123'),
      role: 'admin',
    },
    {
      name: 'Juan Pérez',
      email: 'juan@canchas.com',
      passwordHash: hashPassword('juan123'),
      role: 'cliente',
    },
  ])

  const [canchaAlpha, canchaBeta] = await Field.create([
    { name: 'Cancha Alpha', pricePerHour: 120000 },
    { name: 'Cancha Beta', pricePerHour: 140000 },
  ])

  const torneo = await Tournament.create({ name: 'Copa Fin de Semana 2026' })
  const tournamentId = torneo._id.toString()
  const campoAId = canchaAlpha._id.toString()
  const campoBId = canchaBeta._id.toString()

  const groupANames = ['Los Gladiadores', 'FC Rayos', 'Deportivo Norte', 'Atlético Sur']
  const groupBNames = ['Real Viento', 'Storm Fútbol', 'Academia Cruz', 'Club Estrella']

  const teams = await Team.create([
    ...groupANames.map((name) => ({ name, tournamentId, group: 'Grupo A', players: makePlayers() })),
    ...groupBNames.map((name) => ({ name, tournamentId, group: 'Grupo B', players: makePlayers() })),
  ])

  const [ga1, ga2, ga3, ga4] = teams.filter((team) => team.group === 'Grupo A')
  const [gb1, gb2, gb3, gb4] = teams.filter((team) => team.group === 'Grupo B')

  const fixturesDayOne = [
    { group: 'Grupo A', homeTeamId: ga1, awayTeamId: ga2, homeGoals: 4, awayGoals: 2 },
    { group: 'Grupo A', homeTeamId: ga3, awayTeamId: ga4, homeGoals: 1, awayGoals: 1 },
    { group: 'Grupo B', homeTeamId: gb1, awayTeamId: gb2, homeGoals: 0, awayGoals: 3 },
    { group: 'Grupo B', homeTeamId: gb3, awayTeamId: gb4, homeGoals: 2, awayGoals: 1 },
  ]

  for (const fixture of fixturesDayOne) {
    await createMatch({
      tournamentId,
      group: fixture.group,
      matchday: 1,
      homeTeamId: fixture.homeTeamId._id.toString(),
      awayTeamId: fixture.awayTeamId._id.toString(),
      homeGoals: fixture.homeGoals,
      awayGoals: fixture.awayGoals,
    })
  }

  await createMatch({
    tournamentId,
    group: 'Grupo A',
    matchday: 2,
    homeTeamId: ga1._id.toString(),
    awayTeamId: ga3._id.toString(),
    fieldId: campoAId,
    date: nextDay(7),
    startTime: '18:00',
    endTime: '19:00',
  })

  await createMatch({
    tournamentId,
    group: 'Grupo B',
    matchday: 2,
    homeTeamId: gb2._id.toString(),
    awayTeamId: gb4._id.toString(),
    fieldId: campoBId,
    date: nextDay(7),
    startTime: '18:00',
    endTime: '19:00',
  })

  await createPublicBooking({
    fieldId: campoAId,
    date: nextDay(7),
    startTime: '19:00',
    endTime: '20:00',
    clientInfo: { name: 'Daniel Pérez', phone: '3001234567' },
  })

  const summary = {
    canchas: await Field.countDocuments(),
    torneos: await Tournament.countDocuments(),
    equipos: await Team.countDocuments(),
    partidos: await Match.countDocuments(),
    reservas: await Booking.countDocuments(),
    usuarios: await User.countDocuments(),
  }
  console.log('Seed completado:', summary)
  console.log('Usuarios de prueba — admin:', admin.email, '/ admin123 | cliente:', cliente.email, '/ juan123')
  await mongoose.disconnect()
}

seed().catch((err) => {
  console.error('Error durante el seed:', err)
  process.exit(1)
})