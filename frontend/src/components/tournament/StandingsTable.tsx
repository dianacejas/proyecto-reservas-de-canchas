import type { StandingRow } from '../../types'

export default function StandingsTable({
  rows,
  qualifying = 2,
}: {
  rows: StandingRow[]
  qualifying?: number
}): React.JSX.Element {
  return (
    <div className="space-y-3">
      <div className="overflow-hidden overflow-x-auto rounded-2xl border border-line shadow-surface dark:border-mauve">
        <table className="w-full border-collapse bg-cream text-sm dark:bg-coffee-elev" aria-label="Posiciones del grupo">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-tertiary dark:border-mauve dark:text-mauve-soft">
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Equipo</th>
              <th className="px-4 py-3 text-center font-medium">PJ</th>
              <th className="px-4 py-3 text-center font-medium">G</th>
              <th className="px-4 py-3 text-center font-medium">E</th>
              <th className="px-4 py-3 text-center font-medium">P</th>
              <th className="px-4 py-3 text-center font-medium">GF</th>
              <th className="px-4 py-3 text-center font-medium">GC</th>
              <th className="px-4 py-3 text-center font-medium">DG</th>
              <th className="px-4 py-3 text-center font-medium">Pts</th>
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
                      ? 'bg-lime/10 text-coffee dark:bg-lime/10 dark:text-[#f3efe8]'
                      : 'text-coffee dark:text-[#f3efe8]'
                  }
                >
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5">
                      {qualified && <span className="size-1.5 rounded-full bg-lime" />}
                      {row.position}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">{row.teamName}</td>
                  <td className="px-4 py-3 text-center">{row.played}</td>
                  <td className="px-4 py-3 text-center">{row.won}</td>
                  <td className="px-4 py-3 text-center">{row.drawn}</td>
                  <td className="px-4 py-3 text-center">{row.lost}</td>
                  <td className="px-4 py-3 text-center">{row.goalsFor}</td>
                  <td className="px-4 py-3 text-center">{row.goalsAgainst}</td>
                  <td className="px-4 py-3 text-center">{row.goalDifference}</td>
                  <td
                    className={
                      qualified
                        ? 'px-4 py-3 text-center font-semibold text-[#4d5a1e] dark:text-lime'
                        : 'px-4 py-3 text-center font-semibold'
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
      {rows.length > 0 && (
        <p className="flex items-center gap-2 text-xs text-tertiary dark:text-mauve-soft">
          <span className="size-2 rounded-full bg-lime" />
          Las {qualifying} primeras posiciones avanzan a la fase final.
        </p>
      )}
    </div>
  )
}