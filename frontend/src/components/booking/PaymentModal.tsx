import { Button, Modal } from '@heroui/react'
import { useState } from 'react'
import type { Booking, PaymentType } from '../../types'
import { bookingDay, formatLong } from '../../utils/date'
import { DEPOSIT_PERCENT, depositFor, formatCurrency } from '../../utils/payments'

interface PaymentModalProps {
  booking: Booking
  fieldName: string
  isSubmitting: boolean
  onConfirm: (paymentType: PaymentType) => void
  onClose: () => void
}

const OPTION_CLASS =
  'w-full cursor-pointer rounded-xl border-2 p-4 text-left transition-all duration-200'
const OPTION_ACTIVE =
  'border-lime bg-lime/10 shadow-[0_0_24px_-12px_rgba(197,216,109,0.8)]'
const OPTION_IDLE = 'border-line bg-cream hover:border-mauve/50 dark:border-mauve dark:bg-coffee-elev'

export default function PaymentModal({
  booking,
  fieldName,
  isSubmitting,
  onConfirm,
  onClose,
}: PaymentModalProps): React.JSX.Element {
  const [paymentType, setPaymentType] = useState<PaymentType>('deposit')

  const total = booking.totalAmount
  const deposit = depositFor(total)
  const amount = paymentType === 'deposit' ? deposit : total
  const remaining = total - amount

  return (
    <Modal.Root isOpen onOpenChange={(open) => open || onClose()}>
      <Modal.Backdrop variant="blur" />
      <Modal.Container size="md">
        <Modal.Dialog>
          <Modal.Header>
            <Modal.Heading>Pagar reserva</Modal.Heading>
            <Modal.CloseTrigger />
          </Modal.Header>
          <Modal.Body>
            <div className="space-y-4">
              <div className="rounded-lg border border-line bg-paper/70 px-3 py-2 text-sm dark:border-mauve dark:bg-mauve-deep/60">
                <p className="font-semibold text-coffee dark:text-[#f3efe8]">
                  {fieldName} · {formatLong(bookingDay(booking.date))}
                </p>
                <p className="text-tertiary dark:text-mauve-soft">
                  {booking.startTime} a {booking.endTime} · Total {formatCurrency(total)}
                </p>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setPaymentType('deposit')}
                  className={`${OPTION_CLASS} ${paymentType === 'deposit' ? OPTION_ACTIVE : OPTION_IDLE}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-coffee dark:text-[#f3efe8]">
                      Seña {DEPOSIT_PERCENT}%
                    </span>
                    <span className="font-semibold text-coffee dark:text-lime">
                      {formatCurrency(deposit)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-tertiary dark:text-mauve-soft">
                    Reservás el turno y el saldo de {formatCurrency(total - deposit)} se paga en
                    mostrador.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentType('full')}
                  className={`${OPTION_CLASS} ${paymentType === 'full' ? OPTION_ACTIVE : OPTION_IDLE}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-coffee dark:text-[#f3efe8]">
                      Pago total
                    </span>
                    <span className="font-semibold text-coffee dark:text-lime">
                      {formatCurrency(total)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-tertiary dark:text-mauve-soft">
                    Sin saldo pendiente. Quedás al día con la cancha.
                  </p>
                </button>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-line bg-cream px-3 py-2 text-sm dark:border-mauve dark:bg-coffee-elev">
                <span className="text-tertiary dark:text-mauve-soft">Saldo a pagar en cancha</span>
                <span className="font-semibold text-coffee dark:text-[#f3efe8]">
                  {formatCurrency(remaining)}
                </span>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" className="min-h-11 w-full sm:w-auto" onPress={onClose}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              className="min-h-11 w-full sm:w-auto"
              isDisabled={isSubmitting}
              onPress={() => onConfirm(paymentType)}
            >
              {isSubmitting ? 'Procesando…' : `Pagar ${formatCurrency(amount)}`}
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Root>
  )
}
