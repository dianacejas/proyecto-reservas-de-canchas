import { apiRequest } from './client'
import { loadAuth } from '../auth/storage'
import type {
  AdminCustomer,
  AuthResponse,
  Booking,
  BookingStatus,
  CheckoutResult,
  CommunityNotice,
  CreateCommunityNoticeInput,
  CreateRegistrationInput,
  DailyMetrics,
  Field,
  GroupStandings,
  Match,
  MatchEvent,
  Matchday,
  Payment,
  PaymentType,
  PlayerStats,
  PlayoffBracket,
  Team,
  TopScorerRow,
  Tournament,
  TournamentRegistration,
  TournamentStats,
} from '../types'

export interface CreateBookingInput {
  fieldId: string
  date: string
  startTime: string
  endTime: string
  clientInfo: { name: string; phone: string }
}

export interface CreateAdminBookingInput {
  fieldId: string
  date: string
  startTime: string
  endTime: string
  kind: 'reserva' | 'bloqueo'
  clientInfo?: { name: string; phone: string } | null
}

export interface LoginInput {
  email: string
  password: string
}

export interface RegisterInput {
  name: string
  email: string
  password: string
}

export interface FieldInput {
  name?: string
  sport?: string
  type?: string
  isCovered?: boolean
  dimensions?: string
  lighting?: string
  features?: string[]
  pricePerHour?: number
  standardPricePerHour?: number
  peakPricePerHour?: number
  peakHours?: string[]
  imageUrl?: string
  active?: boolean
  isActive?: boolean
}

export interface TournamentInput {
  name?: string
  status?: 'inscripcion' | 'en_curso' | 'finalizado'
}

export interface CreateMatchInput {
  tournamentId: string
  group: string
  matchday: number
  fase: 'grupos' | 'octavos' | 'cuartos' | 'semifinal' | 'final'
  homeTeamId: string
  awayTeamId: string
  homeGoals?: number | null
  awayGoals?: number | null
}

export function login(input: LoginInput): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function register(input: RegisterInput): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function listFields(): Promise<Field[]> {
  return apiRequest<Field[]>('/fields')
}

