import { useMemo } from 'react'
import type { StandingRow } from '../../types'
import { assignCrestColors } from '../../utils/crest'
import TeamCrest from './TeamCrest'

export default function StandingsTable({
  rows,
  qualifying = 2,
}: {
  rows: StandingRow[]
  qualifying?: number
}): React.JSX.Element {
  const colorFor = useMemo(
    () => assignCrestColors(rows.map((row) => row.teamName)),
    [rows],
  )
  return (
    <div className="space-y-3">
      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {/* Sin overflow-hidden: el scroll vive en el wrapper de arriba. Si se
            recorta aqui, las columnas de la derecha quedan inaccesibles. */}
        <div className="min-w-0 rounded-2xl border border-line shadow-surface sm:min-w-[36rem] dark:border-mauve">
          <table className="w-full border-collapse bg-cream text-sm dark:bg-coffee-elev" aria-label="Posiciones del grupo">
          <thead className="rounded-t-2xl">
            <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-tertiary dark:border-mauve dark:text-mauve-soft">
              <th className="px-3 py-3 font-medium sm:px-4">#</th>
              <th className="px-3 py-3 font-medium sm:px-4">Equipo</th>
              <th className="px-3 py-3 text-center font-medium sm:px-4">PJ</th>
              <th className="hidden px-4 py-3 text-center font-medium md:table-cell">G</th>
              <th className="hidden px-4 py-3 text-center font-medium md:table-cell">E</th>
              <th className="hidden px-4 py-3 text-center font-medium md:table-cell">P</th>
              <th className="hidden px-4 py-3 text-center font-medium lg:table-cell">GF</th>
              <th className="hidden px-4 py-3 text-center font-medium lg:table-cell">GC</th>
              <th className="px-3 py-3 text-center font-medium sm:px-4">DG</th>
              <th className="px-3 py-3 text-center font-medium sm:px-4">Pts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line dark:divide-mauve/70">
            {rows.map((row) => {
              const qualified = row.position <= qualifying
              return (
                <tr
                  key={row.teamId}
                  className={
                    qualified
                      ? 'bg-lime/10 text-coffee dark:bg-lime/[0.15] dark:text-[#f3efe8]'
                      : 'text-coffee dark:text-[#f3efe8]'
                  }
                >
                  <td className="px-3 py-3 sm:px-4">
                    <span className="inline-flex items-center gap-1.5">
                      {qualified && <span className="size-1.5 rounded-full bg-lime" />}
                      {row.position}
                    </span>
                  </td>
                  <td className="px-3 py-3 sm:px-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <TeamCrest name={row.teamName} color={colorFor(row.teamName)} size="xs" />
                      <span className="min-w-0 truncate font-semibold text-coffee dark:text-[#f3efe8]/90">
                        {row.teamName}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center sm:px-4">{row.played}</td>
                  <td className="hidden px-4 py-3 text-center md:table-cell">{row.won}</td>
                  <td className="hidden px-4 py-3 text-center md:table-cell">{row.drawn}</td>
                  <td className="hidden px-4 py-3 text-center md:table-cell">{row.lost}</td>
                  <td className="hidden px-4 py-3 text-center lg:table-cell">{row.goalsFor}</td>
                  <td className="hidden px-4 py-3 text-center lg:table-cell">{row.goalsAgainst}</td>
                  <td className="px-3 py-3 text-center sm:px-4">{row.goalDifference}</td>
                  <td
                    className={
                      qualified
                        ? 'px-3 py-3 text-center font-semibold text-[#4d5a1e] sm:px-4 dark:text-lime'
                        : 'px-3 py-3 text-center font-semibold sm:px-4'
                    }
                  >
                    {row.points}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        </div>
      </div>
      {rows.length > 0 && (
        <p className="flex items-center gap-2 text-xs text-tertiary dark:text-mauve-soft">
          <span className="size-2 rounded-full bg-lime" />
          Las {qualifying} primeras posiciones avanzan a la fase final.
        </p>
      )}
    </div>
  )
}