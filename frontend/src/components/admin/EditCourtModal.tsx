import { Button, Checkbox, Modal } from '@heroui/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { createField, queryKeys, updateCourt } from '../../api'
import { getErrorMessage } from '../../api/client'
import { SelectInput, TextInput } from '../common/fields'
import {
  resolveCourtDimensions,
  resolveCourtImage,
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

/**
 * Convierte cualquier imagen subida (.png, .jpg, .webp) a Data URL WebP
 * redimensionada (máx 1280px) para persistirla de forma liviana y rápida.
 */
function fileToOptimizedWebpDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      try {
        const maxWidth = 1280
        const scale = img.width > maxWidth ? maxWidth / img.width : 1
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          URL.revokeObjectURL(objectUrl)
          reject(new Error('No se pudo procesar la imagen seleccionada'))
          return
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        const webpDataUrl = canvas.toDataURL('image/webp', 0.82)
        URL.revokeObjectURL(objectUrl)
        resolve(webpDataUrl)
      } catch (err) {
        URL.revokeObjectURL(objectUrl)
        reject(err)
      }
    }
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('El archivo seleccionado no es una imagen válida'))
    }
    img.src = objectUrl
  })
}

export default function EditCourtModal({
  court,
  isOpen,
  onClose,
  onSuccess,
}: EditCourtModalProps): React.JSX.Element {
  const queryClient = useQueryClient()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const isCreateMode = court === null

  const initialSportLabel = court ? resolveCourtSportLabel(court) : 'Fútbol 5'
  const [name, setName] = useState(court?.name ?? '')
  const [price, setPrice] = useState(String(court?.pricePerHour ?? '12000'))
  const [sportType, setSportType] = useState(initialSportLabel)
  const [surface, setSurface] = useState(court ? resolveCourtSurface(court) : 'Sintético FIFA Pro 60mm')
  const [dimensions, setDimensions] = useState(court ? resolveCourtDimensions(court) : '30 × 18 mts')
  const [lighting, setLighting] = useState(court?.lighting ?? 'LED 500 Lux')
  const [isCovered, setIsCovered] = useState(court?.isCovered ?? false)
  const [active, setActive] = useState(court?.active ?? court?.isActive ?? true)
  const [imageUrl, setImageUrl] = useState(court?.imageUrl ?? '')
  const [previewObjectUrl, setPreviewObjectUrl] = useState<string | null>(null)
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (previewObjectUrl) {
        URL.revokeObjectURL(previewObjectUrl)
      }
    }
  }, [previewObjectUrl])

  function handleSportTypeChange(nextSport: string): void {
    setSportType(nextSport)
    const nextDefaultDim = STANDARD_DIMENSIONS_BY_TYPE[nextSport]
    if (nextDefaultDim) {
      setDimensions(nextDefaultDim)
    }
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)

    if (previewObjectUrl) {
      URL.revokeObjectURL(previewObjectUrl)
    }
    const localPreview = URL.createObjectURL(file)
    setPreviewObjectUrl(localPreview)
    setSelectedFileName(file.name)

    try {
      const optimizedWebp = await fileToOptimizedWebpDataUrl(file)
      setImageUrl(optimizedWebp)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  function handleResetDefaultImage(): void {
    if (previewObjectUrl) {
      URL.revokeObjectURL(previewObjectUrl)
    }
    setPreviewObjectUrl(null)
    setSelectedFileName(null)
    setImageUrl('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const effectivePreview =
    previewObjectUrl ??
    resolveCourtImage({
      name,
      sport: sportType,
      type: sportType,
      isCovered,
      imageUrl,
    })

  const mutation = useMutation({
    mutationFn: async () => {
      if (!name.trim()) {
        throw new Error('El nombre de la cancha es obligatorio')
      }
      const numericPrice = Number(price)
      if (Number.isNaN(numericPrice) || numericPrice < 0) {
        throw new Error('El precio debe ser un número válido')
      }
      const resolvedDim = dimensions.trim() || STANDARD_DIMENSIONS_BY_TYPE[sportType] || '30 × 18 mts'
      const resolvedSurface = surface.trim() || 'Sintético FIFA Pro 60mm'
      const payload = {
        name: name.trim(),
        pricePerHour: numericPrice,
        sport: sportType,
        type: sportType,
        features: [resolvedSurface, ...(court?.features?.slice(1) ?? ['Vestuarios'])],
        dimensions: resolvedDim,
        lighting: lighting.trim() || 'LED 500 Lux',
        isCovered,
        active,
        isActive: active,
        imageUrl: imageUrl.trim(),
      }
      if (court === null) {
        return createField(payload)
      }
      return updateCourt(court.id, payload)
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
        <Modal.Dialog className="border border-neutral-800 bg-neutral-900 text-white">
          <Modal.Header>
            <Modal.Heading className="text-lg font-black text-white">
              {isCreateMode ? 'Nueva Cancha' : 'Editar Cancha'}
            </Modal.Heading>
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
              <TextInput
                label="Iluminación"
                value={lighting}
                onValueChange={setLighting}
                placeholder="Ej: LED 500 Lux"
              />

              {/* Carga de imagen por archivo físico con vista previa instantánea */}
              <div className="space-y-2">
                <span className="block text-sm font-medium text-neutral-300">
                  Fotografía de la cancha (.webp, .jpg, .png)
                </span>
                <div className="flex flex-col gap-3 rounded-2xl border border-neutral-800 bg-neutral-950/80 p-3 sm:flex-row sm:items-center">
                  <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900 sm:w-36">
                    <img
                      src={effectivePreview}
                      alt="Vista previa de la cancha"
                      className="size-full object-cover"
                    />
                    <span className="absolute bottom-1.5 right-1.5 rounded bg-neutral-950/85 px-1.5 py-0.5 text-[10px] font-bold uppercase text-[#c5d86d]">
                      WebP
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={(e) => void handleFileSelect(e)}
                      className="block w-full text-xs text-neutral-300 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-[#c5d86d] file:px-3 file:py-1.5 file:text-xs file:font-black file:text-neutral-950 hover:file:bg-[#b5c85d]"
                    />
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-400">
                      <span className="truncate">
                        {selectedFileName
                          ? `Archivo: ${selectedFileName}`
                          : imageUrl.startsWith('data:image/')
                            ? 'Imagen personalizada cargada'
                            : 'Usando imagen contextual WebP según tipo'}
                      </span>
                      {(selectedFileName || imageUrl.length > 0) && (
                        <button
                          type="button"
                          onClick={handleResetDefaultImage}
                          className="font-semibold text-[#c5d86d] hover:underline cursor-pointer"
                        >
                          Usar automática
                        </button>
                      )}
                    </div>
                  </div>
                </div>
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
              {mutation.isPending
                ? 'Guardando…'
                : isCreateMode
                  ? 'Crear cancha'
                  : 'Guardar cambios'}
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Root>
  )
}
