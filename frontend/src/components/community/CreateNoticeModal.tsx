import { Button, Modal } from '@heroui/react'
import { useEffect, useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createCommunityNotice } from '../../api'
import { getErrorMessage } from '../../api/client'
import type { CommunityNotice, CommunityNoticeType, CreateCommunityNoticeInput } from '../../types'
import { TextInput } from '../common/fields'

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
const OFFENSIVE_ERROR_MESSAGE = 'Tu aviso contiene términos no permitidos o lenguaje inadecuado'

const BAD_WORDS_REGEX =
  /\b(puto|puta|mierda|pelotud[oa]|bolud[oa]|conchud[oa]|concha|pija|verga|mogolic[oa]|forr[oa]|hdp|imbecil|idiota|tarad[oa]|cornud[oa]|sorete|culiad[oa]|orto|maricon|garca)\b/i

function containsOffensiveLanguage(text: string): boolean {
  const normalized = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  return BAD_WORDS_REGEX.test(normalized)
}

interface DarkDropdownProps {
  label: string
  value: string
  options: { key: string; label: string }[]
  onChange: (value: string) => void
}

function DarkDropdown({ label, value, options, onChange }: DarkDropdownProps): React.JSX.Element {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const selected = options.find((opt) => opt.key === value) ?? options[0]

  useEffect(() => {
    if (!open) return
    function handleOutside(e: MouseEvent): void {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open])

  return (
    <div ref={containerRef} className="relative space-y-1.5">
      <span className="block text-sm font-medium text-neutral-300">{label}</span>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={`flex min-h-11 w-full items-center justify-between gap-2 rounded-lg border px-3 text-left text-sm font-medium text-white transition-colors ${
          open
            ? 'border-[#c5d86d] bg-neutral-900 ring-1 ring-[#c5d86d]'
            : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700'
        }`}
      >
        <span className="truncate">{selected?.label ?? ''}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`size-4 shrink-0 text-neutral-400 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-56 overflow-auto rounded-xl border border-neutral-800 bg-neutral-900 p-1 shadow-2xl shadow-black/80"
        >
          {options.map((opt) => {
            const isSelected = opt.key === value
            return (
              <li key={opt.key} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(opt.key)
                    setOpen(false)
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    isSelected
                      ? 'bg-neutral-800 font-bold text-[#c5d86d]'
                      : 'text-neutral-100 hover:bg-neutral-800/80'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <span className="text-xs font-black text-[#c5d86d]">✓</span>}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

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
    } else if (containsOffensiveLanguage(title)) {
      nextErrors.title = OFFENSIVE_ERROR_MESSAGE
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
    } else if (containsOffensiveLanguage(description)) {
      nextErrors.description = OFFENSIVE_ERROR_MESSAGE
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
              <DarkDropdown
                label="Tipo de aviso"
                value={type}
                options={TYPE_OPTIONS}
                onChange={(val) => {
                  if (val === 'falta_uno' || val === 'desafio_rival') {
                    setType(val)
                  }
                }}
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
                  <DarkDropdown
                    label="Puesto requerido"
                    value={positionNeeded}
                    options={POSITION_OPTIONS}
                    onChange={(val) => setPositionNeeded(val || 'Cualquiera')}
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
