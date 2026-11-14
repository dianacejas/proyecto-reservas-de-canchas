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
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white">
            Nuestro complejo <span className="text-neutral-400 font-light">|</span>{' '}
            <span className="text-[#c5d86d]">3 canchas pro</span>
          </h2>
          <p className="mt-2 text-base md:text-lg max-w-2xl text-neutral-400 leading-relaxed">
            Reservá, elegí el horario y jugá en la superficie que prefieras.
          </p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {COURTS.map((court, index) => (
          <FadeUp key={court.id} delayMs={index * 90} className="h-full">
            <figure className="group h-full overflow-hidden rounded-2xl border shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-stone-300 hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] border-white/10 bg-neutral-900/50">
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
                <h3 className="text-base font-bold text-white">{court.title}</h3>
                <Chip color={court.chip.color} size="sm">
                  {court.chip.label}
                </Chip>
              </div>
              <p className="text-sm leading-relaxed text-neutral-400">
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