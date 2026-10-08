import { env } from '../config/env.js'
import { Booking, Field, Payment, type PaymentDoc } from '../models/index.js'
import { AppError } from '../utils/AppError.js'
import { assertFound } from '../utils/assertFound.js'

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

export async function confirmSandboxPayment(paymentId: string): Promise<PaymentDoc> {
  const payment = assertFound(await Payment.findById(paymentId), 'Pago no encontrado')
  if (payment.status === 'pagado') return payment
  if (payment.provider !== 'sandbox') {
    throw new AppError(400, 'Este pago no pertenece al proveedor sandbox')
  }
  if (payment.status === 'cancelado' || payment.status === 'fallido') {
    throw new AppError(409, 'El pago ya no está vigente')
  }

  payment.status = 'pagado'
  await payment.save()
  await Booking.updateOne(
    { _id: payment.bookingId },
    { $set: { status: 'confirmada', expiresAt: null } }
  )
  return payment
}

export async function getPaymentInfo(paymentId: string): Promise<PaymentDoc> {
  return assertFound(await Payment.findById(paymentId), 'Pago no encontrado')
}