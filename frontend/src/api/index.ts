import { apiRequest } from './client'
import type {
  AuthResponse,
  Booking,
  BookingStatus,
  CheckoutResult,
  Field,
  GroupStandings,
  Match,
  Matchday,
  Payment,
  Team,
  Tournament,
} from '../types'

export interface CreateBookingInput {
  fieldId: string
  date: string
  startTime: string
  endTime: string
  clientInfo: { name: string; phone: string }
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
  type?: string
  pricePerHour?: number
  imageUrl?: string
  isActive?: boolean
}

export interface TournamentInput {
  name: string
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

export function deleteField(id: string): Promise<Field> {
  return apiRequest<Field>(`/fields/${id}`, { method: 'DELETE' })
}

export function listBookings(fieldId: string, date: string): Promise<Booking[]> {
  return apiRequest<Booking[]>(`/bookings?fieldId=${fieldId}&date=${date}`)
}

export function createBooking(input: CreateBookingInput): Promise<Booking> {
  return apiRequest<Booking>('/bookings', {
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

export function listTournaments(): Promise<Tournament[]> {
  return apiRequest<Tournament[]>('/tournaments')
}

export function createTournament(input: TournamentInput): Promise<Tournament> {
  return apiRequest<Tournament>('/tournaments', {
    method: 'POST',
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

export function listTournamentTeams(id: string): Promise<Team[]> {
  return apiRequest<Team[]>(`/tournaments/${id}/teams`)
}

export function createTeam(input: { name: string; tournamentId: string; group: string }): Promise<Team> {
  return apiRequest<Team>('/teams', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateMatchScore(id: string, input: { homeGoals: number; awayGoals: number }): Promise<Match> {
  return apiRequest<Match>(`/matches/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export function createCheckout(bookingId: string): Promise<CheckoutResult> {
  return apiRequest<CheckoutResult>('/payments/checkout', {
    method: 'POST',
    body: JSON.stringify({ bookingId }),
  })
}

export function confirmSandboxPayment(paymentId: string): Promise<Payment> {
  return apiRequest<Payment>(`/payments/sandbox/${paymentId}/confirm`, {
    method: 'POST',
  })
}