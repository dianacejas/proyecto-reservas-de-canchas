import { Button, Chip } from '@heroui/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { deleteField, listFields, queryKeys } from '../../api'
import { getErrorMessage } from '../../api/client'
import ErrorState from '../common/ErrorState'
import Loading from '../common/Loading'
import { Pencil } from '../common/Icons'
import {
  resolveCourtDimensions,
  resolveCourtSportLabel,
  resolveCourtSurface,
} from '../../utils/slots'
import EditCourtModal from './EditCourtModal'
import type { Field } from '../../types'

interface AdminCourtsProps {
  onNotice: (kind: 'success' | 'danger', message: string) => void
}

export default function AdminCourts({ onNotice }: AdminCourtsProps): React.JSX.Element {
  const queryClient = useQueryClient()
  const courtsQuery = useQuery({ queryKey: queryKeys.fields(), queryFn: listFields })
  const [editingCourt, setEditingCourt] = useState<Field | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Field | null>(null)

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteField(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['courts'] })
      await queryClient.invalidateQueries({ queryKey: queryKeys.fields() })
      setPendingDelete(null)
      onNotice('success', 'Cancha eliminada con éxito.')
    },
    onError: (err) => {
      setPendingDelete(null)
      onNotice('danger', getErrorMessage(err))
    },
  })

  if (courtsQuery.isLoading) return <Loading label="Cargando canchas…" />
  if (courtsQuery.isError) {
    return (
      <ErrorState
        message={getErrorMessage(courtsQuery.error)}
        onRetry={() => void courtsQuery.refetch()}
      />
    )
  }

  const courts = courtsQuery.data ?? []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-400">
          {courts.length} canchas registradas
        </p>
      </div>

      {courts.length === 0 ? (
        <p className="py-8 text-center text-sm text-neutral-400">
          No hay canchas creadas.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border shadow-sm border-white/10 bg-neutral-900/50">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-b border-white/10 bg-neutral-900 text-neutral-300">
              <tr>
                <th className="px-4 py-3 font-semibold">Nombre</th>
                <th className="px-4 py-3 font-semibold">Tipo / Césped</th>
                <th className="px-4 py-3 font-semibold">Dimensiones</th>
                <th className="px-4 py-3 font-semibold">Iluminación</th>
                <th className="px-4 py-3 font-semibold">Cubierta</th>
                <th className="px-4 py-3 font-semibold">Precio/hora</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {courts.map((court) => {
                const isCovered = court.isCovered ?? court.type?.toLowerCase().includes('techad')
                const isActive = court.active ?? court.isActive ?? true

                return (
                  <tr key={court.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-medium text-white">
                      {court.name}
                    </td>
                    <td className="px-4 py-3 text-neutral-400">
                      <span className="font-semibold text-[#c5d86d]">{resolveCourtSportLabel(court)}</span>
                      <span className="ml-1.5 text-xs text-neutral-500">· {resolveCourtSurface(court)}</span>
                    </td>
                    <td className="px-4 py-3 text-neutral-400">
                      {resolveCourtDimensions(court)}
                    </td>
                    <td className="px-4 py-3 text-neutral-400">
                      {court.lighting || 'LED 500 Lux'}
                    </td>
                    <td className="px-4 py-3 text-neutral-400">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                          isCovered
                            ? 'bg-blue-100 text-blue-800 bg-blue-900/30 text-blue-300'
                            : 'bg-neutral-800 text-neutral-300'
                        }`}
                      >
                        {isCovered ? 'Techada' : 'Descubierta'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-white">
                      ${court.pricePerHour?.toLocaleString('es-AR')}
                    </td>
                    <td className="px-4 py-3">
                      <Chip color={isActive ? 'success' : 'warning'} size="sm">
                        {isActive ? 'Activa' : 'Inactiva'}
                      </Chip>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1.5 hover:border-neutral-400 border-white/20"
                          onPress={() => setEditingCourt(court)}
                        >
                          <Pencil className="w-4 h-4 text-neutral-300" />
                          <span>Editar</span>
                        </Button>
                        <Button
                          variant="danger-soft"
                          size="sm"
                          onPress={() => setPendingDelete(court)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de edición en vivo */}
      <EditCourtModal
        key={editingCourt?.id ?? 'closed'}
        court={editingCourt}
        isOpen={editingCourt !== null}
        onClose={() => setEditingCourt(null)}
        onSuccess={() => onNotice('success', 'Cancha actualizada con éxito.')}
      />

      {/* Modal de confirmación de eliminación */}
      {pendingDelete !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border p-6 shadow-xl border-white/10 bg-neutral-900">
            <h3 className="text-lg font-bold text-white">¿Eliminar cancha?</h3>
            <p className="mt-2 text-sm text-neutral-400">
              ¿Estás seguro de que querés eliminar <strong>{pendingDelete.name}</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" size="sm" onPress={() => setPendingDelete(null)}>
                Cancelar
              </Button>
              <Button
                variant="danger"
                size="sm"
                isDisabled={deleteMutation.isPending}
                onPress={() => deleteMutation.mutate(pendingDelete.id)}
              >
                {deleteMutation.isPending ? 'Eliminando…' : 'Eliminar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}