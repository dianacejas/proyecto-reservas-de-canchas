import { randomBytes } from 'node:crypto'
import { fileURLToPath } from 'node:url'
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

export async function runResetSeed(): Promise<Record<string, number>> {
  await Promise.all([
    Booking.deleteMany({}),
    Team.deleteMany({}),
    Match.deleteMany({}),
    Tournament.deleteMany({}),
  ])

  let canchas = await Field.find({ isActive: true })
  if (canchas.length < 2) {
    await Field.deleteMany({})
    canchas = await Field.create([
      { name: 'Cancha Alpha', pricePerHour: 120000, isActive: true },
      { name: 'Cancha Beta', pricePerHour: 140000, isActive: true },
    ])
  }

  const [canchaAlpha, canchaBeta] = canchas
  const campoAId = canchaAlpha._id.toString()
  const campoBId = canchaBeta._id.toString()

  const torneo = await Tournament.create({ name: 'Copa Fin de Semana 2026', status: 'en_curso' })
  const tournamentId = torneo._id.toString()

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
    const homeTeamId = fixture.homeTeamId._id.toString()
    const awayTeamId = fixture.awayTeamId._id.toString()
    const homePlayers = fixture.homeTeamId.players
    const awayPlayers = fixture.awayTeamId.players
    const events: {
      type: 'goal' | 'yellow_card' | 'red_card'
      playerName: string
      teamId: string
      minute: number
    }[] = []

    for (let index = 0; index < fixture.homeGoals; index += 1) {
      events.push({
        type: 'goal',
        playerName: homePlayers[index % homePlayers.length].name,
        teamId: homeTeamId,
        minute: 10 + index * 7,
      })
    }
    for (let index = 0; index < fixture.awayGoals; index += 1) {
      events.push({
        type: 'goal',
        playerName: awayPlayers[index % awayPlayers.length].name,
        teamId: awayTeamId,
        minute: 15 + index * 9,
      })
    }
    events.push({
      type: 'yellow_card',
      playerName: homePlayers[1 % homePlayers.length].name,
      teamId: homeTeamId,
      minute: 38,
    })
    events.push({
      type: 'yellow_card',
      playerName: awayPlayers[2 % awayPlayers.length].name,
      teamId: awayTeamId,
      minute: 44,
    })
    events.push({
      type: 'red_card',
      playerName: awayPlayers[3 % awayPlayers.length].name,
      teamId: awayTeamId,
      minute: 72,
    })

    await createMatch({
      tournamentId,
      group: fixture.group,
      matchday: 1,
      homeTeamId,
      awayTeamId,
      homeGoals: fixture.homeGoals,
      awayGoals: fixture.awayGoals,
      events,
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

  return {
    canchas: await Field.countDocuments(),
    torneos: await Tournament.countDocuments(),
    equipos: await Team.countDocuments(),
    partidos: await Match.countDocuments(),
    reservas: await Booking.countDocuments(),
  }
}

async function cliSeed(): Promise<void> {
  await connectDB()

  await Promise.all([
    Field.deleteMany({}),
    Booking.deleteMany({}),
    Team.deleteMany({}),
    Match.deleteMany({}),
    Tournament.deleteMany({}),
    User.deleteMany({}),
  ])

  const seedAdminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@canchas.com'
  const seedAdminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'admin123'
  const seedClientEmail = process.env.SEED_CLIENT_EMAIL ?? 'juan@canchas.com'
  const seedClientPassword = process.env.SEED_CLIENT_PASSWORD ?? 'juan123'

  await User.create([
    {
      name: 'Administrador',
      email: seedAdminEmail,
      passwordHash: hashPassword(seedAdminPassword),
      role: 'admin',
    },
    {
      name: 'Juan Pérez',
      email: seedClientEmail,
      passwordHash: hashPassword(seedClientPassword),
      role: 'cliente',
    },
    {
      name: 'Admin Ejemplo',
      email: 'admin@ejemplo.com',
      passwordHash: hashPassword('admin123'),
      role: 'admin',
    },
    {
      name: 'Cliente Ejemplo',
      email: 'cliente@ejemplo.com',
      passwordHash: hashPassword('cliente123'),
      role: 'cliente',
    },
  ])

  const summary = await runResetSeed()
  console.log('Seed completado:', { ...summary, usuarios: await User.countDocuments() })
  console.log('Usuarios de prueba creados:')
  console.log(`  admin:   ${seedAdminEmail} / ${seedAdminPassword}`)
  console.log(`  cliente: ${seedClientEmail} / ${seedClientPassword}`)
  await mongoose.disconnect()
}

// Ejecutar si se llama directamente con node/tsx
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  cliSeed().catch((err) => {
    console.error('Error durante el seed:', err)
    process.exit(1)
  })
}
