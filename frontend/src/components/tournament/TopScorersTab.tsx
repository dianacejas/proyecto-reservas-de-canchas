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

function playerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'JG'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

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
    <div className="space-y-5">
      {/* Podio Superior (Top 3) */}
      <div className="grid gap-4 sm:grid-cols-3">
        {podium.map((row, index) => {
          const tone = PODIUM_TONES[index]
          const isFirst = index === 0
          return (
            <div
              key={`${row.playerName}-${row.teamId}`}
              className={`relative flex flex-col justify-between overflow-hidden rounded-3xl border p-5 transition-all duration-200 hover:-translate-y-0.5 ${
                isFirst
                  ? 'border-[#c5d86d] bg-gradient-to-br from-neutral-900 via-neutral-900 to-[#c5d86d]/10 shadow-[0_0_25px_rgba(197,216,109,0.12)]'
                  : 'border-neutral-800 bg-neutral-900/75 shadow-sm hover:border-neutral-700'
              }`}
            >
              {/* Dorsal / Ranking gigante en marca de agua */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-3 top-1 select-none font-mono text-6xl font-black tracking-tighter text-white/[0.05]"
              >
                0{index + 1}
              </span>

              <div className="relative z-10 flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex size-9 items-center justify-center rounded-xl ${
                      isFirst
                        ? 'bg-[#c5d86d] text-neutral-950 shadow-sm'
                        : 'bg-neutral-800 text-neutral-300'
                    }`}
                    aria-hidden="true"
                  >
                    {tone.icon('size-4')}
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold ${
                      isFirst
                        ? 'bg-[#c5d86d]/20 text-[#c5d86d]'
                        : 'bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    {index + 1}° Puesto
                  </span>
                </div>
              </div>

              {/* Avatar circular con iniciales + escudo del equipo */}
              <div className="relative z-10 mt-4 flex items-center gap-3.5">
                <div className="relative shrink-0">
                  <div
                    className={`flex size-12 items-center justify-center rounded-full border text-sm font-black tracking-tight ${
                      isFirst
                        ? 'border-[#c5d86d] bg-[#c5d86d]/15 text-[#c5d86d]'
                        : 'border-neutral-700 bg-neutral-800 text-neutral-200'
                    }`}
                  >
                    {playerInitials(row.playerName)}
                  </div>
                  <div className="absolute -bottom-1 -right-1 rounded-full bg-neutral-950 p-0.5 ring-1 ring-neutral-800">
                    <TeamCrest name={row.teamName} color={colorFor(row.teamName)} size="xs" />
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => setSelectedPlayer(row.playerName)}
                    className="block w-full truncate text-left text-base font-black text-white transition-colors hover:text-[#c5d86d] cursor-pointer sm:text-lg"
                  >
                    {row.playerName}
                  </button>
                  <p className="mt-0.5 truncate text-xs font-semibold text-neutral-400">
                    {row.teamName}
                  </p>
                </div>
              </div>

              <div className="relative z-10 mt-4 flex items-center justify-between border-t border-neutral-800 pt-3">
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

      {/* Tabla Dinámica de Goleadores */}
      <div className="rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-900/70">
        <div className="overflow-x-auto">
          <table
            className="w-full border-collapse text-sm"
            aria-label="Tabla de goleadores"
          >
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-950/60 text-left text-xs uppercase tracking-wider text-neutral-400">
                <th className="px-3 py-3 font-bold sm:px-4">#</th>
                <th className="px-3 py-3 font-bold sm:px-4">Jugador</th>
                <th className="px-3 py-3 font-bold sm:px-4">Equipo</th>
                <th className="px-3 py-3 text-center font-bold sm:px-4">Goles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80">
              {rows.map((row, index) => {
                const isFirst = index === 0
                const isPodium = index < 3
                return (
                  <tr
                    key={`${row.playerName}-${row.teamId}`}
                    className={`transition-colors hover:bg-neutral-800/50 ${
                      isFirst
                        ? 'bg-[#c5d86d]/[0.08] text-white'
                        : 'text-white'
                    }`}
                  >
                    <td className="px-3 py-3 text-xs font-bold sm:px-4">
                      <span className="inline-flex items-center gap-1.5">
                        {isFirst ? (
                          <TrophyIcon className="size-3.5 text-[#c5d86d]" />
                        ) : isPodium ? (
                          <span className="size-1.5 rounded-full bg-[#c5d86d]" />
                        ) : null}
                        <span className={isFirst ? 'text-[#c5d86d] font-black' : 'text-neutral-300'}>
                          {row.rank}
                        </span>
                      </span>
                    </td>
                    <td className="px-3 py-3 font-semibold sm:px-4">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`inline-flex size-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold ${
                            isFirst
                              ? 'border-[#c5d86d]/50 bg-[#c5d86d]/15 text-[#c5d86d]'
                              : 'border-neutral-700 bg-neutral-800 text-neutral-300'
                          }`}
                        >
                          {playerInitials(row.playerName)}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedPlayer(row.playerName)}
                          className="truncate text-left font-bold text-white transition-colors hover:text-[#c5d86d] cursor-pointer"
                        >
                          {row.playerName}
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-3 sm:px-4">
                      <div className="flex items-center gap-2 sm:gap-2.5">
                        <TeamCrest name={row.teamName} color={colorFor(row.teamName)} size="xs" />
                        <span className="min-w-0 truncate text-xs font-medium text-neutral-300">
                          {row.teamName}
                        </span>
                      </div>
                    </td>
                    <td
                      className={`px-3 py-3 text-center text-sm font-black tabular-nums ${
                        isPodium ? 'text-[#c5d86d]' : 'text-white'
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
