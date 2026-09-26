import { useState } from 'react'
import { WhatsAppLink } from '../whatsapp/WhatsAppButton'

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
    <section className="space-y-4">
      <div className="flex flex-col gap-1">
        <span className="inline-flex w-fit items-center rounded-full border border-mauve/30 bg-lime/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-coffee dark:border-lime/30 dark:bg-lime/10 dark:text-lime">
          Ubicación y Contacto
        </span>
        <h2 className="text-lg font-bold tracking-tight">Encontrá la sede más cerca</h2>
        <p className="text-sm text-tertiary dark:text-mauve-soft">
          Al recargar la página mostramos una de nuestras sedes de Córdoba Capital al azar.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="relative min-h-72 overflow-hidden rounded-2xl border border-line shadow-surface dark:border-mauve">
          <iframe
            key={`${location.lat},${location.lng}`}
            src={mapsEmbedUrl(location)}
            title={`Mapa - ${location.name}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 h-full w-full border-0 grayscale-[0.15] contrast-[1.03] dark:grayscale-[0.35] dark:brightness-[0.8]"
          />
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-line bg-cream p-6 shadow-surface dark:border-mauve dark:bg-coffee-elev lg:col-span-2">
          <div>
            <h3 className="text-base font-bold">{location.name}</h3>
            <p className="mt-1 flex items-start gap-2 text-sm text-tertiary dark:text-mauve-soft">
              <PinIcon />
              {location.address}
            </p>
            <p className="mt-2 flex items-start gap-2 text-sm text-tertiary dark:text-mauve-soft">
              <ClockIcon />
              {location.hours}
            </p>
          </div>

          <div className="mt-auto flex flex-wrap items-center gap-3">
            <a
              href={directionsUrl(location)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-lime px-4 py-2 text-sm font-semibold text-coffee transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            >
              <DirectionsIcon />
              Cómo llegar
            </a>
            <a
              href={directionsUrl(location).replace('/dir/', '/maps/')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-mauve/40 px-4 py-2 text-sm font-medium text-coffee transition-colors hover:border-lime dark:text-[#f3efe8]"
            >
              Ver en Maps
            </a>
            <WhatsAppLink label="Consultar por WhatsApp" />
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