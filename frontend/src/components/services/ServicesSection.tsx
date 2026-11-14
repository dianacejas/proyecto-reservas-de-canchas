import FadeUp from '../common/FadeUp'

interface Service {
  title: string
  description: string
  tag: string
  spanClass: string
  featured?: boolean
  icon: () => React.JSX.Element
}

const SERVICES: Service[] = [
  {
    title: 'Buffet, Parrillas & Tercer Tiempo',
    description:
      'Bar deportivo climatizado con pantallas gigantes para ver torneos internacionales, bebidas heladas, sector de asadores y mesas grupales para el post-partido.',
    tag: 'Gastronomía & Quincho',
    spanClass: 'lg:col-span-7',
    featured: true,
    icon: MonitorIcon,
  },
  {
    title: 'Iluminación LED 500 Lux',
    description:
      'Torres con proyectores profesionales anti-encandilamiento para partidos nocturnos con visibilidad de estadio.',
    tag: 'Visibilidad Nocturna',
    spanClass: 'lg:col-span-5',
    icon: ZapIcon,
  },
  {
    title: 'Vestuarios y Duchas Premium',
    description:
      'Agua caliente presurizada, lockers individuales y vestuarios higienizados de forma continua.',
    tag: 'Confort',
    spanClass: 'lg:col-span-4',
    icon: DropletsIcon,
  },
  {
    title: 'Estacionamiento Privado 24/7',
    description:
      'Predio cerrado con monitoreo por cámaras y acceso directo a las canchas.',
    tag: 'Seguridad',
    spanClass: 'lg:col-span-4',
    icon: CarIcon,
  },
  {
    title: 'Árbitros, Planilleros y Césped Pro',
    description:
      'Organización integral de torneos con estadísticas en vivo, goleadores y caucho amortiguado.',
    tag: 'Competencia Oficial',
    spanClass: 'lg:col-span-4',
    icon: FlagIcon,
  },
]

export default function ServicesSection(): React.JSX.Element {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white">
          Instalaciones <span className="text-neutral-400 font-light">|</span>{' '}
          <span className="text-[#c5d86d]">y comodidades</span>
        </h2>
        <p className="max-w-2xl text-base md:text-lg leading-relaxed text-neutral-400">
          Todo lo que necesitás para un partido de fútbol 5 con experiencia de predio profesional.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-12">
        {SERVICES.map((service, index) => (
          <FadeUp key={service.title} delayMs={index * 70} className={`h-full ${service.spanClass}`}>
            <div
              className={`group flex h-full flex-col justify-between gap-5 rounded-3xl border p-6 transition-all duration-300 hover:-translate-y-1 ${
                service.featured
                  ? 'border-[#c5d86d]/30 bg-neutral-900/80'
                  : 'border-white/10 bg-neutral-900/50 hover:border-[#c5d86d]/60'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-[#c5d86d]/30 bg-[#c5d86d]/15 transition-transform duration-300 group-hover:scale-105">
                  <span className="size-6 text-[#c5d86d] stroke-[2.2]">
                    <service.icon />
                  </span>
                </span>
                <span className="rounded-full bg-[#c5d86d]/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#c5d86d]">
                  {service.tag}
                </span>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-extrabold tracking-tight text-white">
                  {service.title}
                </h3>
                <p className="text-sm leading-relaxed text-neutral-400">
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