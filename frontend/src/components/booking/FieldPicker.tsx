import { useState } from 'react'
import FadeUp from '../common/FadeUp'
import { GridIcon, MapIcon, StadiumIcon } from '../common/Icons'
import CourtCard from '../courts/CourtCard'
import type { Field } from '../../types'

interface FieldPickerProps {
  fields: Field[]
  selectedFieldId: string | null
  onSelect: (fieldId: string) => void
  splitByTen?: boolean
}

const COURT_IMAGES = [
  '/images/canchas/nocturna.jpg',
  '/images/canchas/indoor.jpg',
  '/images/canchas/techada.jpg',
]

function imageFor(field: Field, index: number): string {
  if (field.imageUrl && field.imageUrl.trim().length > 0) return field.imageUrl
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
  splitByTen = false,
}: FieldPickerProps): React.JSX.Element {
  const [viewMode, setViewMode] = useState<'cards' | 'map'>('cards')

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium text-neutral-400">
          Seleccioná una cancha para ver sus horarios en tiempo real
        </p>
        <div className="inline-flex rounded-xl border border-white/10 bg-neutral-900 p-1 shadow-xs">
          <button
            type="button"
            onClick={() => setViewMode('cards')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
              viewMode === 'cards'
                ? 'bg-[#c5d86d] text-neutral-950 shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <GridIcon className="size-3.5" />
            <span>Tarjetas</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('map')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
              viewMode === 'map'
                ? 'bg-[#c5d86d] text-neutral-950 shadow-xs'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <MapIcon className="size-3.5" />
            <span>Plano Táctico 2D</span>
          </button>
        </div>
      </div>

      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {fields.map((field, index) => {
            const selected = field.id === selectedFieldId
            return (
              <FadeUp key={field.id} delayMs={index * 80} className="h-full">
                <CourtCard
                  field={field}
                  selected={selected}
                  image={imageFor(field, index)}
                  onSelect={onSelect}
                  splitByTen={splitByTen}
                />
              </FadeUp>
            )
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-white/10 bg-neutral-900/70 p-5 sm:p-7">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-[#c5d86d]/15 text-[#c5d86d]">
                <StadiumIcon className="size-4" />
              </span>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-white">
                  Mapa Interactivo del Predio Copa 5
                </h3>
                <p className="text-xs text-neutral-400">
                  Tocá cualquier cancha del plano para seleccionarla y ver sus turnos abajo
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-300">
              <span className="size-2.5 rounded-full bg-[#c5d86d]" />
              Cancha activa seleccionada
            </span>
          </div>

          <div className="grid gap-4 lg:grid-cols-12">
            {/* Canchas interactivas */}
            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-9 lg:grid-cols-3">
              {fields.map((field, idx) => {
                const selected = field.id === selectedFieldId
                const isCovered =
                  field.isCovered ?? field.name.toLowerCase().includes('techad')
                const displayPrice = splitByTen
                  ? Math.round(field.pricePerHour / 10)
                  : field.pricePerHour
                return (
                  <button
                    key={field.id}
                    type="button"
                    onClick={() => onSelect(field.id)}
                    className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border-2 p-4 text-left transition-all duration-200 active:scale-[0.98] ${
                      selected
                        ? 'border-[#c5d86d] bg-[#c5d86d]/15 shadow-md'
                        : 'border-white/10 bg-neutral-950/60 hover:border-[#c5d86d]/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-md bg-neutral-900 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#c5d86d]">
                        Sector {idx + 1}
                      </span>
                      <span className="rounded-full border border-white/15 bg-neutral-800 px-2.5 py-0.5 text-[10px] font-bold text-neutral-200">
                        {isCovered ? 'Nave Techada' : 'Aire Libre'}
                      </span>
                    </div>

                    {/* Ilustración vectorial de cancha */}
                    <div className="my-4 flex items-center justify-center">
                      <svg
                        viewBox="0 0 200 110"
                        className="h-28 w-full rounded-xl border border-white/15 bg-neutral-900 p-1.5"
                        aria-hidden="true"
                      >
                        <rect
                          x="6"
                          y="6"
                          width="188"
                          height="98"
                          rx="6"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className={selected ? 'text-[#c5d86d]' : 'text-neutral-600'}
                        />
                        <line
                          x1="100"
                          y1="6"
                          x2="100"
                          y2="104"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          className="text-neutral-700"
                        />
                        <circle
                          cx="100"
                          cy="55"
                          r="18"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          className={selected ? 'text-[#c5d86d]' : 'text-neutral-700'}
                        />
                        <rect
                          x="6"
                          y="33"
                          width="22"
                          height="44"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          className="text-neutral-700"
                        />
                        <rect
                          x="172"
                          y="33"
                          width="22"
                          height="44"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          className="text-neutral-700"
                        />
                      </svg>
                    </div>

                    <div className="flex items-end justify-between gap-2">
                      <div>
                        <p className="text-sm font-black text-white">
                          {field.name}
                        </p>
                        <p className="text-[11px] text-neutral-400">
                          {field.dimensions || '30 × 18 mts'} · {field.lighting || 'LED 500 Lux'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="block text-sm font-black text-[#c5d86d]">
                          ${displayPrice.toLocaleString('es-AR')}
                        </span>
                        <span className="text-[10px] font-semibold text-neutral-400">
                          {splitByTen ? '/ jugador' : '/ hora'}
                        </span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Zonas complementarias del complejo */}
            <div className="flex flex-col justify-between gap-3 rounded-2xl border border-dashed border-white/15 bg-neutral-950/50 p-4 lg:col-span-3">
              <div className="space-y-2">
                <span className="inline-block rounded bg-[#c5d86d]/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#c5d86d]">
                  Servicios del Predio
                </span>
                <div className="rounded-xl border border-white/10 bg-neutral-900 p-3">
                  <p className="text-xs font-extrabold text-white">
                    Quincho & Tercer Tiempo
                  </p>
                  <p className="mt-0.5 text-[11px] text-neutral-400">
                    Sector central frente a Cancha 1 · Parrillas y pantallas HD
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-neutral-900 p-3">
                  <p className="text-xs font-extrabold text-white">
                    Vestuarios & Recepción
                  </p>
                  <p className="mt-0.5 text-[11px] text-neutral-400">
                    Lockers individuales y duchas climatizadas
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-neutral-900 p-3 text-center">
                <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  Acceso Vehicular
                </p>
                <p className="text-xs font-semibold text-white">
                  Estacionamiento Privado Vigilado
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}