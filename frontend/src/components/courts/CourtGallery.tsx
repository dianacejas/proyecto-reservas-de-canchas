import { Chip } from '@heroui/react'
import { useQuery } from '@tanstack/react-query'
import { listFields, queryKeys } from '../../api'
import FadeUp from '../common/FadeUp'
import {
  resolveCourtDimensions,
  resolveCourtImage,
  resolveCourtSportLabel,
  resolveCourtSurface,
} from '../../utils/slots'

export default function CourtGallery(): React.JSX.Element {
  const { data: fields = [] } = useQuery({
    queryKey: queryKeys.fields(),
    queryFn: listFields,
  })

  const activeFields = fields.filter((f) => (f.active ?? f.isActive ?? true) !== false)
  const courtsToDisplay = activeFields.length > 0 ? activeFields : fields

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
            Nuestro complejo <span className="text-neutral-400 font-light">|</span>{' '}
            <span className="text-[#c5d86d]">
              {courtsToDisplay.length > 0 ? `${courtsToDisplay.length} canchas pro` : 'Canchas pro'}
            </span>
          </h2>
          <p className="mt-2 text-base md:text-lg max-w-2xl text-neutral-400 leading-relaxed">
            Reservá, elegí el horario y jugá en la superficie que prefieras.
          </p>
        </div>
      </div>

      <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
        {courtsToDisplay.map((court, index) => {
          const sportLabel = resolveCourtSportLabel(court)
          const dimensions = resolveCourtDimensions(court)
          const surface = resolveCourtSurface(court)
          const isCovered = court.isCovered ?? court.name.toLowerCase().includes('techad')

          return (
            <FadeUp
              key={court.id}
              delayMs={index * 90}
              className="h-full w-[82vw] max-w-[21rem] shrink-0 snap-center sm:w-auto sm:max-w-none sm:shrink"
            >
              <figure className="group h-full overflow-hidden rounded-2xl border shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-stone-300 hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] border-white/10 bg-neutral-900/50">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={resolveCourtImage(court, index)}
                    alt={`Cancha ${court.name} — ${sportLabel}`}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="rounded-full bg-neutral-950/85 px-2.5 py-0.5 text-[11px] font-bold text-white backdrop-blur-md">
                      {isCovered ? 'Techada' : 'Descubierta'}
                    </span>
                    <span className="rounded-full bg-[#c5d86d] px-2.5 py-0.5 text-[11px] font-black text-neutral-950">
                      {sportLabel}
                    </span>
                  </div>
                </div>
                <figcaption className="space-y-2 p-5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-bold text-white">{court.name}</h3>
                    <Chip color={isCovered ? 'success' : 'accent'} size="sm">
                      ${court.pricePerHour.toLocaleString('es-AR')}/h
                    </Chip>
                  </div>
                  <p className="text-sm leading-relaxed text-neutral-400">
                    {surface} · Dimensiones reglamentarias de {dimensions} e iluminación {court.lighting || 'LED 500 Lux'}.
                  </p>
                </figcaption>
              </figure>
            </FadeUp>
          )
        })}
      </div>
    </section>
  )
}
