import type { Response } from 'express'

export interface BookingStreamEvent {
  courtId: string
  date: string
  timeSlot: string
  status: string
}

const subscribers = new Set<Response>()

export function subscribeBookingStream(res: Response): () => void {
  subscribers.add(res)
  return () => {
    subscribers.delete(res)
  }
}

export function broadcastBookingStream(event: BookingStreamEvent): void {
  const payload = `data: ${JSON.stringify(event)}\n\n`
  for (const client of subscribers) {
    try {
      client.write(payload)
    } catch {
      subscribers.delete(client)
    }
  }
}