export function createField(input: FieldInput): Promise<Field> {
  return apiRequest<Field>('/fields', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateField(id: string, input: FieldInput): Promise<Field> {
  return apiRequest<Field>(`/fields/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export function updateCourt(id: string, input: Partial<FieldInput>): Promise<Field> {
  return apiRequest<Field>(`/admin/courts/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export function deleteField(id: string): Promise<Field> {
  return apiRequest<Field>(`/fields/${id}`, { method: 'DELETE' })
}

export function listBookings(fieldId: string, date: string): Promise<Booking[]> {
  return apiRequest<Booking[]>(`/bookings?fieldId=${fieldId}&date=${date}`)
}

export function listBookingsByDate(date: string): Promise<Booking[]> {
  return apiRequest<Booking[]>(`/bookings?date=${date}`)
}

export function createBooking(input: CreateBookingInput): Promise<Booking> {
  return apiRequest<Booking>('/bookings', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function listMyBookings(): Promise<Booking[]> {
  return apiRequest<Booking[]>('/bookings/mine')
}

export function cancelMyBooking(id: string): Promise<Booking> {
  return apiRequest<Booking>(`/bookings/${id}/cancel`, { method: 'PATCH' })
}

export function createAdminBooking(input: CreateAdminBookingInput): Promise<Booking> {
  return apiRequest<Booking>('/bookings/admin', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateBookingStatus(id: string, status: BookingStatus): Promise<Booking> {
  return apiRequest<Booking>(`/bookings/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  })
}

export function getDailyMetrics(date: string): Promise<DailyMetrics> {
  return apiRequest<DailyMetrics>(`/admin/metrics?date=${date}`)
}

export function listAdminCustomers(): Promise<AdminCustomer[]> {
  return apiRequest<AdminCustomer[]>('/admin/customers')
}

export async function downloadBalanceCsv(startDate?: string, endDate?: string): Promise<void> {
  const params = new URLSearchParams()
  if (startDate) params.set('startDate', startDate)
  if (endDate) params.set('endDate', endDate)
  const qs = params.toString() ? `?${params.toString()}` : ''

  const auth = loadAuth()
  const headers = new Headers()
  if (auth !== null) headers.set('Authorization', `Bearer ${auth.token}`)

  const response = await fetch(`/api/admin/reports/export${qs}`, { headers, credentials: 'include' })
  if (!response.ok) throw new Error('Error al descargar el balance CSV')

  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `copa5-balance-${startDate || new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(url)
}

export function completeBookingAtDoor(id: string): Promise<Booking> {
  return apiRequest<Booking>(`/admin/bookings/${id}/complete`, { method: 'POST' })
}

export function listTournaments(): Promise<Tournament[]> {
  return apiRequest<Tournament[]>('/tournaments')
}

export function createTournament(input: TournamentInput): Promise<Tournament> {
  return apiRequest<Tournament>('/tournaments', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateTournament(id: string, input: TournamentInput): Promise<Tournament> {
  return apiRequest<Tournament>(`/tournaments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export function deleteTournament(id: string): Promise<Tournament> {
  return apiRequest<Tournament>(`/tournaments/${id}`, { method: 'DELETE' })
}

export function getTournament(id: string): Promise<Tournament> {
  return apiRequest<Tournament>(`/tournaments/${id}`)
}

export function getStandings(id: string): Promise<GroupStandings[]> {
  return apiRequest<GroupStandings[]>(`/tournaments/${id}/standings`)
}

export function getMatchdays(id: string): Promise<Matchday[]> {
  return apiRequest<Matchday[]>(`/tournaments/${id}/matches`)
}

export function getMatch(id: string): Promise<Match> {
  return apiRequest<Match>(`/matches/${id}`)
}

export function listCommunityNotices(): Promise<CommunityNotice[]> {
  return apiRequest<CommunityNotice[]>('/community/notices')
}

export function createCommunityNotice(input: CreateCommunityNoticeInput): Promise<CommunityNotice> {
  return apiRequest<CommunityNotice>('/community/notices', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function closeCommunityNotice(id: string): Promise<CommunityNotice> {
  return apiRequest<CommunityNotice>(`/community/notices/${id}/close`, {
    method: 'PATCH',
  })
}

export function createMatch(input: CreateMatchInput): Promise<Match> {
  return apiRequest<Match>('/matches', {
    method: 'POST',
    body: JSON.stringify({ ...input, status: 'programado', homeGoals: null, awayGoals: null }),
  })
}

export function updateTeamPlayers(teamId: string, players: { name: string; number: number }[]): Promise<Team> {
  return apiRequest<Team>(`/teams/${teamId}`, {
    method: 'PUT',
    body: JSON.stringify({ players }),
  })
}

export function getTournamentStats(id: string): Promise<TournamentStats> {
  return apiRequest<TournamentStats>(`/tournaments/${id}/stats`)
}

export function getTopScorers(id: string): Promise<TopScorerRow[]> {
  return apiRequest<TopScorerRow[]>(`/tournaments/${id}/top-scorers`)
}

export function getPlayerStats(tournamentId: string, playerId: string): Promise<PlayerStats> {
  return apiRequest<PlayerStats>(`/tournaments/${tournamentId}/players/${encodeURIComponent(playerId)}/stats`)
}

export function createTournamentRegistration(
  id: string,
  input: CreateRegistrationInput
): Promise<TournamentRegistration> {
  return apiRequest<TournamentRegistration>(`/tournaments/${id}/registrations`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function listTournamentRegistrations(id: string): Promise<TournamentRegistration[]> {
  return apiRequest<TournamentRegistration[]>(`/tournaments/${id}/registrations`)
}

export function approveTournamentRegistration(
  id: string,
  registrationId: string,
  group: string
): Promise<{ registration: TournamentRegistration; team: Team }> {
  return apiRequest<{ registration: TournamentRegistration; team: Team }>(
    `/tournaments/${id}/registrations/${registrationId}/approve`,
    { method: 'POST', body: JSON.stringify({ group }) }
  )
}

export function rejectTournamentRegistration(
  id: string,
  registrationId: string
): Promise<TournamentRegistration> {
  return apiRequest<TournamentRegistration>(
    `/tournaments/${id}/registrations/${registrationId}/reject`,
    { method: 'POST' }
  )
}

export function listTournamentTeams(id: string): Promise<Team[]> {
  return apiRequest<Team[]>(`/tournaments/${id}/teams`)
}

export function createTeam(input: { name: string; tournamentId: string; group: string }): Promise<Team> {
  return apiRequest<Team>('/teams', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateMatchScore(
  id: string,
  input: {
    homeGoals: number
    awayGoals: number
    homePenalties?: number
    awayPenalties?: number
    events?: MatchEvent[]
    mvpPlayer?: string | null
  }
): Promise<Match> {
  const payload: Record<string, unknown> = { homeGoals: input.homeGoals, awayGoals: input.awayGoals }
  if (input.homePenalties !== undefined) payload.homePenalties = input.homePenalties
  if (input.awayPenalties !== undefined) payload.awayPenalties = input.awayPenalties
  if (input.events !== undefined) payload.events = input.events
  return apiRequest<Match>(`/matches/${id}/score`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function getPlayoffs(id: string): Promise<PlayoffBracket> {
  return apiRequest<PlayoffBracket>(`/tournaments/${id}/playoffs`)
}

export function generatePlayoffs(id: string): Promise<PlayoffBracket> {
  return apiRequest<PlayoffBracket>(`/tournaments/${id}/playoffs`, {
    method: 'POST',
    body: JSON.stringify({}),
  })
}

export function createCheckout(bookingId: string, paymentType: PaymentType = 'full'): Promise<CheckoutResult> {
  return apiRequest<CheckoutResult>('/payments/checkout', {
    method: 'POST',
    body: JSON.stringify({ bookingId, paymentType }),
  })
}

export function confirmSandboxPayment(paymentId: string): Promise<Payment> {
  return apiRequest<Payment>(`/payments/sandbox/${paymentId}/confirm`, {
    method: 'POST',
  })
}

export function getAdminMetrics(params: {
  date?: string
  startDate?: string
  endDate?: string
}): Promise<DailyMetrics> {
  const qs = new URLSearchParams()
  if (params.date) qs.set('date', params.date)
  if (params.startDate) qs.set('startDate', params.startDate)
  if (params.endDate) qs.set('endDate', params.endDate)
  return apiRequest<DailyMetrics>(`/admin/metrics?${qs.toString()}`)
}

export const queryKeys = {
  fields: () => ['fields'] as const,
  courts: () => ['courts'] as const,
  bookings: (fieldId?: string | null, date?: string) =>
    fieldId && date
      ? (['bookings', fieldId, date] as const)
      : fieldId
        ? (['bookings', fieldId] as const)
        : (['bookings'] as const),
  adminBookings: (date?: string) =>
    date ? (['admin-bookings', date] as const) : (['admin-bookings'] as const),
  adminMetrics: (params?: unknown) =>
    params ? (['admin-metrics', params] as const) : (['admin-metrics'] as const),
  adminCustomers: () => ['admin-customers'] as const,
  myBookings: () => ['my-bookings'] as const,
  tournaments: () => ['tournaments'] as const,
  tournament: (id: string) => ['tournament', id] as const,
  tournamentTeams: (id: string) => ['teams', id] as const,
  tournamentMatchdays: (id: string) => ['matchdays', id] as const,
  tournamentStandings: (id: string) => ['standings', id] as const,
  tournamentStats: (id: string) => ['stats', id] as const,
  tournamentTopScorers: (id: string) => ['top-scorers', id] as const,
  tournamentPlayoffs: (id: string) => ['playoffs', id] as const,
  tournamentRegistrations: (id: string) => ['registrations', id] as const,
} as const
