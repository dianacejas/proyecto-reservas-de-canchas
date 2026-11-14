import { describe, expect, it } from 'vitest'
import {
  calculatePaymentBreakdown,
  calculateSlotHours,
  calculateSlotTotal,
} from './payments.service.js'

describe('Servicio de Pagos y Tarifas (Cálculos Puros)', () => {
  describe('Cálculo de franja horaria y precio total', () => {
    it('calcula correctamente la duración en horas para turnos de 60 minutos', () => {
      expect(calculateSlotHours('18:00', '19:00')).toBe(1)
      expect(calculateSlotHours('19:30', '20:30')).toBe(1)
    })

    it('calcula turnos fraccionados de 90 minutos (1.5 horas)', () => {
      expect(calculateSlotHours('18:00', '19:30')).toBe(1.5)
    })

    it('calcula el precio total según el valor horario de la cancha', () => {
      const pricePerHour = 120_000
      expect(calculateSlotTotal(pricePerHour, '18:00', '19:00')).toBe(120_000)
      expect(calculateSlotTotal(pricePerHour, '18:00', '19:30')).toBe(180_000)
      expect(calculateSlotTotal(pricePerHour, '20:00', '22:00')).toBe(240_000)
    })
  })

  describe('Cálculo de Señas y Saldos Restantes (Integridad)', () => {
    it('calcula la seña del 50% y el saldo restante exacto', () => {
      const totalAmount = 100_000
      const depositPercent = 50
      const result = calculatePaymentBreakdown(totalAmount, depositPercent, 'deposit')

      expect(result.amount).toBe(50_000)
      expect(result.depositAmount).toBe(50_000)
      expect(result.remainingBalance).toBe(50_000)
      expect(result.depositAmount + result.remainingBalance).toBe(totalAmount)
    })

    it('calcula la seña del 30% con redondeo matemático entero', () => {
      const totalAmount = 140_000
      const depositPercent = 30
      const result = calculatePaymentBreakdown(totalAmount, depositPercent, 'deposit')

      expect(result.amount).toBe(42_000)
      expect(result.depositAmount).toBe(42_000)
      expect(result.remainingBalance).toBe(98_000)
      expect(result.depositAmount + result.remainingBalance).toBe(totalAmount)
    })

    it('calcula pago total (full) sin saldo restante pendiente', () => {
      const totalAmount = 140_000
      const depositPercent = 30
      const result = calculatePaymentBreakdown(totalAmount, depositPercent, 'full')

      expect(result.amount).toBe(140_000)
      expect(result.depositAmount).toBe(140_000)
      expect(result.remainingBalance).toBe(0)
    })

    it('previene adulteración de montos asegurando suma exacta en valores impares', () => {
      const totalAmount = 125_555
      const depositPercent = 50
      const result = calculatePaymentBreakdown(totalAmount, depositPercent, 'deposit')

      expect(result.depositAmount + result.remainingBalance).toBe(totalAmount)
    })
  })
})
