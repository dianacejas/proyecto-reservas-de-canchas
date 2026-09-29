export type BookingStatus = 'pendiente' | 'confirmada' | 'cancelada'
export type BookingType = 'amistoso' | 'torneo' | 'mantenimiento'
export type TournamentStatus = 'inscripcion' | 'en_curso' | 'finalizado'
export type MatchStatus = 'programado' | 'finalizado'
export type MatchFase = 'grupos' | 'octavos' | 'cuartos' | 'semifinal' | 'final'

export interface Field {
  id: string
  name: string
  type: string
  pricePerHour: number
  imageUrl?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface FieldRef {
  id: string
  name: string
  type: string
}

export interface ClientInfo {
  name: string
  phone: string
}

export interface Booking {
  id: string
  fieldId: string | FieldRef
  date: string
  startTime: string
  endTime: string
  clientInfo: ClientInfo
  status: BookingStatus
  type: BookingType
  createdAt: string
  updatedAt: string
}

export interface Tournament {
  id: string
  name: string
  status: TournamentStatus
  createdAt: string
  updatedAt: string
  teamsCount?: number
  matchesCount?: number
}

export interface TeamPlayer {
  name: string
  number: number
}

export interface Team {
  id: string
  name: string
  tournamentId: string
  group: string
  players: TeamPlayer[]
  createdAt: string
  updatedAt: string
}

export interface TeamRef {
  id: string
  name: string
}

export interface MatchBookingRef {
  id: string
  fieldId: string | FieldRef
  date: string
  startTime: string
  endTime: string
  status: BookingStatus
  type: BookingType
}

export interface Match {
  id: string
  tournamentId: string
  group: string
  matchday: number
  fase: MatchFase
  homeTeamId: string | TeamRef | null
  awayTeamId: string | TeamRef | null
  homeGoals: number | null
  awayGoals: number | null
  homePenalties: number | null
  awayPenalties: number | null
  status: MatchStatus
  bookingId: MatchBookingRef | null
  nextMatchId: string | null
  createdAt: string
  updatedAt: string
}

export interface StandingRow {
  position: number
  teamId: string
  teamName: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
}

export interface GroupStandings {
  group: string
  rows: StandingRow[]
}

export interface Matchday {
  matchday: number
  matches: Match[]
}

export interface PlayoffRound {
  fase: MatchFase
  label: string
  matches: Match[]
}

export interface PlayoffBracket {
  rounds: PlayoffRound[]
  champion: { teamId: string; teamName: string } | null
}

export type UserRole = 'admin' | 'cliente'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  token: string
  user: AuthUser
}

export type PaymentProvider = 'sandbox' | 'mercadopago'
export type PaymentStatus = 'pendiente' | 'pagado' | 'fallido' | 'cancelado'

export interface Payment {
  id: string
  bookingId: string
  provider: PaymentProvider
  amount: number
  status: PaymentStatus
  externalId: string | null
  createdAt: string
  updatedAt: string
}

export interface CheckoutResult {
  provider: PaymentProvider
  paymentId: string
  checkoutUrl: string | null
  amount: number
}