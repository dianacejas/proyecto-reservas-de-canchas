import { Button, Chip, Modal } from '@heroui/react'
import { useState } from 'react'
import type { Field } from '../../types'
import type { GridSlot } from '../../utils/slots'
import { formatLong } from '../../utils/date'
import { getErrorMessage } from '../../api/client'

export interface BookingFormPayload {
  clientInfo: { name: string; phone: string }
}

interface BookingModalProps {
  field: Field
  date: string
  slot: GridSlot
  isSubmitting: boolean
  onSubmit: (payload: BookingFormPayload) => Promise<void>
  onClose: () => void
}

const INFO_ROW =
  'flex items-center justify-between gap-3 rounded-lg border border-line bg-paper/70 px-3 py-2 dark:border-mauve dark:bg-mauve-deep/60'
const INFO_LABEL = 'text-tertiary dark:text-mauve-soft'
const INFO_VALUE = 'font-medium capitalize text-coffee dark:text-[#f3efe8]'

export default function BookingModal({
  field,
  date,
  slot,
  isSubmitting,
  onSubmit,
  onClose,
}: BookingModalProps): React.JSX.Element {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)

  const canSubmit = name.trim().length > 0 && phone.trim().length >= 6 && !isSubmitting

  async function handleSubmit(): Promise<void> {
    setError(null)
    try {
      await onSubmit({ clientInfo: { name: name.trim(), phone: phone.trim() } })
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  return (
    <Modal.Root isOpen onOpenChange={(open) => open || onClose()}>
      <Modal.Backdrop />
      <Modal.Container>
        <Modal.Dialog>
          <Modal.Header>
            <Modal.Heading>Nueva reserva</Modal.Heading>
            <Modal.CloseTrigger />
          </Modal.Header>
          <Modal.Body>
            <div className="space-y-3">
              <div className="grid gap-2 text-sm">
                <div className={INFO_ROW}>
                  <span className={INFO_LABEL}>Cancha</span>
                  <span className={INFO_VALUE}>{field.name}</span>
                </div>
                <div className={INFO_ROW}>
                  <span className={INFO_LABEL}>Fecha</span>
                  <span className={INFO_VALUE}>{formatLong(date)}</span>
                </div>
                <div className={INFO_ROW}>
                  <span className={INFO_LABEL}>Horario</span>
                  <span className={INFO_VALUE}>{slot.label}</span>
                </div>
                {slot.kind === 'libre' && (
                  <div className={INFO_ROW}>
                    <span className={INFO_LABEL}>Total estimado</span>
                    <span className="font-semibold text-coffee dark:text-lime">${field.pricePerHour}</span>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-coffee/80 dark:text-mauve-soft" htmlFor="bk-name">
                  Nombre y apellido
                </label>
                <input
                  id="bk-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Ej: Juan Pérez"
                  className="w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-coffee outline-none transition-colors focus:border-lime dark:border-mauve dark:bg-coffee-elev dark:text-[#f3efe8]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-coffee/80 dark:text-mauve-soft" htmlFor="bk-phone">
                  Teléfono
                </label>
                <input
                  id="bk-phone"
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="Ej: 11 5555 1234"
                  className="w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-coffee outline-none transition-colors focus:border-lime dark:border-mauve dark:bg-coffee-elev dark:text-[#f3efe8]"
                />
                <p className="text-xs text-tertiary dark:text-mauve-soft">
                  La reserva queda en estado pendiente hasta que la confirme la administración.
                </p>
              </div>

              {error !== null && (
                <Chip color="danger" size="sm" className="h-auto py-1">
                  {error}
                </Chip>
              )}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onPress={onClose}>
              Cancelar
            </Button>
            <Button variant="primary" isDisabled={!canSubmit} onPress={handleSubmit}>
              {isSubmitting ? 'Enviando…' : 'Solicitar reserva'}
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Root>
  )
}