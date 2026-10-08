import { Chip } from '@heroui/react'
import { useMemo } from 'react'
import type { SanctionRow } from '../../types'
import { assignCrestColors } from '../../utils/crest'
import TeamCrest from './TeamCrest'

function CardMark({ variant, count }: { variant: 'yellow' | 'red'; count: number }): React.JSX.Element {
  if (count === 0) {
    return <span className="text-xs text-tertiary dark:text-mauve-soft">—</span>
  }
  const tone = variant === 'yellow' ? 'bg-yellow-400' : 'bg-red-500'
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-block h-4 w-3 rounded-[3px] ${tone}`} />
      <span className="text-sm font-semibold text-coffee dark:text-[#f3efe8]">{count}</span>
    </span>
  )
}

export default function SanctionsList({ rows }: { rows: SanctionRow[] }): React.JSX.Element {
  const colorFor = useMemo(
    () => assignCrestColors(rows.map((row) => row.teamName)),
    [rows],
  )

  if (rows.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-tertiary dark:text-mauve-soft">
        No hay tarjetas registradas.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {rows.map((row) => (
          <li
            key={`${row.playerName}-${row.teamId}`}
            className="rounded-xl border border-line bg-cream p-3 shadow-surface dark:border-mauve dark:bg-coffee-elev"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                <TeamCrest name={row.teamName} color={colorFor(row.teamName)} size="xs" />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-coffee dark:text-[#f3efe8]">
                    {row.playerName}
                  </p>
                  <p className="truncate text-xs text-tertiary dark:text-mauve-soft">{row.teamName}</p>
                </div>
              </div>
              {row.suspended ? (
                <Chip color="danger" size="sm">
                  Suspendido
                </Chip>
              ) : (
                <Chip color="default" size="sm">
                  Habilitado
                </Chip>
              )}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-4 border-t border-line pt-2 dark:border-mauve/60">
              <span className="flex items-center gap-1.5">
                <span className="text-xs uppercase tracking-wide text-tertiary dark:text-mauve-soft">
                  Amarillas
                </span>
                <CardMark variant="yellow" count={row.yellowCards} />
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-xs uppercase tracking-wide text-tertiary dark:text-mauve-soft">
                  Rojas
                </span>
                <CardMark variant="red" count={row.redCards} />
              </span>
              {row.suspended && (
                <span className="text-xs text-red-600 dark:text-red-400">{row.reason}</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
