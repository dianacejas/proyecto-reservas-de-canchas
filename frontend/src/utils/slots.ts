import type { Booking } from '../types'

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