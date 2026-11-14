import { Button } from '@heroui/react'
import { useNavigate } from 'react-router-dom'
import { ArrowRightIcon, BoltIcon, ShieldCheckIcon, TrophyIcon } from './common/Icons'

export default function HeroSection(): React.JSX.Element {
  const navigate = useNavigate()

  function scrollToReservas(): void {
    const el = document.getElementById('reservas')
    if (el === null) return
    const y = el.getBoundingClientRect().top + window.scrollY - 96
    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' })
  }

  return (
    <section
      aria-labelledby="hero-title"
      className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900 shadow-[0_24px_60px_-15px_rgba(0,0,0,0.75)]"
    >
      {/* Imagen de fondo con gradiente direccional Dark SaaS */}
      <div className="absolute inset-0">
        <img
          src="/images/canchas/imagenfondo-opt.jpg"
          alt="Cancha de fútbol 5 con césped sintético"
          className="size-full object-cover object-center opacity-55"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/90 to-neutral-950/35" />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 -top-24 size-96 rounded-full bg-[#c5d86d]/10 blur-3xl"
        />
      </div>

      {/* Layout asimétrico: propuesta de valor + métricas rápidas */}
      <div className="relative z-10 grid items-center gap-8 p-7 sm:p-12 lg:grid-cols-[1.25fr_0.9fr] lg:gap-10">
        <div className="flex flex-col items-start gap-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#c5d86d]/35 bg-[#c5d86d]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#c5d86d]">
            <span className="size-2 animate-pulse rounded-full bg-[#c5d86d]" />
            Turnos en vivo · 09:00 a 00:00
          </span>

          <h1
            id="hero-title"
            className="text-3xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl"
          >
            Viví el fútbol 5{' '}
            <span className="text-[#c5d86d]">al máximo nivel</span>
          </h1>

          <p className="max-w-xl text-sm leading-relaxed text-neutral-300 sm:text-base">
            Canchas techadas y descubiertas con césped sintético FIFA Pro, iluminación LED 500 Lux,
            vestuarios equipados y reserva online instantánea.
          </p>

          <div className="flex w-full flex-col gap-3 pt-2 sm:w-auto sm:flex-row sm:items-center">
            <Button
              variant="primary"
              size="lg"
              className="min-h-12 w-full bg-[#c5d86d] px-6 font-bold text-neutral-950 shadow-[0_10px_28px_-8px_rgba(197,216,109,0.65)] transition-all hover:bg-[#b5c85d] sm:w-auto"
              onPress={scrollToReservas}
            >
              <span>Reservar Turno</span>
              <ArrowRightIcon className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="min-h-12 w-full border border-white/20 bg-neutral-950/60 px-6 font-semibold text-white backdrop-blur-md transition-all hover:border-white/40 hover:bg-neutral-900/80 sm:w-auto"
              onPress={() => navigate('/torneos')}
            >
              <TrophyIcon className="size-4 text-[#c5d86d]" />
              <span>Ver Torneos</span>
            </Button>
          </div>
        </div>

        {/* Tarjeta glassmórfica de indicadores rápidos */}
        <div className="hidden rounded-2xl border border-white/10 bg-neutral-950/75 p-5 backdrop-blur-md lg:grid lg:gap-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-400">
            Experiencia Copa 5
          </p>
          <div className="grid gap-3">
            <div className="flex items-center gap-3 rounded-xl border border-neutral-800/80 bg-neutral-900/80 p-3.5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#c5d86d]/15 text-[#c5d86d]">
                <BoltIcon className="size-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-white">Reserva instantánea 24/7</p>
                <p className="text-xs text-neutral-400">Disponibilidad real y seña online del 50%</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-neutral-800/80 bg-neutral-900/80 p-3.5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#c5d86d]/15 text-[#c5d86d]">
                <TrophyIcon className="size-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-white">Torneos y Playoffs en vivo</p>
                <p className="text-xs text-neutral-400">Tablas, goleadores, minuta y llaves</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-neutral-800/80 bg-neutral-900/80 p-3.5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#c5d86d]/15 text-[#c5d86d]">
                <ShieldCheckIcon className="size-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-white">Pagos protegidos</p>
                <p className="text-xs text-neutral-400">Mercado Pago Checkout Pro y comprobante</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
