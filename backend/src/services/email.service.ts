import nodemailer, { type Transporter } from 'nodemailer'
import { env } from '../config/env.js'
import { Booking, Field, Payment, User } from '../models/index.js'

/**
 * Reglas de convivencia del complejo que se incluyen en el comprobante.
 */
const HOUSE_RULES = [
  'Llegá 10 minutos antes de tu turno para entrar en calor.',
  'Usá calzado apto para césped sintético (sin tapones de metal).',
  'El respeto entre jugadores y con el personal del complejo es obligatorio.',
  'Está prohibido ingresar con bebidas alcohólicas o en estado de ebriedad.',
  'No se permite fumar dentro del predio.',
  'Cuidá las instalaciones: los daños intencionales se cobran al responsable.',
  `La seña no es reembolsable; podés reprogramar con ${env.CANCEL_WINDOW_HOURS} horas de anticipación.`,
]

let cachedTransporter: Transporter | null | undefined

function getTransporter(): Transporter | null {
  if (cachedTransporter !== undefined) return cachedTransporter

  if (!env.SMTP_HOST) {
    cachedTransporter = null
    return null
  }

  cachedTransporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth:
      env.SMTP_USER !== undefined && env.SMTP_PASS !== undefined
        ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
        : undefined,
  })
  return cachedTransporter
}

export function isEmailEnabled(): boolean {
  return getTransporter() !== null
}

/** Código corto y legible para el cliente, derivado del _id de la reserva. */
export function bookingCode(bookingId: string): string {
  return `C5-${bookingId.slice(-6).toUpperCase()}`
}

