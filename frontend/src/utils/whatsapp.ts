import type { Booking } from '../types'
import { bookingDay } from './date'

const COPA5_MAPS_URL = 'https://www.google.com/maps/search/?api=1&query=Copa+5+Complejo+Deportivo+C%C3%B3rdoba'
const PLAYERS_PER_TEAM = 10

export interface ShareBookingInput {
  fieldName: string
  dateKey: string
  startTime: string
  endTime: string
  totalAmount: number
  depositAmount?: number
  remainingBalance?: number
}

export function resolveFieldName(booking: Booking, fallback = 'Cancha'): string {
  return typeof booking.fieldId === 'string' ? fallback : booking.fieldId.name
}

export function buildMatchShareMessage(input: ShareBookingInput): string {
  // Formato de fecha DD/MM/AAAA
  let formattedDate = input.dateKey
  if (/^\d{4}-\d{2}-\d{2}$/.test(input.dateKey)) {
    const [y, m, d] = input.dateKey.split('-')
    formattedDate = `${d}/${m}/${y}`
  }

  const remaining = input.remainingBalance ?? (input.totalAmount - (input.depositAmount ?? 0))
  const deposit = input.depositAmount ?? 0
  const perPerson = Math.round(remaining / PLAYERS_PER_TEAM)

  const lines = [
    '⚽ ¡Hay partido en Copa 5!',
    `📅 Fecha: ${formattedDate}`,
    `⏰ Horario: ${input.startTime} hs`,
    `🏟️ Cancha: ${input.fieldName}`,
    `📍 Ubicación: ${COPA5_MAPS_URL}`,
    `💰 Seña pagada: $${deposit.toLocaleString('es-AR')} | Saldo en cancha: $${remaining.toLocaleString('es-AR')} ($${perPerson.toLocaleString('es-AR')}/jugador)`,
    '¡Confirmen asistencia!',
  ]

  return lines.join('\n')
}

export function buildShareWhatsAppUrl(booking: Booking, fieldName: string): string {
  const message = buildMatchShareMessage({
    fieldName,
    dateKey: bookingDay(booking.date),
    startTime: booking.startTime,
    endTime: booking.endTime,
    totalAmount: booking.totalAmount,
    depositAmount: booking.depositAmount,
    remainingBalance: booking.remainingBalance,
  })
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`
}