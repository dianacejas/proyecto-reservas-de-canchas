import { Button, Chip, Modal } from '@heroui/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { createTournamentRegistration } from '../../api'
import { getErrorMessage } from '../../api/client'
import type { CreateRegistrationInput } from '../../types'

const COLOR_OPTIONS = [
  '#2563eb',
  '#dc2626',
  '#ea580c',
  '#16a34a',
  '#9333ea',
  '#06b6d4',
  '#d97706',
  '#db2777',
]

const MIN_PLAYERS = 5
const MAX_PLAYERS = 10

interface RegistrationForm {
  teamName: string
  color: string
  captainName: string
  captainPhone: string
  players: string[]
}

const EMPTY_FORM: RegistrationForm = {
  teamName: '',
  color: COLOR_OPTIONS[3],
  captainName: '',
  captainPhone: '',
  players: Array.from({ length: MIN_PLAYERS }, () => ''),
}

export default function TournamentRegistrationModal({
  tournamentId,
  onClose,
}: {
  tournamentId: string
  onClose: () => void
}): React.JSX.Element {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<RegistrationForm>(EMPTY_FORM)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const mutation = useMutation({
    mutationFn: (input: CreateRegistrationInput) => createTournamentRegistration(tournamentId, input),
    onSuccess: () => {
      setSubmitted(true)
      setError(null)
      void queryClient.invalidateQueries({ queryKey: ['registrations', tournamentId] })
    },
    onError: (err) => setError(getErrorMessage(err)),
  })

  const trimmedPlayers = form.players.map((player) => player.trim()).filter((player) => player.length > 0)
  const isValid =
    form.teamName.trim().length >= 2 &&
    form.captainName.trim().length >= 2 &&
    form.captainPhone.trim().length >= 6 &&
    trimmedPlayers.length === form.players.length &&
    form.players.length >= MIN_PLAYERS

  function updatePlayer(index: number, value: string): void {
    setForm((prev) => {
      const players = [...prev.players]
      players[index] = value
      return { ...prev, players }
    })
  }

  function addPlayer(): void {
    setForm((prev) =>
      prev.players.length >= MAX_PLAYERS ? prev : { ...prev, players: [...prev.players, ''] },
    )
  }

  function removePlayer(index: number): void {
    setForm((prev) =>
      prev.players.length <= MIN_PLAYERS
        ? prev
        : { ...prev, players: prev.players.filter((_, i) => i !== index) },
    )
  }

  function handleSubmit(): void {
    if (!isValid || mutation.isPending) return
    mutation.mutate({
      teamName: form.teamName.trim(),
      color: form.color,
      captainName: form.captainName.trim(),
      captainPhone: form.captainPhone.trim(),
      players: form.players.map((player) => player.trim()),
    })
  }

  const inputClass =
    'w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-coffee outline-none transition-colors focus:border-lime dark:border-mauve dark:bg-coffee-elev dark:text-[#f3efe8]'

  return (
    <Modal.Root isOpen onOpenChange={(open) => open || onClose()}>
      <Modal.Backdrop variant="blur" />
      <Modal.Container size="lg">
        <Modal.Dialog>
          <Modal.Header>
            <Modal.Heading>Inscribir mi equipo</Modal.Heading>
            <Modal.CloseTrigger />
          </Modal.Header>
          <Modal.Body>
            {submitted ? (
              <div className="space-y-3 py-4 text-center">
                <Chip color="success" size="md">
                  Inscripción enviada
                </Chip>
                <p className="text-sm text-tertiary dark:text-mauve-soft">
                  Tu equipo quedó pendiente de aprobación. Un administrador lo confirmará y lo asignará a
                  un grupo.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-tertiary dark:text-mauve-soft">
                    Nombre del equipo
                  </label>
                  <input
                    type="text"
                    className={inputClass}
                    value={form.teamName}
                    onChange={(event) => setForm({ ...form, teamName: event.target.value })}
                    placeholder="Los Halcones"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-tertiary dark:text-mauve-soft">
                    Color del equipo
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_OPTIONS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        aria-label={`Color ${color}`}
                        onClick={() => setForm({ ...form, color })}
                        className={`size-8 rounded-full border-2 transition-transform ${
                          form.color === color
                            ? 'scale-110 border-coffee dark:border-[#f3efe8]'
                            : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-tertiary dark:text-mauve-soft">
                      Capitán
                    </label>
                    <input
                      type="text"
                      className={inputClass}
                      value={form.captainName}
                      onChange={(event) => setForm({ ...form, captainName: event.target.value })}
                      placeholder="Nombre y apellido"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-tertiary dark:text-mauve-soft">
                      Teléfono del capitán
                    </label>
                    <input
                      type="tel"
                      className={inputClass}
                      value={form.captainPhone}
                      onChange={(event) => setForm({ ...form, captainPhone: event.target.value })}
                      placeholder="3001234567"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <label className="text-xs font-medium uppercase tracking-wide text-tertiary dark:text-mauve-soft">
                      Jugadores ({form.players.length}/{MAX_PLAYERS})
                    </label>
                    <Button
                      size="sm"
                      variant="ghost"
                      isDisabled={form.players.length >= MAX_PLAYERS}
                      onPress={addPlayer}
                    >
                      + Agregar
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {form.players.map((player, index) => (
                      <div key={index} className="flex gap-2">
                        <span className="flex w-8 shrink-0 items-center justify-center text-xs font-semibold text-tertiary dark:text-mauve-soft">
                          {index + 1}
                        </span>
                        <input
                          type="text"
                          className={inputClass}
                          value={player}
                          onChange={(event) => updatePlayer(index, event.target.value)}
                          placeholder={`Jugador ${index + 1}`}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          isDisabled={form.players.length <= MIN_PLAYERS}
                          onPress={() => removePlayer(index)}
                        >
                          Quitar
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {error !== null && (
                  <Chip color="danger" size="sm" className="h-auto py-1">
                    {error}
                  </Chip>
                )}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {submitted ? (
              <Button variant="primary" className="min-h-11 w-full sm:w-auto" onPress={onClose}>
                Cerrar
              </Button>
            ) : (
              <>
                <Button
                  variant="secondary"
                  className="min-h-11 w-full sm:w-auto"
                  onPress={onClose}
                  isDisabled={mutation.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  className="min-h-11 w-full sm:w-auto"
                  isDisabled={!isValid || mutation.isPending}
                  onPress={handleSubmit}
                >
                  {mutation.isPending ? 'Enviando…' : 'Enviar inscripción'}
                </Button>
              </>
            )}
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Root>
  )
}
