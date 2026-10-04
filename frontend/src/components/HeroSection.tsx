import { Button } from '@heroui/react'
import { useNavigate } from 'react-router-dom'

/**
 * Portada de la home. Va antes de la grilla de reservas para dar jerarquia:
 * primero explica que es el complejo, despues ofrece reservar.
 *
 * La imagen es `public/images/canchas/nocturna.jpg`, la misma que ya usa
 * CourtGallery, para no duplicar el binario.
 */
export default function HeroSection(): React.JSX.Element {
  const navigate = useNavigate()

  function scrollToReservas(): void {
    const el = document.getElementById('reservas')
    if (el === null) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden rounded-3xl border border-line shadow-surface dark:border-white/10"
    >
      <img
        src="/images/canchas/nocturna.jpg"
        alt="Cancha de fútbol 5 iluminada de noche"
        className="absolute inset-0 -z-10 size-full object-cover"
        loading="eager"
        decoding="async"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#1a090d]/80 via-[#1a090d]/95 to-[#1a090d]" />

      <div className="flex flex-col items-start gap-5 px-5 py-10 sm:px-8 sm:py-14 md:py-20">
        <span className="inline-flex items-center gap-2 rounded-full border border-lime/40 bg-lime/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-lime">
          Copa 5 · Complejo Deportivo
        </span>

        <h1
          id="hero-title"
          className="max-w-2xl text-3xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-4xl md:text-5xl"
        >
          Viví el fútbol 5 al máximo nivel
        </h1>

        <p className="max-w-xl text-sm leading-relaxed text-[#f3efe8]/80 sm:text-base">
          Canchas techadas y descubiertas con césped sintético de última generación, iluminación LED
          y estacionamiento privado.
        </p>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button
            variant="primary"
            size="lg"
            className="min-h-12 w-full bg-lime font-bold text-coffee hover:opacity-90 sm:w-auto"
            onPress={scrollToReservas}
          >
            Reservar Turno
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="min-h-12 w-full border border-white/25 bg-white/10 font-semibold text-white hover:bg-white/20 sm:w-auto"
            onPress={() => navigate('/torneos')}
          >
            Ver Torneos
          </Button>
        </div>
      </div>
    </section>
  )
}