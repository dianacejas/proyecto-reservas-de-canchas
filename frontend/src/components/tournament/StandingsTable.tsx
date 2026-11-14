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
    <div className="w-full space-y-3">
      {/* El scroll horizontal y el recorte de esquinas viven en la MISMA caja.
          Con `overflow` distinto de `visible` el navegador recorta el fondo de
          la tabla contra el radio; si el scroll queda en un wrapper externo, el
          `bg-cream` / `bg-coffee-elev` pinta las esquinas en angulo recto. */}
      <div className="overflow-x-auto rounded-xl border border-white/5">
        <table
          className="w-full border-collapse text-sm sm:min-w-[36rem] bg-neutral-900/60"
          aria-label="Posiciones del grupo"
        >
          <thead>
            <tr className="border-b text-left text-xs uppercase tracking-wider border-white/5 text-neutral-400">
              <th className="px-3 py-2 font-medium sm:px-4">#</th>
              <th className="px-3 py-2 font-medium sm:px-4">Equipo</th>
              <th className="px-3 py-2 text-center font-medium sm:px-4">PJ</th>
              <th className="hidden px-4 py-2 text-center font-medium md:table-cell">G</th>
              <th className="hidden px-4 py-2 text-center font-medium md:table-cell">E</th>
              <th className="hidden px-4 py-2 text-center font-medium md:table-cell">P</th>
              <th className="hidden px-4 py-2 text-center font-medium lg:table-cell">GF</th>
              <th className="hidden px-4 py-2 text-center font-medium lg:table-cell">GC</th>
              <th className="px-3 py-2 text-center font-medium sm:px-4">DG</th>
              <th className="hidden px-3 py-2 text-center font-medium sm:table-cell sm:px-4">Forma</th>
              <th className="px-3 py-2 text-center font-medium sm:px-4">Pts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((row) => {
              const qualified = row.position <= qualifying
              const totalGames = Math.max(row.played, 1)
              const winPct = Math.round((row.won / totalGames) * 100)
              const drawPct = Math.round((row.drawn / totalGames) * 100)
              return (
                <tr
                  key={row.teamId}
                  className={
                    qualified
                      ? 'bg-[#c5d86d]/[0.12] text-white'
                      : 'text-white'
                  }
                >
                  <td className="px-3 py-2 sm:px-4 text-xs font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      {qualified && <span className="size-1.5 rounded-full bg-[#c5d86d]" />}
                      {row.position}
                    </span>
                  </td>
                  <td className="px-3 py-2 sm:px-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <TeamCrest name={row.teamName} color={colorFor(row.teamName)} size="xs" className="w-6 h-6" />
                      <span className="min-w-0 truncate text-xs sm:text-sm font-semibold text-white">
                        {row.teamName}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center sm:px-4 text-xs font-medium">{row.played}</td>
                  <td className="hidden px-4 py-2 text-center md:table-cell text-xs font-medium">{row.won}</td>
                  <td className="hidden px-4 py-2 text-center md:table-cell text-xs font-medium">{row.drawn}</td>
                  <td className="hidden px-4 py-2 text-center md:table-cell text-xs font-medium">{row.lost}</td>
                  <td className="hidden px-4 py-2 text-center lg:table-cell text-xs font-medium">{row.goalsFor}</td>
                  <td className="hidden px-4 py-2 text-center lg:table-cell text-xs font-medium">{row.goalsAgainst}</td>
                  <td className="px-3 py-2 text-center sm:px-4 text-xs font-medium">{row.goalDifference}</td>
                  <td className="hidden px-3 py-2 sm:table-cell sm:px-4">
                    <div className="mx-auto flex w-20 items-center gap-1.5" title={`${row.won}G · ${row.drawn}E · ${row.lost}P`}>
                      <div className="flex h-2 w-full overflow-hidden rounded-full bg-neutral-800">
                        <div className="h-full bg-[#c5d86d]" style={{ width: `${winPct}%` }} />
                        <div className="h-full bg-amber-400" style={{ width: `${drawPct}%` }} />
                      </div>
                    </div>
                  </td>
                  <td
                    className={
                      qualified
                        ? 'px-3 py-2 text-center font-bold sm:px-4 text-[#c5d86d] text-xs sm:text-sm'
                        : 'px-3 py-2 text-center font-semibold sm:px-4 text-xs sm:text-sm'
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
        <p className="flex items-center gap-2 text-xs text-neutral-400">
          <span className="size-2 rounded-full bg-[#c5d86d]" />
          Las {qualifying} primeras posiciones avanzan a la fase final.
        </p>
      )}
    </div>
  )
}