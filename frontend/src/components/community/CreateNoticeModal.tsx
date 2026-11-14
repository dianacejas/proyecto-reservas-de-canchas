import { Button, Chip, Modal } from '@heroui/react'
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createCommunityNotice } from '../../api'
import type { CommunityNoticeType, CreateCommunityNoticeInput } from '../../types'
import { SelectInput, TextInput } from '../common/fields'

interface CreateNoticeModalProps {
  isOpen: boolean
  onClose: () => void
}

const TYPE_OPTIONS = [
  { key: 'falta_uno', label: 'Falta 1 (Buscar jugador para completar equipo)' },
  { key: 'desafio_rival', label: 'Desafío (Buscar equipo rival para jugar)' },
]

const POSITION_OPTIONS = [
  { key: 'Cualquiera', label: 'Cualquiera' },
  { key: 'Arquero', label: 'Arquero' },
  { key: 'Defensor', label: 'Defensor' },
  { key: 'Mediocampista', label: 'Mediocampista' },
  { key: 'Delantero', label: 'Delantero' },
]

export default function CreateNoticeModal({
  isOpen,
  onClose,
}: CreateNoticeModalProps): React.JSX.Element {
  const queryClient = useQueryClient()
  const [type, setType] = useState<CommunityNoticeType>('falta_uno')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [timeSlot, setTimeSlot] = useState('')
  const [courtName, setCourtName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [positionNeeded, setPositionNeeded] = useState('Cualquiera')
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: (input: CreateCommunityNoticeInput) => createCommunityNotice(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['community-notices'] })
      onClose()
      resetForm()
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Error al publicar el aviso'
      setError(msg)
    },
  })

  function resetForm(): void {
    setTitle('')
    setDescription('')
    setDate('')
    setTimeSlot('')
    setCourtName('')
    setContactPhone('')
    setPositionNeeded('Cualquiera')
    setError(null)
  }

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault()
    setError(null)

    if (!title.trim() || !description.trim() || !date.trim() || !timeSlot.trim() || !contactPhone.trim()) {
      setError('Por favor completá los campos obligatorios.')
      return
    }

    mutation.mutate({
      type,
      title: title.trim(),
      description: description.trim(),
      date: date.trim(),
      timeSlot: timeSlot.trim(),
      courtName: courtName.trim() || undefined,
      contactPhone: contactPhone.trim(),
      positionNeeded: type === 'falta_uno' ? positionNeeded : undefined,
    })
  }

  return (
    <Modal.Root isOpen={isOpen} onOpenChange={(open) => open || onClose()}>
      <Modal.Backdrop variant="blur" />
      <Modal.Container size="md">
        <Modal.Dialog className="border border-white/10 bg-neutral-900">
          <Modal.Header>
            <Modal.Heading className="text-lg font-bold text-white">
              Publicar aviso en la comunidad
            </Modal.Heading>
            <Modal.CloseTrigger />
          </Modal.Header>

          <Modal.Body>
            <form id="notice-form" onSubmit={handleSubmit} className="space-y-4">
              <SelectInput
                label="Tipo de aviso"
                value={type}
                onValueChange={(val) => setType(val as CommunityNoticeType)}
                options={TYPE_OPTIONS}
              />

              <TextInput
                label="Título del aviso"
                placeholder="Ej: Nos falta arquero para hoy / Buscamos rival a las 20hs"
                value={title}
                onValueChange={setTitle}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TextInput
                  label="Fecha"
                  type="text"
                  placeholder="Ej: Hoy, Mañana, 12/03"
                  value={date}
                  onValueChange={setDate}
                />
                <TextInput
                  label="Horario"
                  type="text"
                  placeholder="Ej: 20:00 hs"
                  value={timeSlot}
                  onValueChange={setTimeSlot}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <TextInput
                  label="Cancha / Complejo (opcional)"
                  placeholder="Ej: Cancha 1 Techada"
                  value={courtName}
                  onValueChange={setCourtName}
                />
                {type === 'falta_uno' && (
                  <SelectInput
                    label="Puesto requerido"
                    value={positionNeeded}
                    onValueChange={setPositionNeeded}
                    options={POSITION_OPTIONS}
                  />
                )}
              </div>

              <TextInput
                label="Teléfono / WhatsApp de contacto"
                type="tel"
                placeholder="Ej: 3511234567 (código de área sin 0 ni 15)"
                value={contactPhone}
                onValueChange={setContactPhone}
              />

              <TextInput
                label="Descripción adicional"
                placeholder="Aclaraciones de nivel, modalidad de pago, etc."
                value={description}
                onValueChange={setDescription}
              />

              {error && (
                <Chip color="danger" size="sm" className="h-auto py-1">
                  {error}
                </Chip>
              )}
            </form>
          </Modal.Body>

          <Modal.Footer className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" className="min-h-11 w-full sm:w-auto" onPress={onClose}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              form="notice-form"
              className="min-h-11 w-full sm:w-auto bg-[#c5d86d] text-neutral-950 font-bold hover:bg-[#b5c85d]"
              isDisabled={mutation.isPending}
            >
              {mutation.isPending ? 'Publicando...' : 'Publicar aviso'}
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Root>
  )
}
