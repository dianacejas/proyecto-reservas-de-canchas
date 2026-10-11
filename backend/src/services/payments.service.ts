import { env } from '../config/env.js'
import { Booking, Field, Payment, type PaymentDoc } from '../models/index.js'
import { AppError } from '../utils/AppError.js'
import { assertFound } from '../utils/assertFound.js'
import { sendBookingConfirmationEmail } from './email.service.js'

export type PaymentType = 'deposit' | 'full'

export interface CheckoutResult {
  provider: 'sandbox' | 'mercadopago'
  paymentId: string
  checkoutUrl: string | null
  amount: number
  paymentType: PaymentType
  totalAmount: number
  depositAmount: number
  remainingBalance: number
  depositPercent: number
}

function slotTotal(pricePerHour: number, startTime: string, endTime: string): number {
  const [startHour, startMinute] = startTime.split(':').map(Number)
  const [endHour, endMinute] = endTime.split(':').map(Number)
  const hours = Math.max((endHour * 60 + endMinute - (startHour * 60 + startMinute)) / 60, 0)
  return Math.round(pricePerHour * hours)
}

async function bookingTotal(booking: { fieldId: unknown; startTime: string; endTime: string }): Promise<number> {
  const field = await Field.findOne({ _id: booking.fieldId, isActive: true })
  if (!field) throw new AppError(404, 'La cancha asociada no está disponible')
  return slotTotal(field.pricePerHour, booking.startTime, booking.endTime)
}

async function createMercadoPagoPreference(amount: number, paymentId: string): Promise<{ id: string; init_point: string }> {
  if (!env.MERCADO_PAGO_ACCESS_TOKEN) {
    throw new AppError(503, 'Pagos con Mercado Pago no configurados: falta MERCADO_PAGO_ACCESS_TOKEN')
  }

  const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.MERCADO_PAGO_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      items: [
        {
          title: 'Reserva de cancha de fútbol 5',
          quantity: 1,
          unit_price: amount,
          currency_id: 'ARS',
        },
      ],
      external_reference: paymentId,
      auto_return: 'approved',
      back_urls: {
        success: `${env.WEB_BASE_URL}/pago/ok`,
        pending: `${env.WEB_BASE_URL}/pago/pendiente`,
        failure: `${env.WEB_BASE_URL}/pago/error`,
      },
    }),
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new AppError(502, 'Mercado Pago rechazó la preferencia', detail)
  }

  const data = (await response.json()) as { id?: string; init_point?: string }
  if (!data.id || !data.init_point) {
    throw new AppError(502, 'Respuesta inesperada de Mercado Pago')
  }
  return { id: data.id, init_point: data.init_point }
}

export async function createCheckout(
  bookingId: string,
  paymentType: PaymentType = 'full'
): Promise<CheckoutResult> {
  const booking = assertFound(await Booking.findById(bookingId), 'Reserva no encontrada')

  if (booking.status === 'cancelada') throw new AppError(409, 'La reserva está cancelada')
  if (booking.type === 'torneo') {
    throw new AppError(409, 'Las reservas de torneo no se pagan por este medio')
  }
  if (booking.status === 'confirmada') {
    throw new AppError(409, 'La reserva ya está confirmada')
  }

  const existingPaid = await Payment.findOne({ bookingId: booking._id, status: 'pagado' })
  if (existingPaid) {
    throw new AppError(409, 'La reserva ya tiene un pago registrado')
  }

  const totalAmount = await bookingTotal(booking)
  const depositAmount =
    paymentType === 'deposit' ? Math.round((totalAmount * env.DEPOSIT_PERCENT) / 100) : totalAmount
  const remainingBalance = totalAmount - depositAmount
  const amount = depositAmount

  booking.set({ totalAmount, depositAmount, remainingBalance, paymentType })
  await booking.save()

  const payment = await Payment.create({
    bookingId,
    provider: env.PAYMENT_PROVIDER,
    amount,
    paymentType,
  })

  const result = {
    paymentId: payment._id.toString(),
    amount,
    paymentType,
    totalAmount,
    depositAmount,
    remainingBalance,
    depositPercent: env.DEPOSIT_PERCENT,
  }

  if (env.PAYMENT_PROVIDER === 'sandbox') {
    return {
      ...result,
      provider: 'sandbox',
      checkoutUrl: `${env.WEB_BASE_URL}/pago/sandbox/${payment._id.toString()}/confirmar`,
    }
  }

  const preference = await createMercadoPagoPreference(amount, payment._id.toString())
  await Payment.updateOne({ _id: payment._id }, { $set: { externalId: preference.id } })
  return {
    ...result,
    provider: 'mercadopago',
    checkoutUrl: preference.init_point,
  }
}

/**
 * Marca el pago como pagado, confirma la reserva y dispara el comprobante por
 * email. Los llamadores verifican antes que el pago no esté ya en un estado
 * terminal para no reenviar el email.
 */
async function settlePayment(payment: Pick<PaymentDoc, 'bookingId' | '_id'>): Promise<void> {
  await Payment.updateOne({ _id: payment._id }, { $set: { status: 'pagado' } })
  await Booking.updateOne(
    { _id: payment.bookingId },
    { $set: { status: 'confirmada', expiresAt: null } }
  )
  // Fire-and-forget: el envío del email nunca debe bloquear ni romper el pago.
  void sendBookingConfirmationEmail(payment.bookingId.toString())
}

export async function confirmSandboxPayment(paymentId: string): Promise<PaymentDoc> {
  const payment = assertFound(await Payment.findById(paymentId), 'Pago no encontrado')
  if (payment.status === 'pagado') return payment
  if (payment.provider !== 'sandbox') {
    throw new AppError(400, 'Este pago no pertenece al proveedor sandbox')
  }
  if (payment.status === 'cancelado' || payment.status === 'fallido') {
    throw new AppError(409, 'El pago ya no está vigente')
  }

  await settlePayment(payment)
  return payment
}

export interface MercadoPagoPayment {
  id: number | string
  status: string
  external_reference: string | null
}

export async function fetchMercadoPagoPayment(paymentId: string): Promise<MercadoPagoPayment> {
  if (!env.MERCADO_PAGO_ACCESS_TOKEN) {
    throw new AppError(503, 'Pagos con Mercado Pago no configurados: falta MERCADO_PAGO_ACCESS_TOKEN')
  }

  const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${env.MERCADO_PAGO_ACCESS_TOKEN}` },
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new AppError(502, 'Mercado Pago rechazó la consulta del pago', detail)
  }

  return (await response.json()) as MercadoPagoPayment
}

/**
 * Confirma el pago recibido por webhook a partir de la referencia externa que
 * guardamos en la preferencia (el `_id` de nuestro Payment). Devuelve null si
 * el pago no está aprobado o no lo reconocemos.
 */
export async function confirmMercadoPagoPayment(
  mercadoPagoPayment: MercadoPagoPayment
): Promise<PaymentDoc | null> {
  if (mercadoPagoPayment.status !== 'approved') return null

  const reference = mercadoPagoPayment.external_reference
  if (!reference || !/^[0-9a-fA-F]{24}$/.test(reference)) return null

  const payment = await Payment.findById(reference)
  if (!payment) return null
  if (payment.status === 'pagado') return payment
  if (payment.status === 'cancelado' || payment.status === 'fallido') return null

  await settlePayment(payment)
  return payment
}

export async function getPaymentInfo(paymentId: string): Promise<PaymentDoc> {
  return assertFound(await Payment.findById(paymentId), 'Pago no encontrado')
}