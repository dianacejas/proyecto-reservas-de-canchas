import { Button, Card } from '@heroui/react'
import type { Field } from '../../types'
import {
  resolveCourtDimensions,
  resolveCourtSportLabel,
  resolveCourtSurface,
} from '../../utils/slots'
import { UsersIcon } from '../common/Icons'

interface CourtCardProps {
  field: Field
  selected: boolean
  image: string
  onSelect: (fieldId: string) => void
  splitByTen?: boolean
}

function DimensionIcon({ className }: { className?: string }): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? 'size-3.5 shrink-0 text-neutral-500'}
      aria-hidden="true"
    >
      <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L3.7 9.7a2.4 2.4 0 0 1 0-3.4l2.6-2.6a2.4 2.4 0 0 1 3.4 0Z" />
      <path d="m14.5 12.5 2-2" />
      <path d="m11.5 9.5 2-2" />
      <path d="m8.5 6.5 2-2" />
      <path d="m17.5 15.5 2-2" />
    </svg>
  )
}

function SparklesIcon({ className }: { className?: string }): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? 'size-3.5 shrink-0 text-neutral-500'}
      aria-hidden="true"
    >
      <path d="M12 2v4" />
      <path d="M12 18v4" />
      <path d="M4.93 4.93l2.83 2.83" />
      <path d="M16.24 16.24l2.83 2.83" />
      <path d="M2 12h4" />
      <path d="M18 12h4" />
      <path d="M4.93 19.07l2.83-2.83" />
      <path d="M16.24 7.76l2.83-2.83" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  )
}

function ShowerIcon({ className }: { className?: string }): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? 'size-3.5 shrink-0 text-neutral-500'}
      aria-hidden="true"
    >
      <path d="m4 4 2.5 2.5" />
      <path d="M13.5 6.5a4.95 4.95 0 0 0-7 7L11 18l7-7-4.5-4.5Z" />
      <path d="m15 5 2 2" />
      <path d="M14 17v.01" />
      <path d="M10 16v.01" />
      <path d="M13 13v.01" />
      <path d="M16 10v.01" />
      <path d="M11 20v.01" />
      <path d="M17 14v.01" />
      <path d="M20 11v.01" />
    </svg>
  )
}

function isRoofed(field: Field): boolean {
  const name = field.name.toLowerCase()
  const type = (field.type || '').toLowerCase()
  return (
    name.includes('techad') ||
    name.includes('indoor') ||
    name.includes('cubiert') ||
    type.includes('techad') ||
    type.includes('indoor') ||
    type.includes('cubiert')
  )
}

export default function CourtCard({
  field,
  selected,
  image,
  onSelect,
  splitByTen = false,
}: CourtCardProps): React.JSX.Element {
  const roofed = isRoofed(field)
  const isCovered = field.isCovered !== undefined ? field.isCovered : roofed
  const deposit = Math.round(field.pricePerHour * 0.5)
  const perPlayer = Math.round(field.pricePerHour / 10)
  const sportLabel = resolveCourtSportLabel(field)
  const dimensionsLabel = resolveCourtDimensions(field)
  const surfaceLabel = resolveCourtSurface(field)

  return (
    <Card.Root
      className={`group h-full cursor-pointer overflow-hidden rounded-2xl transition-all duration-300 ${
        selected
          ? 'border-2 border-[#c5d86d] bg-neutral-900/50 shadow-lg shadow-[#c5d86d]/10'
          : 'border border-white/10 bg-neutral-900/50 hover:border-white/25'
      }`}
      onClick={() => onSelect(field.id)}
    >
      {/* Imagen superior con aspect ratio compacto en móvil y 16:9 en web */}
      <div className="relative aspect-[16/8] sm:aspect-video w-full overflow-hidden bg-neutral-900">
        <img
          src={image}
          alt={`Fotografía de ${field.name}`}
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/25" />

        {/* Badges sobre la foto */}
        <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
          <span className="bg-stone-900/85 text-white backdrop-blur-md font-semibold text-xs px-3 py-1 rounded-full">
            {isCovered ? 'Techada' : 'Descubierta'}
          </span>
          <span className="bg-[#c5d86d] text-stone-950 font-black text-xs px-3 py-1 rounded-full shadow-xs">
            {sportLabel}
          </span>
        </div>
      </div>

      {/* Cuerpo de la tarjeta */}
      <Card.Content className="flex flex-col gap-3 p-4 sm:gap-4 sm:p-5">
        <div>
          <h3 className="text-lg font-black tracking-tight text-white sm:text-xl">
            {field.name}
          </h3>

          {/* Micro-especificaciones dinámicas desde la API */}
          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-neutral-300 font-medium">
            <span className="inline-flex items-center gap-1.5">
              <DimensionIcon className="size-3.5 text-neutral-400" />
              {dimensionsLabel}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <SparklesIcon className="size-3.5 text-neutral-400" />
              {field.lighting || 'LED 500 Lux'}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShowerIcon className="size-3.5 text-neutral-400" />
              {surfaceLabel}
            </span>
          </div>
        </div>

        {/* Bloque de precio destacado con modo por jugador */}
        <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
          <div className="flex items-baseline justify-between gap-2">
            <div>
              <span className="text-2xl font-black text-[#c5d86d]">
                ${(splitByTen ? perPlayer : field.pricePerHour).toLocaleString('es-AR')}
              </span>
              <span className="ml-1 text-xs font-semibold text-neutral-400">
                {splitByTen ? '/ jugador' : '/ h'}
              </span>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#c5d86d]/20 px-2 py-0.5 text-[11px] font-bold text-[#c5d86d]">
              <UsersIcon className="size-3" />
              ${perPlayer.toLocaleString('es-AR')} c/u
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-1.5 border-t border-white/5 pt-2 text-[11px] text-neutral-400">
            <span>
              Seña 50%: <strong className="text-white">${deposit.toLocaleString('es-AR')}</strong>
            </span>
            <span className="inline-flex items-center gap-1 font-mono text-[10px]">
              {['18h', '19h', '20h', '21h', '22h'].map((h) => (
                <span
                  key={h}
                  className="rounded bg-[#c5d86d]/25 px-1 py-0.5 font-bold text-[#c5d86d]"
                >
                  {h}
                </span>
              ))}
            </span>
          </div>
        </div>

        <Button
          variant="primary"
          className={`min-h-11 w-full transition-all ${
            selected
              ? 'bg-[#c5d86d] hover:bg-[#b5c85d] text-stone-950 font-black shadow-sm'
              : 'bg-white/10 text-white border border-white/10 font-bold hover:bg-white/20'
          }`}
          onPress={() => onSelect(field.id)}
          aria-pressed={selected}
        >
          {selected ? 'Cancha Seleccionada' : 'Seleccionar Cancha'}
        </Button>
      </Card.Content>
    </Card.Root>
  )
}