function formatDate(date: Date): string {
  const key = date.toISOString().slice(0, 10)
  const safe = new Date(`${key}T12:00:00.000Z`)
  return new Intl.DateTimeFormat('es-AR', {
    timeZone: 'UTC',
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(safe)
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount)
}

async function resolveRecipient(userId: string | undefined): Promise<string | null> {
  if (!userId) return null
  const user = await User.findById(userId).select('email')
  return user?.email ?? null
}

function buildHtml(params: {
  code: string
  name: string
  fieldName: string
  dateLabel: string
  timeLabel: string
  amountLabel: string
  amount: number
  balance: number
}): string {
  const rules = HOUSE_RULES.map((rule) => `<li style="margin:4px 0">${rule}</li>`).join('')
  const balanceRow =
    params.balance > 0
      ? `<tr><td style="padding:6px 0;color:#8a7d73">Saldo a abonar en cancha</td><td style="padding:6px 0;text-align:right;font-weight:700;color:#1a090d">${formatCurrency(params.balance)}</td></tr>`
      : ''

  return `<!doctype html>
<html lang="es">
  <body style="margin:0;background:#f6f1ea;font-family:Segoe UI,Arial,sans-serif;color:#1a090d">
    <div style="max-width:560px;margin:0 auto;padding:24px">
      <div style="background:#1a090d;border-radius:20px 20px 0 0;padding:28px 24px;text-align:center">
        <p style="margin:0;font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#c5d86d;font-weight:700">Copa 5 · Complejo Deportivo</p>
        <h1 style="margin:8px 0 0;font-size:24px;color:#f3efe8">¡Reserva confirmada!</h1>
      </div>
      <div style="background:#fdfbf8;border-radius:0 0 20px 20px;padding:24px">
        <p style="margin:0 0 16px;font-size:15px">Hola ${params.name}, tu turno quedó confirmado. Te dejamos el comprobante:</p>
        <div style="border:1px solid #e8dfd4;border-radius:14px;padding:16px;margin-bottom:20px">
          <p style="margin:0 0 12px;font-size:13px;letter-spacing:1px;text-transform:uppercase;color:#8a7d73">Código de reserva</p>
          <p style="margin:0 0 16px;font-size:22px;font-weight:800;color:#1a090d">${params.code}</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:6px 0;color:#8a7d73">Cancha</td><td style="padding:6px 0;text-align:right;font-weight:600">${params.fieldName}</td></tr>
            <tr><td style="padding:6px 0;color:#8a7d73">Fecha</td><td style="padding:6px 0;text-align:right;font-weight:600">${params.dateLabel}</td></tr>
            <tr><td style="padding:6px 0;color:#8a7d73">Horario</td><td style="padding:6px 0;text-align:right;font-weight:600">${params.timeLabel}</td></tr>
            <tr><td style="padding:6px 0;color:#8a7d73">${params.amountLabel}</td><td style="padding:6px 0;text-align:right;font-weight:700;color:#1a090d">${formatCurrency(params.amount)}</td></tr>
            ${balanceRow}
          </table>
        </div>
        <h2 style="margin:0 0 8px;font-size:15px;color:#1a090d">Reglas de convivencia</h2>
        <ul style="margin:0;padding-left:18px;font-size:14px;color:#52414c">${rules}</ul>
        <p style="margin:24px 0 0;font-size:13px;color:#8a7d73">Ante cualquier duda respondé este correo o escribinos por WhatsApp. ¡Que salga un buen partido!</p>
      </div>
    </div>
  </body>
</html>`
}

function buildText(params: {
  code: string
  name: string
  fieldName: string
  dateLabel: string
  timeLabel: string
  amountLabel: string
  amount: number
  balance: number
}): string {
  const lines = [
    '¡Reserva confirmada! — Copa 5',
    '',
    `Hola ${params.name}, tu turno quedó confirmado.`,
    '',
    `Código de reserva: ${params.code}`,
    `Cancha: ${params.fieldName}`,
    `Fecha: ${params.dateLabel}`,
    `Horario: ${params.timeLabel}`,
    `${params.amountLabel}: ${formatCurrency(params.amount)}`,
  ]
  if (params.balance > 0) lines.push(`Saldo a abonar en cancha: ${formatCurrency(params.balance)}`)
  lines.push('', 'Reglas de convivencia:')
  for (const rule of HOUSE_RULES) lines.push(`- ${rule}`)
  lines.push('', '¡Que salga un buen partido!')
  return lines.join('\n')
}

/**
 * Envía el comprobante de la reserva al cliente registrado. Nunca lanza: si el
 * envío falla (SMTP caído, sin email, etc.) solo deja registro en consola para
 * no afectar la confirmación del pago.
 */
export async function sendBookingConfirmationEmail(bookingId: string): Promise<void> {
  const transporter = getTransporter()
  if (transporter === null) {
    console.info(`[email] SMTP no configurado; se omite el comprobante de la reserva ${bookingId}`)
    return
  }

  try {
    const booking = await Booking.findById(bookingId)
    if (!booking) return

    const recipient = await resolveRecipient(booking.userId ? booking.userId.toString() : undefined)
    if (recipient === null) {
      console.info(`[email] La reserva ${bookingId} no tiene email asociado; se omite el comprobante`)
      return
    }

    const field = await Field.findById(booking.fieldId).select('name')
    const payment = await Payment.findOne({ bookingId: booking._id, status: 'pagado' }).sort({
      createdAt: -1,
    })

    const isDeposit = booking.paymentType === 'deposit'
    const params = {
      code: bookingCode(booking._id.toString()),
      name: booking.clientInfo?.name ?? 'jugador',
      fieldName: field?.name ?? 'Cancha',
      dateLabel: formatDate(booking.date),
      timeLabel: `${booking.startTime} a ${booking.endTime}`,
      amountLabel: isDeposit ? 'Seña abonada' : 'Total abonado',
      amount: payment?.amount ?? booking.depositAmount,
      balance: isDeposit ? booking.remainingBalance : 0,
    }

    await transporter.sendMail({
      from: env.MAIL_FROM,
      to: recipient,
      replyTo: env.MAIL_REPLY_TO,
      subject: `Reserva confirmada · ${params.code} · ${params.fieldName}`,
      text: buildText(params),
      html: buildHtml(params),
    })

    console.info(`[email] Comprobante ${params.code} enviado a ${recipient}`)
  } catch (error) {
    console.error(`[email] No se pudo enviar el comprobante de la reserva ${bookingId}:`, error)
  }
}
