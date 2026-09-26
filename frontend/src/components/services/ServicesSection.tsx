import FadeUp from '../common/FadeUp'

interface Service {
  title: string
  description: string
  icon: () => React.JSX.Element
}

const SERVICES: Service[] = [
  {
    title: 'Vestuarios y Duchas',
    description:
      'Agua caliente, lockers individuales y sanitarios de primer nivel para que llegues y te vayas cómodo.',
    icon: DropletsIcon,
  },
  {
    title: 'Buffet & Tercer Tiempo',
    description:
      'Bar con pantallas gigantes para ver partidos, bebidas frías, parrillas y mesas para el post-partido.',
    icon: MonitorIcon,
  },
  {
    title: 'Estacionamiento Privado',
    description:
      'Predio cerrado con seguridad y cámaras de vigilancia 24/7. Dejás el auto y entrás a jugar tranquilo.',
    icon: CarIcon,
  },
  {
    title: 'Iluminación LED Profesional',
    description:
      'Proyectores de alta potencia para partidos nocturnos sin sombras molestas ni zonas oscuras.',
    icon: ZapIcon,
  },
  {
    title: 'Césped Sintético Premium',
    description:
      'Malla de última generación con caucho amortiguado que reduce el impacto articular y el deslizamiento.',
    icon: GrassIcon,
  },
  {
    title: 'Árbitros y Planilleros Oficiales',
    description:
      'Gestión profesional para todos los partidos: arbitraje, planillas y resultados cargados en tiempo real.',
    icon: FlagIcon,
  },
]

export default function ServicesSection(): React.JSX.Element {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-1">
        <span className="inline-flex w-fit items-center rounded-full border border-mauve/30 bg-lime/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-coffee dark:border-lime/30 dark:bg-lime/10 dark:text-lime">
          Nuestros Servicios
        </span>
        <h2 className="text-lg font-bold tracking-tight">Instalaciones y comodidades</h2>
        <p className="text-sm text-tertiary dark:text-mauve-soft">
          Todo lo que necesitás para un partido de fútbol 5 con experiencia de predio premium.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((service, index) => (
          <FadeUp key={service.title} delayMs={index * 70} className="h-full">
            <div className="flex h-full flex-col gap-4 rounded-2xl border border-line bg-cream p-6 shadow-surface transition-all duration-300 hover:-translate-y-1 hover:border-lime/60 hover:shadow-xl dark:border-mauve dark:bg-coffee-elev">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-lime/10 text-lime">
                <service.icon />
              </span>
              <div className="space-y-2">
                <h3 className="text-base font-bold">{service.title}</h3>
                <p className="text-sm leading-relaxed text-tertiary dark:text-mauve-soft">
                  {service.description}
                </p>
              </div>
            </div>
          </FadeUp>
        ))}
      </div>
    </section>
  )
}

function DropletsIcon(): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-6"
      aria-hidden="true"
    >
      <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z" />
      <path d="M12.56 6.6A10.97 10.97 0 0014 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 01-11.91 4.97" />
    </svg>
  )
}

function MonitorIcon(): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-6"
      aria-hidden="true"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="m10 8 5 3-5 3z" />
      <path d="M8 21h8" />
      <path d="M12 17v4" />
    </svg>
  )
}

function CarIcon(): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-6"
      aria-hidden="true"
    >
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 002 12v4c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <path d="M9 17h6" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  )
}

function ZapIcon(): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-6"
      aria-hidden="true"
    >
      <path d="M4 14a1 1 0 01-.78-1.63l9.9-10.2a.5.5 0 01.86.46l-1.92 6.02A1 1 0 0013.03 10H20a1 1 0 01.78 1.63l-9.9 10.2a.5.5 0 01-.86-.46l1.92-6.02A1 1 0 0010.97 14z" />
    </svg>
  )
}

function GrassIcon(): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-6"
      aria-hidden="true"
    >
      <path d="M7 20h10" />
      <path d="M10 20c5.5-2.5.8-6.4 3-10" />
      <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
      <path d="M14.1 6a7 7 0 00-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
    </svg>
  )
}

function FlagIcon(): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-6"
      aria-hidden="true"
    >
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <path d="M4 22v-7" />
      <path d="M12 9 8 6" />
      <path d="M14 5 10 8" />
    </svg>
  )
}