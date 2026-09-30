import { Card, Chip } from '@heroui/react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { listTournaments } from '../api'
import { getErrorMessage } from '../api/client'
import ErrorState from '../components/common/ErrorState'
import Loading from '../components/common/Loading'
import type { Tournament, TournamentStatus } from '../types'

const STATUS_META: Record<
  TournamentStatus,
  { label: string; color: 'success' | 'warning' | 'default' }
> = {
  inscripcion: { label: 'Inscripción abierta', color: 'success' },
  en_curso: { label: 'En curso', color: 'warning' },
  finalizado: { label: 'Finalizado', color: 'default' },
}

/**
 * Escena de cancha iluminada de noche como SVG embebido. Se usa en vez de una
 * URL remota para que el banner nunca dependa de la red ni muestre una imagen
 * rota: el <img> mantiene object-cover/opacity-30 y el zoom del hover.
 */
const BACKDROP_SRC = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="cielo" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#0d1a24"/>
        <stop offset="0.55" stop-color="#16323a"/>
        <stop offset="1" stop-color="#1d4038"/>
      </linearGradient>
      <radialGradient id="foco1" cx="0.22" cy="0.12" r="0.5">
        <stop offset="0" stop-color="#eaf6c8" stop-opacity="0.55"/>
        <stop offset="1" stop-color="#eaf6c8" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="foco2" cx="0.74" cy="0.05" r="0.45">
        <stop offset="0" stop-color="#eaf6c8" stop-opacity="0.42"/>
        <stop offset="1" stop-color="#eaf6c8" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="cesped" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#2f6b45"/>
        <stop offset="1" stop-color="#16351f"/>
      </linearGradient>
      <linearGradient id="franja" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#ffffff" stop-opacity="0.07"/>
        <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="600" fill="url(#cielo)"/>
    <rect width="1200" height="600" fill="url(#foco1)"/>
    <rect width="1200" height="600" fill="url(#foco2)"/>
    <rect y="300" width="1200" height="300" fill="url(#cesped)"/>
    <g fill="url(#franja)">
      <rect y="300" width="150" height="300"/>
      <rect y="300" width="150" height="300" transform="translate(300 0)"/>
      <rect y="300" width="150" height="300" transform="translate(600 0)"/>
      <rect y="300" width="150" height="300" transform="translate(900 0)"/>
    </g>
    <g stroke="#dff0c4" stroke-opacity="0.5" stroke-width="4" fill="none">
      <path d="M600 300v300"/>
      <circle cx="600" cy="450" r="95"/>
      <path d="M0 300h1200"/>
      <path d="M180 300v180h130"/>
      <path d="M1020 300v180H890"/>
    </g>
    <g fill="#0b1620" opacity="0.85">
      <rect x="120" y="96" width="150" height="10" rx="5"/>
      <rect x="880" y="72" width="150" height="10" rx="5"/>
    </g>
    <g fill="#f4ffd9" opacity="0.9">
      <circle cx="140" cy="101" r="7"/><circle cx="170" cy="101" r="7"/><circle cx="200" cy="101" r="7"/><circle cx="230" cy="101" r="7"/>
      <circle cx="900" cy="77" r="7"/><circle cx="930" cy="77" r="7"/><circle cx="960" cy="77" r="7"/><circle cx="990" cy="77" r="7"/>
    </g>
  </svg>`,
)}`

function TeamsIcon(): React.JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" className="size-4 shrink-0">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function PinIcon(): React.JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" className="size-4 shrink-0">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function TrophyIcon(): React.JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" className="size-4 shrink-0">
      <path d="M6 4h12v5a6 6 0 0 1-12 0V4Z" />
      <path d="M6 6H3v1a4 4 0 0 0 4 4" />
      <path d="M18 6h3v1a4 4 0 0 1-4 4" />
      <path d="M9 21h6" />
      <path d="M12 15v6" />
    </svg>
  )
}

function BallIcon(): React.JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" className="size-4 shrink-0">
      <circle cx="12" cy="12" r="9" />
      <path d="m12 7 3.5 2.5-1.3 4.1h-4.4L8.5 9.5 12 7Z" />
      <path d="M12 3v4M20.5 9.5 15.5 9.5M8.7 17.9l1.1-4.3M17.2 18.6l-3-4.9" />
    </svg>
  )
}

function ArrowIcon(): React.JSX.Element {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" className="size-4 transition-transform duration-300 group-hover:translate-x-1">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  )
}

/** Marca de agua: trofeo gigante en la esquina inferior derecha. */
function TrophyWatermark(): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className="pointer-events-none absolute -right-6 -bottom-10 size-56 -rotate-12 text-white/5 sm:size-72 md:-right-8 md:size-80"
    >
      <path d="M6 3h12v6a6 6 0 0 1-12 0V3Z" />
      <path d="M6 5H3v2a4 4 0 0 0 4 4" />
      <path d="M18 5h3v2a4 4 0 0 1-4 4" />
      <path d="M10 15h4v4h-4z" />
      <path d="M8 21h8" />
      <path d="M8 21l1-2h6l1 2" />
    </svg>
  )
}

