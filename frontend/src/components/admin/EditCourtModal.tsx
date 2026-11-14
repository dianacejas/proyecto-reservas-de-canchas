import { Button, Checkbox, Modal } from '@heroui/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { queryKeys, updateCourt } from '../../api'
import { getErrorMessage } from '../../api/client'
import { TextInput } from '../common/fields'
import type { Field } from '../../types'

interface EditCourtModalProps {
  court: Field | null
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function EditCourtModal({
  court,
  isOpen,
  onClose,
  onSuccess,
}: EditCourtModalProps): React.JSX.Element {
  const queryClient = useQueryClient()
  const [name, setName] = useState(court?.name ?? '')
  const [price, setPrice] = useState(String(court?.pricePerHour ?? ''))
  const [dimensions, setDimensions] = useState(court?.dimensions ?? '30 x 18 mts')
  const [lighting, setLighting] = useState(court?.lighting ?? 'LED 500 Lux')
  const [type, setType] = useState(court?.type ?? 'Sintético Premium 60mm')
  const [isCovered, setIsCovered] = useState(court?.isCovered ?? false)
  const [active, setActive] = useState(court?.active ?? court?.isActive ?? true)
  const [imageUrl, setImageUrl] = useState(court?.imageUrl ?? '')
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: async () => {
      if (court === null) return
      const numericPrice = Number(price)
      if (Number.isNaN(numericPrice) || numericPrice < 0) {
        throw new Error('El precio debe ser un número válido')
      }
      return updateCourt(court.id, {
        name: name.trim(),
        pricePerHour: numericPrice,
        dimensions: dimensions.trim() || '30 x 18 mts',
        lighting: lighting.trim() || 'LED 500 Lux',
        type: type.trim() || 'Fútbol 5',
        isCovered,
        active,
        isActive: active,
        imageUrl: imageUrl.trim(),
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['courts'] })
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
    <Modal.Root isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Modal.Backdrop variant="blur" />
      <Modal.Container size="md">
        <Modal.Dialog className="border border-white/10 bg-neutral-900">
          <Modal.Header>
            <Modal.Heading className="text-white">Editar Cancha</Modal.Heading>
            <Modal.CloseTrigger />
          </Modal.Header>
          <Modal.Body>
            <div className="space-y-3.5">
              <TextInput
                label="Nombre de la Cancha"
                value={name}
                onValueChange={setName}
                placeholder="Ej: Cancha 1 (Nocturna)"
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <TextInput
                  label="Precio por hora ($)"
                  type="number"
                  min={0}
                  value={price}
                  onValueChange={setPrice}
                  placeholder="38000"
                />
                <TextInput
                  label="Tipo de césped / Superficie"
                  value={type}
                  onValueChange={setType}
                  placeholder="Sintético 60mm FIFA Pro"
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <TextInput
                  label="Dimensiones"
                  value={dimensions}
                  onValueChange={setDimensions}
                  placeholder="30 x 18 mts"
                />
                <TextInput
                  label="Iluminación"
                  value={lighting}
                  onValueChange={setLighting}
                  placeholder="LED 500 Lux"
                />
              </div>
              <TextInput
                label="Imagen (URL)"
                value={imageUrl}
                onValueChange={setImageUrl}
                placeholder="https://.../cancha.jpg"
              />
              <div className="flex flex-col gap-2 pt-1">
                <Checkbox isSelected={isCovered} onChange={setIsCovered}>
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <Checkbox.Content className="text-sm text-neutral-200">
                    Cancha techada / cubierta
                  </Checkbox.Content>
                </Checkbox>
                <Checkbox isSelected={active} onChange={setActive}>
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <Checkbox.Content className="text-sm text-neutral-200">
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
