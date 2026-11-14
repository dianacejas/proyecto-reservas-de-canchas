import { Button, Chip, Modal, Spinner } from '@heroui/react'
import { useQuery } from '@tanstack/react-query'
import { getPlayerStats } from '../../api'
import { assignCrestColors } from '../../utils/crest'
import { RedCard, SoccerBallIcon, YellowCard } from '../common/Icons'
import TeamCrest from './TeamCrest'

interface PlayerProfileModalProps {
  isOpen: boolean
  onClose: () => void
  tournamentId: string
  playerId: string | null
}

export default function PlayerProfileModal({
  isOpen,
  onClose,
  tournamentId,
  playerId,
}: PlayerProfileModalProps): React.JSX.Element {
  const {
    data: stats,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['player-stats', tournamentId, playerId],
    queryFn: () => getPlayerStats(tournamentId, playerId!),
    enabled: Boolean(isOpen && tournamentId && playerId),
    staleTime: 1000 * 60 * 5,
  })

  const teamColor = stats?.teamName ? assignCrestColors([stats.teamName])(stats.teamName) : '#c5d86d'

  return (
    <Modal.Root isOpen={isOpen} onOpenChange={(open) => open || onClose()}>
      <Modal.Backdrop variant="blur" />
      <Modal.Container size="sm">
        <Modal.Dialog className="border border-white/10 bg-neutral-900">
          <Modal.Header>
            <Modal.Heading className="text-lg font-bold text-white">
              Ficha del Jugador
            </Modal.Heading>
            <Modal.CloseTrigger />
          </Modal.Header>
          <Modal.Body>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <Spinner size="lg" color="accent" />
                <p className="text-xs text-neutral-400">Cargando estadísticas...</p>
              </div>
            ) : isError || !stats ? (
              <div className="py-6 text-center">
                <p className="text-sm text-neutral-400">
                  No se pudieron obtener las estadísticas de este jugador.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-neutral-800/60 p-3.5">
                  <TeamCrest name={stats.teamName || 'Equipo'} color={teamColor} size="md" />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-extrabold text-white">
                      {stats.playerName}
                    </h3>
                    <p className="text-xs font-medium text-neutral-400">
                      {stats.teamName || 'Sin equipo asignado'}
                    </p>
                  </div>
                  {stats.rank !== null && stats.rank !== undefined && (
                    <Chip
                      size="sm"
                      variant="soft"
                      className="font-black bg-[#c5d86d]/20 text-[#c5d86d]"
                    >
                      #{stats.rank} Goleador
                    </Chip>
                  )}
                </div>

                {/* Grid de Estadísticas */}
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  <div className="flex flex-col items-center justify-center rounded-xl border p-3 text-center border-white/10 bg-neutral-800/60">
                    <span className="text-xs font-semibold text-neutral-400">Partidos</span>
                    <span className="text-xl font-black text-white tabular-nums mt-0.5">
                      {stats.matchesPlayed}
                    </span>
                  </div>

                  <div className="flex flex-col items-center justify-center rounded-xl border border-[#c5d86d]/40 bg-[#c5d86d]/10 p-3 text-center">
                    <span className="text-xs font-semibold text-[#c5d86d]">Goles</span>
                    <span className="inline-flex items-center gap-1.5 text-xl font-black text-[#c5d86d] tabular-nums mt-0.5">
                      <SoccerBallIcon className="size-4" />
                      {stats.goalsCount}
                    </span>
                  </div>

                  <div className="flex flex-col items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-center">
                    <span className="text-xs font-semibold text-amber-400">Amarillas</span>
                    <span className="inline-flex items-center gap-1.5 text-xl font-black text-amber-300 tabular-nums mt-0.5">
                      <YellowCard />
                      {stats.yellowCards}
                    </span>
                  </div>

                  <div className="flex flex-col items-center justify-center rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-center">
                    <span className="text-xs font-semibold text-red-400">Rojas</span>
                    <span className="inline-flex items-center gap-1.5 text-xl font-black text-red-300 tabular-nums mt-0.5">
                      <RedCard />
                      {stats.redCards}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="secondary"
              className="min-h-10 w-full"
              onPress={onClose}
            >
              Cerrar
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Root>
  )
}
