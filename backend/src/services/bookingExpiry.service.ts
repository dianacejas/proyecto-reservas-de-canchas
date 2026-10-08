import { Booking, Match } from '../models/index.js'

const SWEEP_INTERVAL_MS = 60_000

export async function cancelExpiredPendingBookings(now: Date = new Date()): Promise<number> {
  const expired = await Booking.find({
    status: 'pendiente',
    expiresAt: { $ne: null, $lte: now },
  }).select('_id')

  if (expired.length === 0) return 0

  const ids = expired.map((booking) => booking._id)
  await Match.updateMany({ bookingId: { $in: ids } }, { $set: { bookingId: null } })
  const result = await Booking.updateMany(
    { _id: { $in: ids } },
    { $set: { status: 'cancelada', expiresAt: null } }
  )

  return result.modifiedCount
}

export function startBookingExpirySweeper(): () => void {
  const timer = setInterval(() => {
    cancelExpiredPendingBookings().catch((error) => {
      console.error('No se pudieron expirar las reservas pendientes:', error)
    })
  }, SWEEP_INTERVAL_MS)

  timer.unref()

  return () => clearInterval(timer)
}
