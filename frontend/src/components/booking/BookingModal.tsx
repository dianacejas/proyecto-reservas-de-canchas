import { Button, Chip, Modal } from '@heroui/react'
import { useState } from 'react'
import type { Field } from '../../types'
import type { GridSlot } from '../../utils/slots'
import { formatLong } from '../../utils/date'
import { DEPOSIT_PERCENT, depositFor, formatCurrency } from '../../utils/payments'
import { getErrorMessage } from '../../api/client'
import { CalendarIcon, ClockIcon, QrCodeIcon, StadiumIcon, UsersIcon } from '../common/Icons'
import { TextInput } from '../common/fields'

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
      <Modal.Backdrop variant="blur" />
      <Modal.Container size="md">
        <Modal.Dialog>
          <Modal.Header>
            <Modal.Heading>Nueva reserva</Modal.Heading>
            <Modal.CloseTrigger />
          </Modal.Header>
          <Modal.Body>
            <div className="space-y-3">
              {/* Ticket Deportivo Troquelado (Boarding Pass) */}
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-800/70">
                <div className="flex items-center justify-between bg-neutral-950 px-4 py-3 text-white">
                  <div className="flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-[#c5d86d]/20 text-[#c5d86d]">
                      <StadiumIcon className="size-4" />
                    </span>
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-widest text-[#c5d86d]">
                        Pase Oficial de Turno
                      </span>
                      <span className="text-sm font-black">{field.name}</span>
                    </div>
                  </div>
                  <QrCodeIcon className="size-6 text-[#c5d86d]" />
                </div>

                <div className="grid grid-cols-2 gap-3 px-4 py-3 text-xs">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="size-4 text-neutral-400" />
                    <div>
                      <span className="block text-[10px] uppercase text-neutral-400">
                        Fecha
                      </span>
                      <span className="font-bold capitalize text-white">
                        {formatLong(date)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ClockIcon className="size-4 text-neutral-400" />
                    <div>
                      <span className="block text-[10px] uppercase text-neutral-400">
                        Horario
                      </span>
                      <span className="font-mono font-bold text-white">
                        {slot.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Línea troquelada con recortes laterales */}
                <div className="relative flex items-center justify-between px-2">
                  <span className="-ml-4 size-5 rounded-full border border-white/10 bg-neutral-900" />
                  <div className="w-full border-t border-dashed border-white/15" />
                  <span className="-mr-4 size-5 rounded-full border border-white/10 bg-neutral-900" />
                </div>

                {slot.kind === 'libre' && (
                  <div className="grid grid-cols-3 gap-2 px-4 py-3 text-center">
                    <div className="rounded-xl p-2 bg-neutral-900/80">
                      <span className="block text-[10px] font-semibold uppercase text-neutral-400">
                        Total Cancha
                      </span>
                      <span className="text-sm font-black text-white">
                        {formatCurrency(field.pricePerHour)}
                      </span>
                    </div>
                    <div className="rounded-xl border border-[#c5d86d]/40 bg-[#c5d86d]/15 p-2">
                      <span className="block text-[10px] font-bold uppercase text-[#c5d86d]">
                        Seña {DEPOSIT_PERCENT}%
                      </span>
                      <span className="text-sm font-black text-[#c5d86d]">
                        {formatCurrency(depositFor(field.pricePerHour))}
                      </span>
                    </div>
                    <div className="rounded-xl p-2 bg-neutral-900/80">
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase text-neutral-400">
                        <UsersIcon className="size-3" />÷ 10 Jug.
                      </span>
                      <span className="block text-sm font-black text-white">
                        {formatCurrency(Math.round(field.pricePerHour / 10))}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <TextInput
                label="Nombre y apellido"
                value={name}
                onValueChange={setName}
                placeholder="Ej: Juan Pérez"
              />

              <div className="space-y-1.5">
                <TextInput
                  label="Teléfono"
                  type="tel"
                  value={phone}
                  onValueChange={setPhone}
                  placeholder="Ej: 11 5555 1234"
                />
                <p className="text-xs text-neutral-400">
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
          <Modal.Footer className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" className="min-h-11 w-full sm:w-auto" onPress={onClose}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              className="min-h-11 w-full sm:w-auto"
              isDisabled={!canSubmit}
              onPress={handleSubmit}
            >
              {isSubmitting ? 'Enviando…' : 'Solicitar reserva'}
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Root>
  )
}