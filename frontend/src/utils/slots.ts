import type { Booking, Field } from '../types'

export const STANDARD_DIMENSIONS_BY_TYPE: Record<string, string> = {
  'Fútbol 5': '30 × 18 mts',
  'Fútbol 7': '50 × 30 mts',
  'Fútbol 9': '70 × 45 mts',
  'Fútbol 11': '100 × 65 mts',
  Pádel: '20 × 10 mts',
}

export function resolveCourtSportLabel(field: Partial<Field>): string {
  const combined = `${field.type ?? ''} ${field.sport ?? ''} ${field.name ?? ''}`.toLowerCase()
  if (/\b11\b|futbol11|fútbol\s*11|futbol\s*11/.test(combined)) return 'Fútbol 11'
  if (/\b9\b|futbol9|fútbol\s*9|futbol\s*9/.test(combined)) return 'Fútbol 9'
  if (/\b7\b|futbol7|fútbol\s*7|futbol\s*7/.test(combined)) return 'Fútbol 7'
  if (/padel|pádel/.test(combined)) return 'Pádel'
  return 'Fútbol 5'
}

export function resolveCourtDimensions(field: Partial<Field>): string {
  const sportLabel = resolveCourtSportLabel(field)
  const standard = STANDARD_DIMENSIONS_BY_TYPE[sportLabel] ?? '30 × 18 mts'
  const raw = (field.dimensions ?? '').trim()
  if (!raw) return standard

  const isDefaultF5 = /^30\s*[x×]\s*18/i.test(raw)
  if (sportLabel !== 'Fútbol 5' && isDefaultF5) {
    return standard
  }
  const isLargerDefault = /^(50|70|90|100)\s*[x×]\s*(30|45|60|65|70)/i.test(raw)
  if (sportLabel === 'Fútbol 5' && isLargerDefault) {
    return standard
  }
  return raw
}

export function resolveCourtSurface(field: Partial<Field>): string {
  const rawType = (field.type ?? '').trim()
  if (rawType && !/^f[uú]tbol\s*(5|7|9|11)$/i.test(rawType)) {
    return rawType
  }
  return field.features?.[0] || 'Sintético FIFA Pro'
}

const DEFAULT_WEBP_COURTS = [
  '/images/canchas/cancha-alpha.webp',
  '/images/canchas/cancha-beta.webp',
  '/images/canchas/cancha-delta.webp',
]

export function resolveCourtImage(field: Partial<Field>, index = 0): string {
  const rawUrl = (field.imageUrl ?? '').trim()
  if (rawUrl.startsWith('data:image/') || rawUrl.startsWith('blob:')) {
    return rawUrl
  }
  if (
    rawUrl.length > 0 &&
    !rawUrl.includes('/images/canchas/indoor.') &&
    !rawUrl.includes('/images/canchas/techada.') &&
    !rawUrl.includes('/images/canchas/nocturna.')
  ) {
    return rawUrl.replace(/\.(jpe?g|png)$/i, '.webp')
  }

  const name = (field.name ?? '').toLowerCase()
  const type = (field.type ?? '').toLowerCase()
  const sportLabel = resolveCourtSportLabel(field)
  const isCovered =
    field.isCovered ?? /techad|indoor|cubiert|climat|beta/.test(`${name} ${type}`)

  if (sportLabel === 'Fútbol 11' || name.includes('delta')) {
    return '/images/canchas/cancha-delta.webp'
  }
  if (isCovered || name.includes('beta')) {
    return '/images/canchas/cancha-beta.webp'
  }
  if (name.includes('alpha')) {
    return '/images/canchas/cancha-alpha.webp'
  }
  return DEFAULT_WEBP_COURTS[index % DEFAULT_WEBP_COURTS.length]
}

export type SlotKind = 'libre' | 'torneo' | 'confirmada' | 'pendiente' | 'mantenimiento'

export interface GridSlot {
  start: string
  end: string
  label: string
  kind: SlotKind
  isPeak?: boolean
  booking?: Booking
}

export function isPeakSlot(dateKey: string, startTime: string): boolean {
  if (!dateKey) return false
  const [year, month, day] = dateKey.split('-').map(Number)
  const d = new Date(year, month - 1, day)
  const dayOfWeek = d.getDay()
  if (dayOfWeek === 0 || dayOfWeek === 6) return true // Fines de semana
  const hour = parseInt(startTime.slice(0, 2), 10)
  return hour >= 19
}

const START_HOUR = 9
const END_HOUR = 22

function pad(hour: number): string {
  return `${hour}`.padStart(2, '0')
}

function overlaps(slotStart: string, slotEnd: string, booking: Booking): boolean {
  return (
    booking.status !== 'cancelada' && booking.startTime < slotEnd && slotStart < booking.endTime
  )
}

export function buildSlots(bookings: Booking[]): GridSlot[] {
  const slots: GridSlot[] = []
  for (let hour = START_HOUR; hour < END_HOUR; hour++) {
    const start = `${pad(hour)}:00`
    const end = `${pad(hour + 1)}:00`
    const found = bookings.filter((booking) => overlaps(start, end, booking))

    let kind: SlotKind = 'libre'
    let booking: Booking | undefined
    if (found.length > 0) {
      const mantenimiento = found.find((item) => item.type === 'mantenimiento')
      const torneo = found.find((item) => item.type === 'torneo')
      const confirmada = found.find((item) => item.status === 'confirmada')
      if (mantenimiento !== undefined) {
        kind = 'mantenimiento'
        booking = mantenimiento
      } else if (torneo !== undefined) {
        kind = 'torneo'
        booking = torneo
      } else if (confirmada !== undefined) {
        kind = 'confirmada'
        booking = confirmada
      } else {
        kind = 'pendiente'
        booking = found[0]
      }
    }

    slots.push({ start, end, label: `${start} – ${end}`, kind, booking })
  }
  return slots
}