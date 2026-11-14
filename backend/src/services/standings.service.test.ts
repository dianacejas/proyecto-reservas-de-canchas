import { describe, expect, it } from 'vitest'
import { computeStandings, type MatchRecord } from './standings.service.js'

describe('Servicio de Tabla de Posiciones (Cálculos Puros)', () => {
  const teams = [
    { id: 'team-a', name: 'Equipo A' },
    { id: 'team-b', name: 'Equipo B' },
    { id: 'team-c', name: 'Equipo C' },
  ]

  it('asigna 3 puntos al ganador y 0 al perdedor', () => {
    const matches: MatchRecord[] = [
      {
        homeTeamId: 'team-a',
        awayTeamId: 'team-b',
        homeGoals: 3,
        awayGoals: 1,
        status: 'finalizado',
      },
    ]

    const standings = computeStandings(teams, matches)
    const teamA = standings.find((s) => s.teamId === 'team-a')!
    const teamB = standings.find((s) => s.teamId === 'team-b')!

    expect(teamA.points).toBe(3)
    expect(teamA.won).toBe(1)
    expect(teamA.lost).toBe(0)
    expect(teamA.goalsFor).toBe(3)
    expect(teamA.goalsAgainst).toBe(1)
    expect(teamA.goalDifference).toBe(2)

    expect(teamB.points).toBe(0)
    expect(teamB.won).toBe(0)
    expect(teamB.lost).toBe(1)
    expect(teamB.goalsFor).toBe(1)
    expect(teamB.goalsAgainst).toBe(3)
    expect(teamB.goalDifference).toBe(-2)
  })

  it('asigna 1 punto a cada equipo en caso de empate', () => {
    const matches: MatchRecord[] = [
      {
        homeTeamId: 'team-a',
        awayTeamId: 'team-b',
        homeGoals: 2,
        awayGoals: 2,
        status: 'finalizado',
      },
    ]

    const standings = computeStandings(teams, matches)
    const teamA = standings.find((s) => s.teamId === 'team-a')!
    const teamB = standings.find((s) => s.teamId === 'team-b')!

    expect(teamA.points).toBe(1)
    expect(teamA.drawn).toBe(1)
    expect(teamB.points).toBe(1)
    expect(teamB.drawn).toBe(1)
  })

  it('ordena por puntos, luego por diferencia de goles y goles a favor', () => {
    const matches: MatchRecord[] = [
      // team-a gana 1-0 contra team-c (+1 dif, 3 pts)
      { homeTeamId: 'team-a', awayTeamId: 'team-c', homeGoals: 1, awayGoals: 0, status: 'finalizado' },
      // team-b gana 4-0 contra team-c (+4 dif, 3 pts)
      { homeTeamId: 'team-b', awayTeamId: 'team-c', homeGoals: 4, awayGoals: 0, status: 'finalizado' },
    ]

    const standings = computeStandings(teams, matches)

    // team-b debe ser 1º por mejor diferencia de gol (+4 vs +1)
    expect(standings[0].teamId).toBe('team-b')
    expect(standings[0].position).toBe(1)
    expect(standings[0].points).toBe(3)
    expect(standings[0].goalDifference).toBe(4)

    expect(standings[1].teamId).toBe('team-a')
    expect(standings[1].position).toBe(2)
    expect(standings[1].points).toBe(3)
    expect(standings[1].goalDifference).toBe(1)

    expect(standings[2].teamId).toBe('team-c')
    expect(standings[2].position).toBe(3)
    expect(standings[2].points).toBe(0)
  })

  it('ignora partidos no finalizados o con equipos vacantes/BYE', () => {
    const matches: MatchRecord[] = [
      { homeTeamId: 'team-a', awayTeamId: 'team-b', homeGoals: 2, awayGoals: 0, status: 'programado' },
      { homeTeamId: 'team-a', awayTeamId: null, homeGoals: 1, awayGoals: 0, status: 'finalizado' },
    ]

    const standings = computeStandings(teams, matches)
    const teamA = standings.find((s) => s.teamId === 'team-a')!

    expect(teamA.played).toBe(0)
    expect(teamA.points).toBe(0)
  })
})
