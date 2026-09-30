import { Button, Card } from '@heroui/react'
import FadeUp from '../common/FadeUp'
import type { Field } from '../../types'

interface FieldPickerProps {
  fields: Field[]
  selectedFieldId: string | null
  onSelect: (fieldId: string) => void
}

const COURT_IMAGES = [
  '/images/canchas/nocturna.jpg',
  '/images/canchas/indoor.jpg',
  '/images/canchas/techada.jpg',
]

function imageFor(field: Field, index: number): string {
  const name = field.name.toLowerCase()
  if (name.includes('noctur') || name.includes('night')) return COURT_IMAGES[0]
  if (name.includes('indoor') || name.includes('cubiert') || name.includes('climat')) {
    return COURT_IMAGES[1]
  }
  if (name.includes('techad') || name.includes('lona')) return COURT_IMAGES[2]
  return COURT_IMAGES[index % COURT_IMAGES.length]
}

export default function FieldPicker({
  fields,
  selectedFieldId,
  onSelect,
}: FieldPickerProps): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {fields.map((field, index) => {
        const selected = field.id === selectedFieldId
        return (
          <FadeUp key={field.id} delayMs={index * 90} className="h-full">
            <Card.Root
              className={`h-full cursor-pointer overflow-hidden border-2 transition-all duration-300 ${
                selected
                  ? 'border-lime bg-cream shadow-[0_0_30px_-10px_rgba(197,216,109,0.6)] dark:bg-coffee-elev'
                  : 'border-transparent bg-cream shadow-surface hover:-translate-y-1 hover:border-mauve/50 hover:shadow-xl dark:bg-coffee-elev dark:hover:border-mauve'
              }`}
              onClick={() => onSelect(field.id)}
            >
            <div className="aspect-video overflow-hidden">
              <img
                src={imageFor(field, index)}
                alt={`Fotografía de ${field.name}`}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
            <Card.Content className="flex flex-col gap-4 p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
                <div className="min-w-0 flex-1 space-y-2">
                  <Card.Title className="text-base font-bold sm:text-lg">{field.name}</Card.Title>
                  <span className="inline-flex items-center rounded-full border border-mauve/30 bg-lime/10 px-2.5 py-0.5 text-xs font-semibold text-coffee dark:border-lime/30 dark:bg-lime/10 dark:text-lime">
                    {field.type}
                  </span>
                </div>
                <div className="shrink-0 text-right">
                  <span className="text-xl font-extrabold tracking-tight text-coffee sm:text-2xl dark:text-[#f3efe8]">
                    ${field.pricePerHour}
                  </span>
                  <span className="block text-xs font-medium text-tertiary dark:text-mauve-soft">
                    / hora
                  </span>
                </div>
              </div>
              <Button variant="primary" className="min-h-11 w-full" onPress={() => onSelect(field.id)} aria-pressed={selected}>
                {selected ? 'Elegida' : 'Seleccionar'}
              </Button>
            </Card.Content>
            </Card.Root>
          </FadeUp>
        )
      })}
    </div>
  )
}