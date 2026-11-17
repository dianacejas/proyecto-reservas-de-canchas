import { Button, Modal } from '@heroui/react'
import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createCommunityNotice } from '../../api'
import { getErrorMessage } from '../../api/client'
import type { CommunityNotice, CommunityNoticeType, CreateCommunityNoticeInput } from '../../types'
import { SelectInput, TextInput } from '../common/fields'

interface CreateNoticeModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated?: (notice: CommunityNotice) => void
}

interface NoticeFieldErrors {
  title?: string
  date?: string
  timeSlot?: string
  contactPhone?: string
  description?: string
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

const BASE_INPUT_CLASS = 'bg-neutral-950 border-neutral-800 text-white focus-within:border-[#c5d86d]'
const ERROR_INPUT_CLASS = 'bg-neutral-950 !border-red-500 ring-1 ring-red-500 text-white'
const SELECT_DARK_CLASS = 'bg-neutral-900 text-white border-neutral-800'

export default function CreateNoticeModal({
  isOpen,
  onClose,
  onCreated,
}: CreateNoticeModalProps): React.JSX.Element | null {
  const queryClient = useQueryClient()
  const [type, setType] = useState<CommunityNoticeType>('falta_uno')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [timeSlot, setTimeSlot] = useState('')
  const [courtName, setCourtName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [positionNeeded, setPositionNeeded] = useState('Cualquiera')
  const [fieldErrors, setFieldErrors] = useState<NoticeFieldErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) {
      document.body.style.removeProperty('overflow')
    }
    return () => {
      document.body.style.removeProperty('overflow')
    }
  }, [isOpen])

  const mutation = useMutation({
    mutationFn: (input: CreateCommunityNoticeInput) => createCommunityNotice(input),
    onSuccess: (createdNotice) => {
      queryClient.setQueryData<CommunityNotice[]>(['community-notices'], (old = []) => [
        createdNotice,
        ...old.filter((item) => item.id !== createdNotice.id),
      ])
      void queryClient.invalidateQueries({ queryKey: ['community-notices'] })
      onCreated?.(createdNotice)
      resetForm()
      onClose()
    },
    onError: (err: unknown) => {
      setServerError(getErrorMessage(err))
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
    setFieldErrors({})
    setServerError(null)
  }

  function validateFields(): NoticeFieldErrors {
    const nextErrors: NoticeFieldErrors = {}
    if (title.trim().length < 3) {
      nextErrors.title = 'Ingresá un título descriptivo (mínimo 3 caracteres).'
    }
    if (!date.trim()) {
      nextErrors.date = 'La fecha del turno es obligatoria.'
    }
    if (!timeSlot.trim()) {
      nextErrors.timeSlot = 'El horario del partido es obligatorio.'
    }
    if (contactPhone.replace(/\D/g, '').length < 6) {
      nextErrors.contactPhone = 'Ingresá un número de WhatsApp válido (mínimo 6 dígitos).'
    }
    if (description.trim().length < 5) {
      nextErrors.description = 'Agregá una breve descripción (mínimo 5 caracteres).'
    }
    return nextErrors
  }

  function submitNotice(): void {
    setServerError(null)
    const validation = validateFields()
    if (Object.keys(validation).length > 0) {
      setFieldErrors(validation)
      return
    }
    setFieldErrors({})
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

  function handleFormSubmit(e: React.FormEvent): void {
    e.preventDefault()
    submitNotice()
  }

  if (!isOpen) return null

  return (
    <Modal.Root isOpen={isOpen} onOpenChange={(open) => open || onClose()}>
      <Modal.Backdrop variant="blur" />
      <Modal.Container size="md">
        <Modal.Dialog className="border border-neutral-800 bg-neutral-900 text-white shadow-2xl">
          <Modal.Header>
            <Modal.Heading className="text-lg font-black text-white">
              Publicar aviso en la comunidad
            </Modal.Heading>
            <Modal.CloseTrigger />
          </Modal.Header>

          <Modal.Body>
            <form id="notice-form" onSubmit={handleFormSubmit} noValidate className="space-y-4">
              <SelectInput
                label="Tipo de aviso"
                value={type}
                onValueChange={(val) => {
                  if (val === 'falta_uno' || val === 'desafio_rival') {
                    setType(val)
                  }
                }}
                options={TYPE_OPTIONS}
                triggerClassName={SELECT_DARK_CLASS}
                popoverClassName={SELECT_DARK_CLASS}
              />

              <div className="space-y-1">
                <TextInput
                  label="Título del aviso *"
                  placeholder="Ej: Nos falta arquero para hoy / Buscamos rival 20hs"
                  value={title}
                  onValueChange={(val) => {
                    setTitle(val)
                    if (fieldErrors.title) setFieldErrors((prev) => ({ ...prev, title: undefined }))
                  }}
                  inputClassName={fieldErrors.title ? ERROR_INPUT_CLASS : BASE_INPUT_CLASS}
                />
                {fieldErrors.title && (
                  <p className="text-xs font-semibold text-red-400">{fieldErrors.title}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <TextInput
                    label="Fecha *"
                    type="text"
                    placeholder="Ej: Hoy, Mañana, Viernes 20"
                    value={date}
                    onValueChange={(val) => {
                      setDate(val)
                      if (fieldErrors.date) setFieldErrors((prev) => ({ ...prev, date: undefined }))
                    }}
                    inputClassName={fieldErrors.date ? ERROR_INPUT_CLASS : BASE_INPUT_CLASS}
                  />
                  {fieldErrors.date && (
                    <p className="text-xs font-semibold text-red-400">{fieldErrors.date}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <TextInput
                    label="Horario *"
                    type="text"
                    placeholder="Ej: 20:00 hs"
                    value={timeSlot}
                    onValueChange={(val) => {
                      setTimeSlot(val)
                      if (fieldErrors.timeSlot) {
                        setFieldErrors((prev) => ({ ...prev, timeSlot: undefined }))
                      }
                    }}
                    inputClassName={fieldErrors.timeSlot ? ERROR_INPUT_CLASS : BASE_INPUT_CLASS}
                  />
                  {fieldErrors.timeSlot && (
                    <p className="text-xs font-semibold text-red-400">{fieldErrors.timeSlot}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <TextInput
                  label="Cancha / Sector (opcional)"
                  placeholder="Ej: Cancha Alpha"
                  value={courtName}
                  onValueChange={setCourtName}
                  inputClassName={BASE_INPUT_CLASS}
                />
                {type === 'falta_uno' && (
                  <SelectInput
                    label="Puesto requerido"
                    value={positionNeeded}
                    onValueChange={(val) => setPositionNeeded(val || 'Cualquiera')}
                    options={POSITION_OPTIONS}
                    triggerClassName={SELECT_DARK_CLASS}
                    popoverClassName={SELECT_DARK_CLASS}
                  />
                )}
              </div>

              <div className="space-y-1">
                <TextInput
                  label="Teléfono / WhatsApp de contacto *"
                  type="tel"
                  placeholder="Ej: 3511234567 (sin 0 ni 15)"
                  value={contactPhone}
                  onValueChange={(val) => {
                    setContactPhone(val)
                    if (fieldErrors.contactPhone) {
                      setFieldErrors((prev) => ({ ...prev, contactPhone: undefined }))
                    }
                  }}
                  inputClassName={fieldErrors.contactPhone ? ERROR_INPUT_CLASS : BASE_INPUT_CLASS}
                />
                {fieldErrors.contactPhone && (
                  <p className="text-xs font-semibold text-red-400">{fieldErrors.contactPhone}</p>
                )}
              </div>

              <div className="space-y-1">
                <TextInput
                  label="Descripción adicional *"
                  placeholder="Nivel del partido, valor por jugador, etc."
                  value={description}
                  onValueChange={(val) => {
                    setDescription(val)
                    if (fieldErrors.description) {
                      setFieldErrors((prev) => ({ ...prev, description: undefined }))
                    }
                  }}
                  inputClassName={fieldErrors.description ? ERROR_INPUT_CLASS : BASE_INPUT_CLASS}
                />
                {fieldErrors.description && (
                  <p className="text-xs font-semibold text-red-400">{fieldErrors.description}</p>
                )}
              </div>

              {serverError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400">
                  {serverError}
                </div>
              )}
            </form>
          </Modal.Body>

          <Modal.Footer className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              className="min-h-11 w-full sm:w-auto"
              onPress={onClose}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              className="min-h-11 w-full bg-[#c5d86d] font-black text-neutral-950 hover:bg-[#b5c85d] sm:w-auto"
              isDisabled={mutation.isPending}
              onPress={submitNotice}
            >
              {mutation.isPending ? 'Publicando…' : 'Publicar aviso'}
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Root>
  )
}
