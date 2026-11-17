import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockFieldFindOne, mockBookingFindOne, mockBookingCreate } = vi.hoisted(() => ({
  mockFieldFindOne: vi.fn(),
  mockBookingFindOne: vi.fn(),
  mockBookingCreate: vi.fn(),
}))

vi.mock('../config/env.js', () => ({
  env: {
    PENDING_TTL_MINUTES: 15,
  },
}))

vi.mock('../models/index.js', () => ({
  Field: {
    findOne: mockFieldFindOne,
  },
  Booking: {
    findOne: mockBookingFindOne,
    create: mockBookingCreate,
  },
  Match: {},
  User: {},
}))

import { AppError } from '../utils/AppError.js'
import { createPublicBooking, isPeakTime, resolveFieldPricePerHour } from './booking.service.js'

describe('Servicio de Reservas (Tarifas y Concurrencia)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Resolución de tarifa estándar y pico', () => {
    const fieldPricing = {
      pricePerHour: 12_000,
      standardPricePerHour: 10_000,
      peakPricePerHour: 15_000,
      peakHours: ['19:00', '20:00', '21:00'],
    }

    it('detecta horario pico a partir de las 19:00 en días hábiles', () => {
      const wednesday = new Date('2026-11-18T00:00:00.000Z')
      expect(isPeakTime(wednesday, '17:00', fieldPricing.peakHours)).toBe(false)
      expect(isPeakTime(wednesday, '19:00', fieldPricing.peakHours)).toBe(true)
      expect(isPeakTime(wednesday, '22:00', fieldPricing.peakHours)).toBe(true)
    })

    it('aplica horario pico todo el día en fines de semana', () => {
      const saturday = new Date('2026-11-21T00:00:00.000Z')
      expect(isPeakTime(saturday, '14:00', fieldPricing.peakHours)).toBe(true)
    })

    it('resuelve el precio por hora según franja y día', () => {
      const wednesday = new Date('2026-11-18T00:00:00.000Z')
      const sunday = new Date('2026-11-22T00:00:00.000Z')

      expect(resolveFieldPricePerHour(fieldPricing, wednesday, '16:00')).toBe(10_000)
      expect(resolveFieldPricePerHour(fieldPricing, wednesday, '20:00')).toBe(15_000)
      expect(resolveFieldPricePerHour(fieldPricing, sunday, '15:00')).toBe(15_000)
    })
  })

  describe('createPublicBooking (validación de disponibilidad y race conditions)', () => {
    const baseInput = {
      fieldId: 'field-1',
      date: new Date('2026-11-18T00:00:00.000Z'),
      startTime: '20:00',
      endTime: '21:00',
      clientInfo: { name: 'Juan Pérez', phone: '3511234567' },
    }

    it('lanza 404 si la cancha no existe o está inactiva', async () => {
      mockFieldFindOne.mockResolvedValue(null)

      await expect(createPublicBooking(baseInput)).rejects.toMatchObject({
        statusCode: 404,
      })
      expect(mockBookingCreate).not.toHaveBeenCalled()
    })

    it('lanza 409 si ya existe una reserva superpuesta en ese horario', async () => {
      mockFieldFindOne.mockResolvedValue({ _id: 'field-1', pricePerHour: 12_000 })
      mockBookingFindOne.mockResolvedValue({ _id: 'existing-booking' })

      await expect(createPublicBooking(baseInput)).rejects.toMatchObject({
        statusCode: 409,
        message: 'El horario solicitado ya se encuentra reservado',
      })
      expect(mockBookingCreate).not.toHaveBeenCalled()
    })

    it('convierte un error de índice único (11000) por concurrencia en AppError 409', async () => {
      mockFieldFindOne.mockResolvedValue({ _id: 'field-1', pricePerHour: 12_000 })
      mockBookingFindOne.mockResolvedValue(null)
      mockBookingCreate.mockRejectedValue({ code: 11000 })

      const promise = createPublicBooking(baseInput)
      await expect(promise).rejects.toBeInstanceOf(AppError)
      await expect(promise).rejects.toMatchObject({
        statusCode: 409,
        message: 'El horario solicitado ya se encuentra reservado',
      })
    })

    it('calcula totalAmount y remainingBalance server-side usando tarifa pico', async () => {
      mockFieldFindOne.mockResolvedValue({
        _id: 'field-1',
        pricePerHour: 12_000,
        standardPricePerHour: 10_000,
        peakPricePerHour: 16_000,
      })
      mockBookingFindOne.mockResolvedValue(null)
      mockBookingCreate.mockImplementation(async (doc) => doc)

      const created = await createPublicBooking(baseInput)
      expect(created).toMatchObject({
        fieldId: 'field-1',
        status: 'pendiente',
        totalAmount: 16_000,
        depositAmount: 0,
        remainingBalance: 16_000,
      })
    })
  })
})
