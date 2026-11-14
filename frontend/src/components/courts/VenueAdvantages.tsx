import FadeUp from '../common/FadeUp'

function ClockFastIcon(): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-6 shrink-0"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function MobileCheckIcon(): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-6 shrink-0"
      aria-hidden="true"
    >
      <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
      <path d="m9 12 2 2 4-4" />
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
      className="size-6 shrink-0"
      aria-hidden="true"
    >
      <path d="M4 20c1.5-6 4-10 6-12 1 3 2 7 2 12" />
      <path d="M10 20c2-8 5-13 8-15 1 4 1 9 1 15" />
      <path d="M2 20h20" />
    </svg>
  )
}

function GrillIcon(): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-6 shrink-0"
      aria-hidden="true"
    >
      <path d="M3 11h18a9 9 0 0 1-18 0z" />
      <path d="M7 11v8" />
      <path d="M17 11v8" />
      <path d="M12 11v8" />
      <path d="M8 7a2 2 0 0 1 2-2 2 2 0 0 0 2-2" />
      <path d="M12 7a2 2 0 0 1 2-2 2 2 0 0 0 2-2" />
    </svg>
  )
}

export default function VenueAdvantages(): React.JSX.Element {
  return (
    <section aria-label="Ventajas competitivas del predio" className="w-full space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#c5d86d]/30 bg-[#c5d86d]/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#c5d86d]">
            Estándar Copa 5
          </span>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-white md:text-4xl">
            Pensado para jugar <span className="text-neutral-400 font-light">|</span>{' '}
            <span className="text-[#c5d86d]">sin fricciones</span>
          </h2>
        </div>
        <p className="max-w-md text-sm text-neutral-400">
          Tecnología de reserva en tiempo real combinada con infraestructura profesional en cada cancha.
        </p>
      </div>

      {/* Bento Grid Asimétrico */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        {/* Tarjeta Flagship (7 columnas) */}
        <FadeUp delayMs={0} className="md:col-span-7">
          <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-neutral-950 p-7 text-white shadow-xl">
            <div className="pointer-events-none absolute -right-12 -bottom-12 size-64 rounded-full bg-[#c5d86d]/15 blur-3xl" />

            <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex size-12 items-center justify-center rounded-2xl border border-[#c5d86d]/30 bg-[#c5d86d]/15 text-[#c5d86d]">
                <GrassIcon />
              </div>
              <span className="rounded-full bg-[#c5d86d] px-3 py-1 text-xs font-black uppercase tracking-wider text-neutral-950">
                Homologación FIFA Pro
              </span>
            </div>

            <div className="relative z-10 mt-6 grid gap-6 sm:grid-cols-2 sm:items-end">
              <div>
                <h3 className="text-2xl font-black tracking-tight text-white">
                  Césped Sintético 60mm Bicolor
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-300">
                  Fibra monofilamento con memoria elástica y base amortiguada de caucho granulado que reduce el impacto articular.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur-sm">
                <span className="block text-3xl font-black tabular-nums text-[#c5d86d]">
                  +1.200
                </span>
                <span className="mt-0.5 block text-xs font-semibold text-neutral-300">
                  Partidos y turnos disputados cada mes en el complejo
                </span>
              </div>
            </div>
          </div>
        </FadeUp>

        {/* Tarjeta 2 (5 columnas) */}
        <FadeUp delayMs={60} className="md:col-span-5">
          <div className="group flex h-full flex-col justify-between rounded-3xl border border-white/10 bg-neutral-900/60 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#c5d86d]">
            <div className="flex items-center justify-between">
              <div className="flex size-12 items-center justify-center rounded-2xl border border-[#c5d86d]/30 bg-[#c5d86d]/15 text-[#c5d86d]">
                <ClockFastIcon />
              </div>
              <span className="rounded-full border border-white/10 bg-neutral-800 px-2.5 py-1 text-[11px] font-bold text-neutral-300">
                SSE Live Sync
              </span>
            </div>
            <div className="mt-6">
              <h3 className="text-lg font-extrabold tracking-tight text-white">
                Disponibilidad y Clima en Tiempo Real
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-neutral-400">
                Grilla sincronizada al segundo con pronóstico meteorológico integrado para que elijas cancha techada o descubierta con certeza.
              </p>
            </div>
          </div>
        </FadeUp>

        {/* Tarjeta 3 (6 columnas) */}
        <FadeUp delayMs={120} className="md:col-span-6">
          <div className="group flex h-full flex-col justify-between rounded-3xl border border-white/10 bg-neutral-900/60 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#c5d86d]">
            <div className="flex items-center justify-between">
              <div className="flex size-12 items-center justify-center rounded-2xl border border-[#c5d86d]/30 bg-[#c5d86d]/15 text-[#c5d86d]">
                <MobileCheckIcon />
              </div>
              <span className="rounded-full bg-[#c5d86d]/20 px-2.5 py-1 text-[11px] font-bold text-[#c5d86d]">
                50% Seña Online
              </span>
            </div>
            <div className="mt-5">
              <h3 className="text-lg font-extrabold tracking-tight text-white">
                Reservá sin Llamar y Armá la Vaquita
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-neutral-400">
                Congelás el turno al instante y compartís el ticket deportivo por WhatsApp con el monto exacto dividido entre los 10 jugadores.
              </p>
            </div>
          </div>
        </FadeUp>

        {/* Tarjeta 4 (6 columnas) */}
        <FadeUp delayMs={180} className="md:col-span-6">
          <div className="group flex h-full flex-col justify-between rounded-3xl border border-white/10 bg-neutral-900/60 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#c5d86d]">
            <div className="flex items-center justify-between">
              <div className="flex size-12 items-center justify-center rounded-2xl border border-[#c5d86d]/30 bg-[#c5d86d]/15 text-[#c5d86d]">
                <GrillIcon />
              </div>
              <span className="rounded-full border border-white/10 bg-neutral-800 px-2.5 py-1 text-[11px] font-bold text-neutral-300">
                Post-Partido
              </span>
            </div>
            <div className="mt-5">
              <h3 className="text-lg font-extrabold tracking-tight text-white">
                Tercer Tiempo Asegurado en el Predio
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-neutral-400">
                Quincho equipado con parrillas, buffet con pantallas gigantes, vestuarios climatizados y estacionamiento privado vigilado.
              </p>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  )
}
