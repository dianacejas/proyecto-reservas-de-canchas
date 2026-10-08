import { useMemo } from 'react'
import type { ScorerRow } from '../../types'
import { assignCrestColors } from '../../utils/crest'
import TeamCrest from './TeamCrest'

export default function ScorersTable({ rows }: { rows: ScorerRow[] }): React.JSX.Element {
  const colorFor = useMemo(
    () => assignCrestColors(rows.map((row) => row.teamName)),
    [rows],
  )

  if (rows.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-tertiary dark:text-mauve-soft">
        Todavía no hay goles registrados.
      </p>
    )
  }

  return (
    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <div className="min-w-0 rounded-2xl border border-line shadow-surface dark:border-mauve">
        <table className="w-full border-collapse bg-cream text-sm dark:bg-coffee-elev" aria-label="Tabla de goleadores">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-tertiary dark:border-mauve dark:text-mauve-soft">
              <th className="px-3 py-3 font-medium sm:px-4">#</th>
              <th className="px-3 py-3 font-medium sm:px-4">Jugador</th>
              <th className="px-3 py-3 font-medium sm:px-4">Equipo</th>
              <th className="px-3 py-3 text-center font-medium sm:px-4">Goles</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line dark:divide-mauve/70">
            {rows.map((row) => (
              <tr key={`${row.playerName}-${row.teamId}`} className="text-coffee dark:text-[#f3efe8]">
                <td className="px-3 py-3 sm:px-4">{row.position}</td>
                <td className="px-3 py-3 font-semibold sm:px-4">{row.playerName}</td>
                <td className="px-3 py-3 sm:px-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <TeamCrest name={row.teamName} color={colorFor(row.teamName)} size="xs" />
                    <span className="min-w-0 truncate text-coffee/80 dark:text-mauve-soft">
                      {row.teamName}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-3 text-center text-base font-bold text-[#4d5a1e] sm:px-4 dark:text-lime">
                  {row.goals}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
