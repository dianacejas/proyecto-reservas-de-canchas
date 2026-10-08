import type { Booking } from '../types'
import { bookingDay, formatLong } from './date'

const COPA5_MAPS_URL = 'https://www.google.com/maps/search/?api=1&query=Copa+5+Complejo+Deportivo+C%C3%B3rdoba'
const PLAYERS_PER_TEAM = 10

export interface ShareBookingInput {
  fieldName: string
  dateKey: string
  startTime: string
  endTime: string
  totalAmount: number
}

export function resolveFieldName(booking: Booking, fallback = 'Cancha'): string {
  return typeof booking.fieldId === 'string' ? fallback : booking.fieldId.name
}

export function buildMatchShareMessage(input: ShareBookingInput): string {
  const dateLabel = `${formatLong(input.dateKey)} · ${input.startTime} a ${input.endTime}`
  const perHead = Math.round(input.totalAmount / PLAYERS_PER_TEAM)
  return [
    '⚽ *¡Partido confirmado en Copa 5!*',
    `📍 Cancha: ${input.fieldName}`,
    `📅 Fecha: ${dateLabel}`,
    `💵 Cuánto pone cada uno: $${perHead} por cabeza.`,
    `🗺️ Ubicación: ${COPA5_MAPS_URL}`,
  ].join('\n')
}

export function buildShareWhatsAppUrl(booking: Booking, fieldName: string): string {
  const message = buildMatchShareMessage({
    fieldName,
    dateKey: bookingDay(booking.date),
    startTime: booking.startTime,
    endTime: booking.endTime,
    totalAmount: booking.totalAmount,
  })
  return `https://wa.me/?text=${encodeURIComponent(message)}`
}
