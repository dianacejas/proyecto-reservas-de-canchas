import { z } from 'zod'

export const dateQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
})

export type DateQuery = z.infer<typeof dateQuerySchema>

export const metricsQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD').optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD').optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD').optional(),
})

export type MetricsQuery = z.infer<typeof metricsQuerySchema>

export const settleBookingSchema = z.object({
  method: z.enum(['efectivo', 'transferencia', 'debito']),
})

export type SettleBookingInput = z.infer<typeof settleBookingSchema>

export const addConsumptionSchema = z.object({
  name: z.string().trim().min(1, 'El nombre del producto es requerido'),
  quantity: z.number().int().min(1, 'La cantidad debe ser al menos 1'),
  unitPrice: z.number().min(0, 'El precio unitario no puede ser negativo'),
})

export type AddConsumptionInput = z.infer<typeof addConsumptionSchema>

export const blockCourtSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
  timeSlot: z.string().optional(),
  reason: z.enum(['mantenimiento', 'lluvia', 'otro']).default('mantenimiento'),
})

export type BlockCourtInput = z.infer<typeof blockCourtSchema>

export const unblockCourtSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
  timeSlot: z.string().optional(),
})

export type UnblockCourtInput = z.infer<typeof unblockCourtSchema>

export const exportReportQuerySchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD').optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato YYYY-MM-DD').optional(),
})

export type ExportReportQuery = z.infer<typeof exportReportQuerySchema>