/** Datos clave del torneo. Usa los contadores del backend cuando existen. */
function buildFacts(tournament: Tournament): { icon: React.JSX.Element; label: string }[] {
  const facts: { icon: React.JSX.Element; label: string }[] = [
    {
      icon: <TeamsIcon />,
      label:
        tournament.teamsCount !== undefined
          ? `${tournament.teamsCount} ${tournament.teamsCount === 1 ? 'Equipo' : 'Equipos'} participantes`
          : 'Equipos por confirmar',
    },
    { icon: <PinIcon />, label: 'Canchas techadas y descubiertas' },
    { icon: <TrophyIcon />, label: 'Premios y Trofeo Copa 5' },
  ]

  if (tournament.matchesCount !== undefined) {
    facts.splice(1, 0, {
      icon: <BallIcon />,
      label: `${tournament.matchesCount} partidos programados`,
    })
  }

  return facts
}

export default function TorneosPage(): React.JSX.Element {
  const tournamentsQuery = useQuery({ queryKey: ['tournaments'], queryFn: listTournaments })

  if (tournamentsQuery.isLoading) return <Loading label="Cargando torneos…" />
  if (tournamentsQuery.isError) {
    return (
      <ErrorState
        message={getErrorMessage(tournamentsQuery.error)}
        onRetry={() => void tournamentsQuery.refetch()}
      />
    )
  }

  const tournaments = tournamentsQuery.data ?? []

  return (
    <div className="space-y-8">
      <header>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-mauve/30 bg-lime/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-coffee dark:border-lime/30 dark:bg-lime/10 dark:text-lime">
          Copa 5 · Competencia
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Torneos</h1>
        <p className="mt-1 text-sm text-tertiary dark:text-mauve-soft">
          Seguí las posiciones y el fixture de cada torneo.
        </p>
      </header>

      {tournaments.length === 0 ? (
        <p className="py-8 text-center text-sm text-tertiary dark:text-mauve-soft">
          Todavía no hay torneos creados.
        </p>
      ) : (
        <div className="grid gap-4">
          {tournaments.map((tournament) => {
            const meta = STATUS_META[tournament.status]
            const facts = buildFacts(tournament)
            return (
              <Card.Root
                key={tournament.id}
                className="group relative overflow-hidden border border-white/10 shadow-xl transition-colors duration-300 hover:border-lime/50 hover:shadow-lime/10"
              >
                <img
                  src={BACKDROP_SRC}
                  alt=""
                  aria-hidden="true"
                  decoding="async"
                  className="absolute inset-0 size-full object-cover opacity-30 transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 z-10 bg-gradient-to-r from-coffee via-coffee/90 to-transparent" />
                <TrophyWatermark />

                <Card.Content className="relative z-20 flex flex-col gap-4 p-5 sm:p-6 md:p-7">
                  <div className="flex flex-wrap items-center gap-2">
                    <Chip color={meta.color} size="sm" className="font-semibold">
                      {meta.label}
                    </Chip>
                    <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/85 backdrop-blur-sm">
                      Fútbol 5 · Grupos y Eliminación
                    </span>
                  </div>

                  <div className="min-w-0">
                    <h2 className="text-2xl font-black tracking-wide text-white md:text-3xl">
                      {tournament.name}
                    </h2>
                    <p className="mt-1 text-sm text-white/60">
                      Fase de grupos y eliminatorias por elimination directa.
                    </p>
                  </div>

                  <ul className="flex flex-wrap gap-x-6 gap-y-2">
                    {facts.map((fact) => (
                      <li
                        key={fact.label}
                        className="flex items-center gap-2 text-sm text-white/75"
                      >
                        <span className="text-lime">{fact.icon}</span>
                        {fact.label}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-1 flex flex-wrap items-center gap-3">
                    <span className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-lime px-6 text-sm font-bold uppercase tracking-[0.1em] text-coffee shadow-lg transition-colors duration-300 group-hover:bg-white sm:w-auto">
                      Explorar Torneo
                      <ArrowIcon />
                    </span>
                    <span className="text-xs uppercase tracking-[0.14em] text-white/45">
                      Fixture · Posiciones · Eliminatorias
                    </span>
                  </div>
                </Card.Content>

                {/* Link estirado sobre Card.Root para cubrir toda la tarjeta,
                    sin anidar controles interactivos. */}
                <Link
                  to={`/torneos/${tournament.id}`}
                  className="absolute inset-0 z-30 rounded-[inherit] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-lime"
                >
                  <span className="sr-only">
                    Explorar {tournament.name}: fixture, posiciones y eliminatorias
                  </span>
                </Link>
              </Card.Root>
            )
          })}
        </div>
      )}
    </div>
  )
}