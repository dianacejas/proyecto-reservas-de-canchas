import FadeUp from '../common/FadeUp'
import CourtCard from '../courts/CourtCard'
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
            <CourtCard
              field={field}
              selected={selected}
              image={imageFor(field, index)}
              onSelect={onSelect}
            />
          </FadeUp>
        )
      })}
    </div>
  )
}