import { Button } from '@heroui/react'
import { useNavigate } from 'react-router-dom'

function OffTargetIllustration(): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 280 180"
      role="img"
      aria-label="Pelota que pasa afuera del arco"
      className="mx-auto h-40 w-full max-w-xs"
    >
      {/* Césped */}
      <ellipse cx="140" cy="160" rx="122" ry="12" className="fill-[#c5d86d]/10" />

      {/* Arco */}
      <path
        d="M52 150V60h96v90"
        className="fill-none stroke-[#f3efe8]"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Red */}
      <g className="stroke-[#f3efe8]" strokeOpacity="0.22" strokeWidth="1">
        <path d="M52 75h96M52 90h96M52 105h96M52 120h96M52 135h96" />
        <path d="M64 60v90M76 60v90M88 60v90M100 60v90M112 60v90M124 60v90M136 60v90" />
      </g>

      {/* Trayectoria desviada */}
      <path
        d="M96 150C150 128 190 108 214 58"
        className="fill-none stroke-[#c5d86d]"
        strokeWidth="2.5"
        strokeDasharray="7 8"
        strokeLinecap="round"
      />
      <path
        d="M205 67l10-11 1 14"
        className="fill-none stroke-[#c5d86d]"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Pelota */}
      <circle cx="216" cy="48" r="20" className="fill-[#f3efe8] stroke-[#1a090d]" strokeWidth="1.5" />
      <path d="M216 39l6.5 5-2.5 7.5h-8L209.5 44z" className="fill-[#1a090d]" />
      <path
        d="M216 28v11M197 41l12.5 3M235 41l-12.5 3M203 62l6-10.5M229 62l-6-10.5"
        className="stroke-[#1a090d]"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function NotFoundView(): React.JSX.Element {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-[70vh] animate-fade-in-up flex-col items-center justify-center px-4 py-10 text-center">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-[#1a090d] p-8 shadow-2xl ring-1 ring-[#c5d86d]/20">
        <OffTargetIllustration />

        <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#c5d86d]/30 bg-[#c5d86d]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#c5d86d]">
          Error 404
        </span>

        <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-[#f3efe8] sm:text-3xl">
          ¡Pelota afuera! Página no encontrada
        </h1>

        <p className="mx-auto mt-3 max-w-md text-sm text-[#a89a9f] sm:text-base">
          La jugada no prosperó o el enlace al que intentás acceder ya no existe.
        </p>

        <div className="mt-7">
          <Button
            variant="primary"
            className="min-h-11 px-6 font-semibold"
            onPress={() => navigate('/')}
          >
            Volver al Inicio
          </Button>
        </div>
      </div>
    </div>
  )
}
