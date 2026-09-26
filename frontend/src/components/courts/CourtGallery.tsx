import { Chip } from '@heroui/react'
import FadeUp from '../common/FadeUp'

interface Court {
  id: string
  title: string
  description: string
  chip: { label: string; color: 'accent' | 'success' | 'warning' }
  image: string
  alt: string
}

const COURTS: Court[] = [
  {
    id: 'nocturna',
    title: 'Cancha Nocturna 1',
    description:
      'Reflectores LED de última generación y cesped sintetico bajo las estrellas. Ideal para partidos de noche.',
    chip: { label: 'Iluminada · 06 a 02', color: 'accent' },
    image: '/images/canchas/nocturna.jpg',
    alt: 'Cancha de fútbol 5 iluminada de noche con cerco de red',
  },
  {
    id: 'indoor',
    title: 'Cancha Indoor 2',
    description:
      'Césped sintético de alto rendimiento con techo completo: jugá llueva o truene, con máxima adherencia.',
    chip: { label: 'Cubierta y climatizada', color: 'success' },
    image: '/images/canchas/indoor.jpg',
    alt: 'Partido de futsal indoor sobre piso de competición',
  },
  {
    id: 'techada',
    title: 'Cancha Techada 3',
    description:
      'Lona tensada que protege del sol y la lluvia liviana, con aire libre a los costados para el público.',
    chip: { label: 'Techada al aire', color: 'warning' },
    image: '/images/canchas/techada.jpg',
    alt: 'Cancha techada en recinto deportivo cubierto',
  },
]

export default function CourtGallery(): React.JSX.Element {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-tertiary dark:text-mauve-soft">
            Nuestro complejo
          </h2>
          <p className="mt-0.5 text-lg font-bold tracking-tight">Tres canchas, un solo club</p>
        </div>
        <p className="text-sm text-tertiary dark:text-mauve-soft">
          Reservá elegí el horario y jugá en la que prefieras.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {COURTS.map((court, index) => (
          <FadeUp key={court.id} delayMs={index * 90} className="h-full">
            <figure className="group h-full overflow-hidden rounded-2xl border border-line bg-cream transition-all duration-300 hover:-translate-y-1 hover:border-lime/60 hover:shadow-xl dark:border-mauve dark:bg-coffee-elev">
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src={court.image}
                alt={court.alt}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <figcaption className="space-y-2 p-5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-bold">{court.title}</h3>
                <Chip color={court.chip.color} size="sm">
                  {court.chip.label}
                </Chip>
              </div>
              <p className="text-sm leading-relaxed text-tertiary dark:text-mauve-soft">
                {court.description}
              </p>
            </figcaption>
          </figure>
        </FadeUp>
      ))}
      </div>
    </section>
  )
}