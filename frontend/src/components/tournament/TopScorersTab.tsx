import { useMemo } from 'react'
import type { TopScorerRow } from '../../types'
import { assignCrestColors } from '../../utils/crest'
import TeamCrest from './TeamCrest'

const MEDALS = ['🥇', '🥈', '🥉']

const PODIUM_TONES = [
  {
    ring: 'border-[#e8c15a]/50',
    glow: 'shadow-[0_0_26px_-10px_rgba(232,193,90,0.55)]',
    label: 'text-[#e8c15a]',
    goals: 'text-[#e8c15a]',
  },
  {
    ring: 'border-[#cdd2dc]/40',
    glow: 'shadow-[0_0_26px_-10px_rgba(205,210,220,0.5)]',
    label: 'text-[#cdd2dc]',
    goals: 'text-[#cdd2dc]',
  },
  {
    ring: 'border-[#d99a5b]/40',
    glow: 'shadow-[0_0_26px_-10px_rgba(217,154,91,0.5)]',
    label: 'text-[#d99a5b]',
    goals: 'text-[#d99a5b]',
  },
]

export default function TopScorersTab({ rows }: { rows: TopScorerRow[] }): React.JSX.Element {
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

  const podium = rows.slice(0, 3)

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {podium.map((row, index) => {
          const tone = PODIUM_TONES[index]
          return (
            <div
              key={`${row.playerName}-${row.teamId}`}
              className={`flex flex-col items-center gap-2 rounded-2xl border border-line bg-cream px-4 py-5 text-center shadow-surface dark:border-mauve dark:bg-coffee-elev ${tone.glow}`}
            >
              <span className="text-2xl leading-none" aria-hidden="true">
                {MEDALS[index]}
              </span>
              <span className={`text-[10px] font-black uppercase tracking-[0.25em] ${tone.label}`}>
                {index === 0 ? 'Máximo goleador' : `${index + 1}er goleador`}
              </span>
              <div
                className={`w-full rounded-xl border p-1.5 ${tone.ring}`}
                style={{ background: 'linear-gradient(to bottom, rgba(197,216,109,0.12), transparent)' }}
              >
                <p className="truncate text-base font-extrabold leading-tight text-coffee dark:text-[#f3efe8]">
                  {row.playerName}
                </p>
                <div className="mt-1 flex items-center justify-center gap-1.5">
                  <TeamCrest name={row.teamName} color={colorFor(row.teamName)} size="xs" />
                  <span className="truncate text-xs font-medium text-coffee/70 dark:text-mauve-soft">
                    {row.teamName}
                  </span>
                </div>
                <p className={`mt-1.5 text-sm font-black tabular-nums ${tone.goals}`}>
                  ⚽ {row.goalsCount} {row.goalsCount === 1 ? 'gol' : 'goles'}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="min-w-0 rounded-2xl border border-line shadow-surface dark:border-mauve">
          <table
            className="w-full border-collapse bg-cream text-sm dark:bg-coffee-elev"
            aria-label="Tabla de goleadores"
          >
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-tertiary dark:border-mauve dark:text-mauve-soft">
                <th className="px-3 py-3 font-medium sm:px-4">#</th>
                <th className="px-3 py-3 font-medium sm:px-4">Jugador</th>
                <th className="px-3 py-3 font-medium sm:px-4">Equipo</th>
                <th className="px-3 py-3 text-center font-medium sm:px-4">Goles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line dark:divide-mauve/70">
              {rows.map((row, index) => {
                const isPodium = index < 3
                return (
                  <tr
                    key={`${row.playerName}-${row.teamId}`}
                    className={
                      isPodium
                        ? 'bg-lime/10 text-coffee dark:bg-lime/[0.12] dark:text-[#f3efe8]'
                        : 'text-coffee dark:text-[#f3efe8]'
                    }
                  >
                    <td className="px-3 py-3 sm:px-4">
                      <span className="inline-flex items-center gap-1.5">
                        {isPodium && (
                          <span className="text-sm leading-none" aria-hidden="true">
                            {MEDALS[index]}
                          </span>
                        )}
                        {row.rank}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-semibold sm:px-4">{row.playerName}</td>
                    <td className="px-3 py-3 sm:px-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <TeamCrest name={row.teamName} color={colorFor(row.teamName)} size="xs" />
                        <span className="min-w-0 truncate text-coffee/80 dark:text-mauve-soft">
                          {row.teamName}
                        </span>
                      </div>
                    </td>
                    <td
                      className={`px-3 py-3 text-center text-base font-black tabular-nums ${
                        isPodium
                          ? 'text-[#4d5a1e] dark:text-lime'
                          : 'text-coffee dark:text-[#f3efe8]'
                      }`}
                    >
                      {row.goalsCount}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}