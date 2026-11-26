import { Button } from '@heroui/react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRightIcon,
  ClockIcon,
  FlameIcon,
  MoonIcon,
  ShieldCheckIcon,
  StadiumIcon,
  SunIcon,
  TrophyIcon,
} from './common/Icons'

export type TimeBandFilter = 'todos' | 'tarde' | 'noche'
export type RoofFilter = 'todas' | 'techada' | 'descubierta'

interface HeroSectionProps {
  onQuickSearch?: (band: TimeBandFilter, roof: RoofFilter) => void
  freeSlotsCount?: number
}

export default function HeroSection({
  onQuickSearch,
  freeSlotsCount = 8,
}: HeroSectionProps): React.JSX.Element {
  const navigate = useNavigate()
  const [band, setBand] = useState<TimeBandFilter>('noche')
  const [roof, setRoof] = useState<RoofFilter>('todas')

  function scrollToReservas(): void {
    onQuickSearch?.(band, roof)
    const el = document.getElementById('reservas')
    if (el === null) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section
      aria-labelledby="hero-title"
      className="relative flex min-h-0 sm:min-h-[88vh] w-full flex-col justify-between overflow-hidden bg-neutral-950"
    >
      {/* Video de fondo cinemático con fallback a poster */}
      <video
        autoPlay
        loop
        muted
        playsInline
        poster="/images/canchas/imagenfondo-opt.jpg"
        className="absolute inset-0 z-0 h-full w-full object-cover opacity-40"
      >
        <source
          src="https://assets.mixkit.co/videos/preview/mixkit-soccer-player-taking-a-penalty-kick-40816-large.mp4"
          type="video/mp4"
        />
        <source src="/video-fondo.mp4" type="video/mp4" />
      </video>

      {/* Capa de gradiente direccional e iluminación sutil */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-neutral-950 via-neutral-950/85 to-neutral-950/35" />
      <div className="pointer-events-none absolute -top-32 left-1/4 z-10 size-96 rounded-full bg-[#c5d86d]/10 blur-3xl" />

      {/* Contenido principal en grid asimétrico */}
      <div className="relative z-20 mx-auto my-auto w-full max-w-7xl px-4 pt-8 pb-5 sm:px-6 sm:pt-16 sm:pb-10 lg:pt-20">
        <div className="grid items-center gap-8 sm:gap-10 lg:grid-cols-12">
          {/* Columna izquierda: Titular e identidad */}
          <div className="flex flex-col items-start gap-4 sm:gap-6 lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#c5d86d]/30 bg-[#c5d86d]/15 px-3 py-1 sm:px-3.5 sm:py-1.5 text-[11px] sm:text-xs font-bold text-neutral-100 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#c5d86d] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#c5d86d]" />
              </span>
              <FlameIcon className="size-3.5 text-[#c5d86d]" />
              <span>Alta demanda hoy · {freeSlotsCount} turnos disponibles en tiempo real</span>
            </div>

            <h1
              id="hero-title"
              className="text-3xl font-black tracking-tight text-white sm:text-6xl md:text-7xl leading-[1.08] sm:leading-[1.04]"
            >
              Tu partido.{' '}
              <span className="block text-[#c5d86d]">Reservado en segundos.</span>
            </h1>

            <p className="max-w-xl text-sm leading-relaxed text-neutral-300 sm:text-lg md:text-xl">
              Césped sintético FIFA Pro 60mm, iluminación LED 500 Lux y confirmación instantánea con el 50% de seña online.
            </p>

            <div className="grid w-full grid-cols-2 gap-2.5 pt-1 sm:flex sm:w-auto sm:flex-row sm:items-center sm:gap-3">
              <Button
                variant="primary"
                size="lg"
                className="min-h-11 sm:min-h-12 w-full gap-1.5 sm:gap-2 bg-[#c5d86d] px-3 sm:px-7 text-xs sm:text-base font-black text-neutral-950 shadow-[0_0_25px_rgba(197,216,109,0.3)] transition-all hover:bg-[#b5c85d] hover:shadow-[0_0_35px_rgba(197,216,109,0.5)] sm:w-auto"
                onPress={scrollToReservas}
              >
                <span>Reservar Cancha</span>
                <ArrowRightIcon className="size-3.5 sm:size-4 shrink-0" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="min-h-11 sm:min-h-12 w-full gap-1.5 sm:gap-2 border border-white/20 bg-white/5 px-3 sm:px-6 text-xs sm:text-base font-semibold text-white backdrop-blur-sm transition-all hover:border-[#c5d86d]/50 hover:bg-white/10 sm:w-auto"
                onPress={() => navigate('/torneos')}
              >
                <TrophyIcon className="size-3.5 sm:size-4 shrink-0 text-[#c5d86d]" />
                <span>Explorar Torneos</span>
              </Button>
            </div>
          </div>

          {/* Columna derecha: Tarjeta táctica en vivo (Broadcast HUD) */}
          <div className="hidden lg:col-span-5 lg:flex lg:justify-end">
            <div className="w-full max-w-sm rounded-3xl border border-white/15 bg-neutral-900/75 p-6 text-white shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-[#c5d86d]/15 text-[#c5d86d]">
                    <StadiumIcon className="size-5" />
                  </span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-[#c5d86d]">
                      Estado del Predio
                    </p>
                    <p className="text-sm font-extrabold text-white">Copa 5 · Córdoba</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#c5d86d]/15 px-2.5 py-1 text-[11px] font-bold text-[#c5d86d]">
                  <span className="size-1.5 rounded-full bg-[#c5d86d]" />
                  Abierto
                </span>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheckIcon className="size-4 text-[#c5d86d]" />
                    <span className="text-xs font-semibold text-neutral-200">Canchas Techadas</span>
                  </div>
                  <span className="text-xs font-black text-[#c5d86d]">100% Operativas</span>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <ClockIcon className="size-4 text-[#c5d86d]" />
                    <span className="text-xs font-semibold text-neutral-200">Franja Horaria</span>
                  </div>
                  <span className=" font-mono text-xs font-bold text-white">18:00 – 23:00 hs</span>
                </div>

                <div className="rounded-2xl border border-[#c5d86d]/30 bg-[#c5d86d]/10 p-3.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold uppercase tracking-wider text-[#c5d86d]">
                      Vaquita Express (÷ 10)
                    </span>
                    <span className="rounded bg-[#c5d86d] px-1.5 py-0.5 text-[10px] font-black text-neutral-950">
                      50% Seña
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-neutral-300">
                    Congelás el horario online y dividís el link de WhatsApp con tu equipo en un toque.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dock interactivo Quick-Book en la base del Hero */}
      <div className="relative z-20 mx-auto w-full max-w-7xl px-4 pb-6 sm:px-6 sm:pb-8">
        <div className="flex flex-col gap-3.5 sm:gap-4 rounded-2xl border border-white/15 bg-neutral-900/80 p-3.5 sm:p-4 shadow-2xl backdrop-blur-xl md:flex-row md:items-center md:justify-between md:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            {/* Selector de Franja */}
            <div>
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                1. Franja Horaria
              </span>
              <div className="grid w-full grid-cols-3 rounded-xl border border-white/10 bg-neutral-950/70 p-1 sm:inline-flex sm:w-auto">
                <button
                  type="button"
                  onClick={() => setBand('todos')}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-bold transition-colors ${
                    band === 'todos'
                      ? 'bg-[#c5d86d] text-neutral-950'
                      : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  Todas
                </button>
                <button
                  type="button"
                  onClick={() => setBand('tarde')}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-bold transition-colors ${
                    band === 'tarde'
                      ? 'bg-[#c5d86d] text-neutral-950'
                      : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  <SunIcon className="size-3.5 shrink-0" />
                  <span className="truncate">Tarde</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBand('noche')}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-bold transition-colors ${
                    band === 'noche'
                      ? 'bg-[#c5d86d] text-neutral-950'
                      : 'text-neutral-300 hover:text-white'
                  }`}
                >
                  <MoonIcon className="size-3.5 shrink-0" />
                  <span className="truncate">Noche</span>
                </button>
              </div>
            </div>

            {/* Selector de Cobertura */}
            <div>
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                2. Tipo de Cancha
              </span>
              <div className="grid w-full grid-cols-3 rounded-xl border border-white/10 bg-neutral-950/70 p-1 sm:inline-flex sm:w-auto">
                {(
                  [
                    { id: 'todas', label: 'Todas' },
                    { id: 'techada', label: 'Techada' },
                    { id: 'descubierta', label: 'Descubierta' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRoof(item.id)}
                    className={`rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-bold transition-colors ${
                      roof === item.id
                        ? 'bg-[#c5d86d] text-neutral-950'
                        : 'text-neutral-300 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            className="min-h-11 gap-2 rounded-xl bg-[#c5d86d] px-6 font-black text-neutral-950 hover:bg-[#b5c85d]"
            onPress={scrollToReservas}
          >
            <span>Filtrar Disponibilidad</span>
            <ArrowRightIcon className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}