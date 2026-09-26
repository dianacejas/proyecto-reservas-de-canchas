import type { Booking } from '../types'

export type SlotKind = 'libre' | 'torneo' | 'confirmada' | 'pendiente'

export interface GridSlot {
  start: string
  end: string
  label: string
  kind: SlotKind
  booking?: Booking
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
      const torneo = found.find((item) => item.type === 'torneo')
      const confirmada = found.find((item) => item.status === 'confirmada')
      if (torneo !== undefined) {
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