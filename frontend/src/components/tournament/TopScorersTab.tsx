import { useMemo, useState } from 'react'
import type { TopScorerRow } from '../../types'
import { assignCrestColors } from '../../utils/crest'
import { AwardIcon, MedalIcon, SoccerBallIcon, TrophyIcon } from '../common/Icons'
import PlayerProfileModal from './PlayerProfileModal'
import TeamCrest from './TeamCrest'

const PODIUM_TONES = [
  {
    icon: (className: string) => <TrophyIcon className={className} />,
  },
  {
    icon: (className: string) => <MedalIcon className={className} />,
  },
  {
    icon: (className: string) => <AwardIcon className={className} />,
  },
]

export default function TopScorersTab({
  rows,
  tournamentId,
}: {
  rows: TopScorerRow[]
  tournamentId?: string
}): React.JSX.Element {
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null)

  const colorFor = useMemo(
    () => assignCrestColors(rows.map((row) => row.teamName)),
    [rows],
  )

  if (rows.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-neutral-400">
        Todavía no hay goles registrados.
      </p>
    )
  }

  const podium = rows.slice(0, 3)

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        {podium.map((row, index) => {
          const tone = PODIUM_TONES[index]
          const isFirst = index === 0
          return (
            <div
              key={`${row.playerName}-${row.teamId}`}
              className={`relative flex flex-col justify-between overflow-hidden rounded-3xl border p-5 transition-all hover:-translate-y-0.5 ${
                isFirst
                  ? 'border-[#c5d86d] shadow-md bg-neutral-900/80'
                  : 'shadow-sm border-white/10 bg-neutral-900/60'
              }`}
            >
              {/* Dorsal / Ranking gigante en marca de agua */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-3 top-1 select-none font-mono text-6xl font-black tracking-tighter text-white/[0.06]"
              >
                0{index + 1}
              </span>

              <div className="relative z-10 flex items-center gap-2.5">
                <div
                  className={`flex size-10 items-center justify-center rounded-xl ${
                    isFirst
                      ? 'bg-[#c5d86d] text-neutral-950'
                      : 'bg-white/10 text-stone-300'
                  }`}
                  aria-hidden="true"
                >
                  {tone.icon('size-5')}
                </div>
                <span className="rounded-full bg-[#c5d86d]/15 px-2.5 py-0.5 text-xs font-extrabold text-[#c5d86d]">
                  {index + 1}° Goleador
                </span>
              </div>

              <div className="relative z-10 mt-4">
                <button
                  type="button"
                  onClick={() => setSelectedPlayer(row.playerName)}
                  className="block truncate text-left text-lg font-black text-white hover:text-[#c5d86d] cursor-pointer"
                >
                  {row.playerName}
                </button>
                <div className="mt-1.5 flex items-center gap-2">
                  <TeamCrest name={row.teamName} color={colorFor(row.teamName)} size="xs" />
                  <span className="truncate text-xs font-semibold text-neutral-400">
                    {row.teamName}
                  </span>
                </div>
              </div>

              <div className="relative z-10 mt-4 flex items-center justify-between border-t pt-3 border-white/10">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                  Total Anotados
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#c5d86d]/20 px-3 py-1 text-sm font-black tabular-nums text-[#c5d86d]">
                  <SoccerBallIcon className="size-3.5" />
                  <span>
                    {row.goalsCount} {row.goalsCount === 1 ? 'gol' : 'goles'}
                  </span>
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/5">
        <table
          className="w-full border-collapse text-sm bg-neutral-900/60"
          aria-label="Tabla de goleadores"
        >
          <thead>
            <tr className="border-b text-left text-xs uppercase tracking-wider border-white/5 text-neutral-400">
              <th className="px-3 py-2 font-medium sm:px-4">#</th>
              <th className="px-3 py-2 font-medium sm:px-4">Jugador</th>
              <th className="px-3 py-2 font-medium sm:px-4">Equipo</th>
              <th className="px-3 py-2 text-center font-medium sm:px-4">Goles</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {rows.map((row, index) => {
              const isPodium = index < 3
              return (
                <tr
                  key={`${row.playerName}-${row.teamId}`}
                  className={
                    isPodium
                      ? 'bg-[#c5d86d]/[0.12] text-white'
                      : 'text-white'
                  }
                >
                  <td className="px-3 py-2 sm:px-4 text-xs font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      {isPodium && (
                        <span className="size-1.5 rounded-full bg-[#c5d86d]" />
                      )}
                      {row.rank}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-semibold sm:px-4">
                    <button
                      type="button"
                      onClick={() => setSelectedPlayer(row.playerName)}
                      className="text-left font-semibold text-white hover:text-[#c5d86d] cursor-pointer"
                    >
                      {row.playerName}
                    </button>
                  </td>
                  <td className="px-3 py-2 sm:px-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <TeamCrest name={row.teamName} color={colorFor(row.teamName)} size="xs" />
                      <span className="min-w-0 truncate text-xs text-neutral-400">
                        {row.teamName}
                      </span>
                    </div>
                  </td>
                  <td
                    className={`px-3 py-2 text-center text-sm font-black tabular-nums ${
                      isPodium
                        ? 'text-[#c5d86d]'
                        : 'text-white'
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

      {tournamentId && (
        <PlayerProfileModal
          isOpen={selectedPlayer !== null}
          onClose={() => setSelectedPlayer(null)}
          tournamentId={tournamentId}
          playerId={selectedPlayer}
        />
      )}
    </div>
  )
}