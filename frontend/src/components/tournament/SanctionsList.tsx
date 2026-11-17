import { useMemo } from 'react'
import type { SanctionRow } from '../../types'
import { assignCrestColors } from '../../utils/crest'
import TeamCrest from './TeamCrest'

function playerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'JG'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

function RefereeCardBadge({
  variant,
  label,
  count,
}: {
  variant: 'yellow' | 'red'
  label: string
  count: number
}): React.JSX.Element {
  const isYellow = variant === 'yellow'
  const cardClasses = isYellow
    ? 'bg-amber-400 border-amber-300/70 shadow-[0_0_8px_rgba(251,191,36,0.35)]'
    : 'bg-red-500 border-red-400/70 shadow-[0_0_8px_rgba(239,68,68,0.4)]'

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 ${
        count > 0
          ? 'border-neutral-800 bg-neutral-950/80 text-white'
          : 'border-neutral-800/60 bg-neutral-950/40 text-neutral-500 opacity-60'
      }`}
    >
      <span
        aria-hidden="true"
        className={`inline-block h-4 w-3 shrink-0 rounded-[3px] border ${cardClasses}`}
      />
      <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
        {label}
      </span>
      <span className="font-mono text-sm font-black tabular-nums">
        {count}
      </span>
    </div>
  )
}

export default function SanctionsList({ rows }: { rows: SanctionRow[] }): React.JSX.Element {
  const colorFor = useMemo(
    () => assignCrestColors(rows.map((row) => row.teamName)),
    [rows],
  )

  if (rows.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-neutral-400">
        No hay tarjetas registradas en el torneo.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <ul className="grid gap-3 sm:grid-cols-2">
        {rows.map((row) => (
          <li
            key={`${row.playerName}-${row.teamId}`}
            className={`rounded-2xl border p-4 shadow-sm transition-colors ${
              row.suspended
                ? 'border-neutral-800 border-l-4 border-l-red-500 bg-neutral-900/90 hover:bg-neutral-900'
                : 'border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800/40'
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative shrink-0">
                  <div className="flex size-10 items-center justify-center rounded-full border border-neutral-700 bg-neutral-800 text-xs font-black text-neutral-200">
                    {playerInitials(row.playerName)}
                  </div>
                  <div className="absolute -bottom-1 -right-1 rounded-full bg-neutral-950 p-0.5 ring-1 ring-neutral-800">
                    <TeamCrest name={row.teamName} color={colorFor(row.teamName)} size="xs" />
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-white sm:text-base">
                    {row.playerName}
                  </p>
                  <p className="truncate text-xs font-medium text-neutral-400">
                    {row.teamName}
                  </p>
                </div>
              </div>

              {row.suspended ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/25 bg-red-500/10 px-2.5 py-1 text-xs font-bold text-red-400">
                  <span className="size-1.5 rounded-full bg-red-400" />
                  Suspendido
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-400">
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  Habilitado
                </span>
              )}
            </div>

            <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-neutral-800/80 pt-3">
              <div className="flex flex-wrap items-center gap-2">
                <RefereeCardBadge variant="yellow" label="Amarillas" count={row.yellowCards} />
                <RefereeCardBadge variant="red" label="Rojas" count={row.redCards} />
              </div>

              {row.suspended && row.reason && (
                <span className="rounded-lg bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-400">
                  {row.reason}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
