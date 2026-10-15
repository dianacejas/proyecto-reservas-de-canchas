import { Button } from '@heroui/react'
import { useNavigate } from 'react-router-dom'

/**
 * Portada de la home. Va antes de la grilla de reservas para dar jerarquia:
 * primero explica que es el complejo, despues ofrece reservar.
 *
 * Layout split: la foto cubre todo el fondo pero se mantiene nitida a la
 * derecha; un degradado solido sobre el texto (izquierda) garantiza el
 * contraste y se desvanece a transparente hacia la foto.
 *
 * Foto: `imagenfondo-opt.jpg`, una copia optimizada (1920x1072, ~500 KB) de
 * `imagenfondo.jpg` (2752x1536, 3,7 MB). Se genera con resize + JPEG q82 para
 * no penalizar el LCP. El original queda en `public/images/canchas/` por si
 * hace falta re-optimizarlo.
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
      className="relative overflow-hidden rounded-3xl border border-neutral-300/60 bg-[#1e2a1b] shadow-lg dark:border-white/10 dark:bg-[#1a090d]"
    >
      {/* Imagen diurna de fondo + mascara de degradado */}
      <div className="absolute inset-0">
        <img
          src="/images/canchas/imagenfondo-opt.jpg"
          alt="Cancha de fútbol 5 con césped sintético"
          className="size-full object-cover object-center"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#172214] via-[#1b2718]/90 via-40% to-transparent dark:from-[#1a090d] dark:via-[#1a090d]/90" />
      </div>

      {/* Contenido textual */}
      <div className="relative z-10 flex max-w-xl flex-col items-start gap-4 p-8 sm:p-12">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#c5d86d]/40 bg-[#c5d86d]/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#c5d86d]">
          Copa 5 · Complejo Deportivo
        </span>

        <h1
          id="hero-title"
          className="text-3xl font-black leading-tight tracking-tight text-white sm:text-5xl"
        >
          Viví el fútbol 5 al máximo nivel
        </h1>

        <p className="text-sm leading-relaxed text-neutral-200 sm:text-base">
          Canchas techadas y descubiertas con césped sintético de última generación, iluminación LED
          y estacionamiento privado.
        </p>

        <div className="flex w-full flex-col gap-3 pt-2 sm:w-auto sm:flex-row sm:items-center">
          <Button
            variant="primary"
            size="lg"
            className="min-h-12 w-full bg-[#c5d86d] font-bold text-neutral-900 shadow-md transition-all hover:bg-[#b2c659] sm:w-auto"
            onPress={scrollToReservas}
          >
            Reservar Turno
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="min-h-12 w-full border border-white/25 bg-white/15 font-medium text-white backdrop-blur-sm transition-all hover:bg-white/25 sm:w-auto"
            onPress={() => navigate('/torneos')}
          >
            Ver Torneos
          </Button>
        </div>
      </div>
    </section>
  )
}
