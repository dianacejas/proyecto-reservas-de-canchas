import { useState } from 'react'
import { WHATSAPP_HREF, WhatsAppIcon } from '../whatsapp/WhatsAppButton'

interface Location {
  name: string
  address: string
  lat: number
  lng: number
  hours: string
}

const LOCATIONS: Location[] = [
  {
    name: 'Sede Barrio Jardín',
    address: 'Av. Armada Argentina 6200, Barrio Jardín, Córdoba Capital',
    lat: -31.3941,
    lng: -64.1484,
    hours: 'Lun a Dom · 09:00 a 02:00',
  },
  {
    name: 'Sede Alta Córdoba',
    address: 'Av. Patria 470, Alta Córdoba, Córdoba Capital',
    lat: -31.414,
    lng: -64.194,
    hours: 'Lun a Dom · 10:00 a 01:00',
  },
  {
    name: 'Sede Cerro de las Rosas',
    address: 'Av. Rafael Núñez 4200, Cerro de las Rosas, Córdoba Capital',
    lat: -31.374,
    lng: -64.244,
    hours: 'Lun a Dom · 09:00 a 02:00',
  },
  {
    name: 'Sede Nueva Córdoba',
    address: 'Buenos Aires 697, Nueva Córdoba, Córdoba Capital',
    lat: -31.4212,
    lng: -64.1861,
    hours: 'Lun a Vie · 14:00 a 01:00 · Sáb/Dom · 10:00 a 02:00',
  },
  {
    name: 'Sede Villa Urquiza',
    address: 'Av. Amuchástegui 1500, Villa Urquiza, Córdoba Capital',
    lat: -31.396,
    lng: -64.218,
    hours: 'Lun a Dom · 09:00 a 01:00',
  },
]

const mapsEmbedUrl = (location: Location): string =>
  `https://maps.google.com/maps?q=${location.lat},${location.lng}&z=15&output=embed`

const directionsUrl = (location: Location): string =>
  `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`

export default function LocationSection(): React.JSX.Element {
  const [location] = useState<Location>(
    () => LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)] ?? LOCATIONS[0],
  )

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
          Ubicación <span className="text-neutral-400 font-light">|</span>{' '}
          <span className="text-[#c5d86d]">y sedes</span>
        </h2>
        <p className="max-w-2xl text-base md:text-lg leading-relaxed text-neutral-400">
          Canchas en Córdoba Capital en zonas estratégicas de fácil acceso y estacionamiento.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="relative min-h-72 overflow-hidden rounded-2xl border shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] border-white/10">
          <iframe
            key={`${location.lat},${location.lng}`}
            src={mapsEmbedUrl(location)}
            title={`Mapa - ${location.name}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 h-full w-full border-0 grayscale-[0.15] contrast-[1.03] grayscale-[0.35] brightness-[0.8]"
          />
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] border-white/10 bg-neutral-900/50 lg:col-span-2">
          <div>
            <h3 className="text-lg font-extrabold text-white">{location.name}</h3>
            <p className="mt-1 flex items-start gap-2 text-sm text-neutral-400">
              <PinIcon />
              {location.address}
            </p>
            <p className="mt-2 flex items-start gap-2 text-sm text-neutral-400">
              <ClockIcon />
              {location.hours}
            </p>
          </div>

          <div className="mt-auto grid grid-cols-2 gap-2.5 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
            <a
              href={directionsUrl(location)}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-stone-900 text-white hover:bg-stone-800 font-bold px-3.5 sm:px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm"
            >
              <DirectionsIcon />
              Cómo llegar
            </a>
            <a
              href={directionsUrl(location).replace('/dir/', '/maps/')}
              target="_blank"
              rel="noopener noreferrer"
              className="border font-semibold px-3.5 sm:px-4 py-2.5 rounded-xl transition-colors border-white/20 bg-white/5 text-white hover:bg-white/10 flex items-center justify-center text-xs sm:text-sm"
            >
              Ver en Maps
            </a>
            <a
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="col-span-2 sm:col-span-1 bg-[#25D366] text-white hover:bg-[#20ba5a] font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm"
            >
              <WhatsAppIcon className="size-4" />
              Consultar por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

function PinIcon(): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-0.5 size-4 shrink-0 text-lime"
      aria-hidden="true"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0116 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function ClockIcon(): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-0.5 size-4 shrink-0 text-lime"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  )
}

function DirectionsIcon(): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-4"
      aria-hidden="true"
    >
      <path d="M3 11l19-9-9 19-2-8-8-2z" />
    </svg>
  )
}