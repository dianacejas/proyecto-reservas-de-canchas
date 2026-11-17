import { Button, Checkbox, Modal } from '@heroui/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { queryKeys, updateCourt } from '../../api'
import { getErrorMessage } from '../../api/client'
import { SelectInput, TextInput } from '../common/fields'
import {
  resolveCourtDimensions,
  resolveCourtSportLabel,
  resolveCourtSurface,
  STANDARD_DIMENSIONS_BY_TYPE,
} from '../../utils/slots'
import type { Field } from '../../types'

interface EditCourtModalProps {
  court: Field | null
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const SPORT_OPTIONS = [
  { key: 'Fútbol 5', label: 'Fútbol 5 (30 × 18 mts)' },
  { key: 'Fútbol 7', label: 'Fútbol 7 (50 × 30 mts)' },
  { key: 'Fútbol 9', label: 'Fútbol 9 (70 × 45 mts)' },
  { key: 'Fútbol 11', label: 'Fútbol 11 (100 × 65 mts)' },
]

export default function EditCourtModal({
  court,
  isOpen,
  onClose,
  onSuccess,
}: EditCourtModalProps): React.JSX.Element {
  const queryClient = useQueryClient()
  const initialSportLabel = court ? resolveCourtSportLabel(court) : 'Fútbol 5'
  const [name, setName] = useState(court?.name ?? '')
  const [price, setPrice] = useState(String(court?.pricePerHour ?? ''))
  const [sportType, setSportType] = useState(initialSportLabel)
  const [surface, setSurface] = useState(court ? resolveCourtSurface(court) : 'Sintético FIFA Pro 60mm')
  const [dimensions, setDimensions] = useState(court ? resolveCourtDimensions(court) : '30 × 18 mts')
  const [lighting, setLighting] = useState(court?.lighting ?? 'LED 500 Lux')
  const [isCovered, setIsCovered] = useState(court?.isCovered ?? false)
  const [active, setActive] = useState(court?.active ?? court?.isActive ?? true)
  const [imageUrl, setImageUrl] = useState(court?.imageUrl ?? '')
  const [error, setError] = useState<string | null>(null)

  function handleSportTypeChange(nextSport: string): void {
    setSportType(nextSport)
    const nextDefaultDim = STANDARD_DIMENSIONS_BY_TYPE[nextSport]
    if (nextDefaultDim) {
      setDimensions(nextDefaultDim)
    }
  }

  const mutation = useMutation({
    mutationFn: async () => {
      if (court === null) return
      const numericPrice = Number(price)
      if (Number.isNaN(numericPrice) || numericPrice < 0) {
        throw new Error('El precio debe ser un número válido')
      }
      const resolvedDim = dimensions.trim() || STANDARD_DIMENSIONS_BY_TYPE[sportType] || '30 × 18 mts'
      const resolvedSurface = surface.trim() || 'Sintético FIFA Pro 60mm'
      return updateCourt(court.id, {
        name: name.trim(),
        pricePerHour: numericPrice,
        sport: sportType,
        type: sportType,
        features: [resolvedSurface, ...(court.features?.slice(1) ?? ['Vestuarios'])],
        dimensions: resolvedDim,
        lighting: lighting.trim() || 'LED 500 Lux',
        isCovered,
        active,
        isActive: active,
        imageUrl: imageUrl.trim(),
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.courts() })
      await queryClient.invalidateQueries({ queryKey: queryKeys.fields() })
      onSuccess?.()
      onClose()
    },
    onError: (err) => {
      setError(getErrorMessage(err))
    },
  })

  function handleSubmit(): void {
    setError(null)
    mutation.mutate()
  }

  return (
    <Modal.Root isOpen={isOpen} onOpenChange={(open) => open || onClose()}>
      <Modal.Backdrop variant="blur" />
      <Modal.Container size="md">
        <Modal.Dialog>
          <Modal.Header>
            <Modal.Heading>Editar Cancha</Modal.Heading>
            <Modal.CloseTrigger />
          </Modal.Header>
          <Modal.Body>
            <div className="space-y-3.5">
              <TextInput
                label="Nombre de la Cancha"
                value={name}
                onValueChange={setName}
                placeholder="Ej: Cancha Alpha"
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <SelectInput
                  label="Tipo de fútbol"
                  value={sportType}
                  onValueChange={handleSportTypeChange}
                  options={SPORT_OPTIONS}
                />
                <TextInput
                  label="Precio por hora ($)"
                  type="number"
                  min={0}
                  value={price}
                  onValueChange={setPrice}
                  placeholder="Ej: 12000"
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <TextInput
                  label="Superficie / Césped"
                  value={surface}
                  onValueChange={setSurface}
                  placeholder="Ej: Sintético FIFA Pro 60mm"
                />
                <TextInput
                  label="Dimensiones reglamentarias"
                  value={dimensions}
                  onValueChange={setDimensions}
                  placeholder="Ej: 30 × 18 mts"
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <TextInput
                  label="Iluminación"
                  value={lighting}
                  onValueChange={setLighting}
                  placeholder="Ej: LED 500 Lux"
                />
                <TextInput
                  label="Imagen (URL)"
                  value={imageUrl}
                  onValueChange={setImageUrl}
                  placeholder="/images/canchas/nocturna.jpg"
                />
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <Checkbox isSelected={isCovered} onChange={setIsCovered}>
                  <Checkbox.Content className="text-sm text-neutral-200">
                    <Checkbox.Control>
                      <Checkbox.Indicator />
                    </Checkbox.Control>
                    Cancha techada / cubierta
                  </Checkbox.Content>
                </Checkbox>

                <Checkbox isSelected={active} onChange={setActive}>
                  <Checkbox.Content className="text-sm text-neutral-200">
                    <Checkbox.Control>
                      <Checkbox.Indicator />
                    </Checkbox.Control>
                    Cancha activa (disponible para reservas)
                  </Checkbox.Content>
                </Checkbox>
              </div>

              {error !== null && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-2.5 text-xs font-semibold text-red-400">
                  {error}
                </div>
              )}
            </div>
          </Modal.Body>
          <Modal.Footer className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onPress={onClose}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="bg-[#c5d86d] font-bold text-neutral-950 hover:bg-[#b5c85d]"
              isDisabled={mutation.isPending}
              onPress={handleSubmit}
            >
              {mutation.isPending ? 'Guardando…' : 'Guardar cambios'}
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Root>
  )
}
