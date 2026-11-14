import { Alert, Button, Chip } from '@heroui/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { confirmSandboxPayment, queryKeys } from '../api'
import { getErrorMessage } from '../api/client'
import Loading from '../components/common/Loading'
import { ClockIcon } from '../components/common/Icons'
import { WhatsAppIcon } from '../components/whatsapp/WhatsAppButton'
import type { Payment } from '../types'

export default function PagoResultadoPage(): React.JSX.Element {
  const { status, paymentId } = useParams<{ status?: string; paymentId?: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [sandboxResult, setSandboxResult] = useState<Payment | null>(null)
  const [sandboxError, setSandboxError] = useState<string | null>(null)

  const isSandbox = Boolean(paymentId)
  const mpPaymentId = searchParams.get('payment_id') || searchParams.get('collection_id')

  const sandboxMutation = useMutation({
    mutationFn: (id: string) => confirmSandboxPayment(id),
    onSuccess: (payment) => {
      setSandboxResult(payment)
      void queryClient.invalidateQueries({ queryKey: queryKeys.bookings() })
      void queryClient.invalidateQueries({ queryKey: queryKeys.myBookings() })
    },
    onError: (err) => {
      setSandboxError(getErrorMessage(err))
    },
  })

  const { mutate: mutateSandbox } = sandboxMutation

  useEffect(() => {
    if (isSandbox && paymentId) {
      mutateSandbox(paymentId)
    }
  }, [isSandbox, paymentId, mutateSandbox])

  if (isSandbox && sandboxMutation.isPending) {
    return <Loading label="Confirmando pago en pasarela sandbox…" />
  }

  const isSuccess = status === 'ok' || sandboxResult !== null
  const isPending = status === 'pendiente'
  const isError = status === 'error' || sandboxError !== null

  return (
    <div className="mx-auto max-w-lg py-8">
      <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.4)] sm:p-8">
        {isSuccess && (
          <div className="space-y-5 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#c5d86d]/15 text-[#c5d86d]">
              <svg className="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <Chip color="success" size="sm" className="mb-2">Pago completado</Chip>
              <h1 className="text-2xl font-bold tracking-tight text-white">¡Tu reserva está confirmada!</h1>
              <p className="mt-2 text-sm text-neutral-400">
                {isSandbox
                  ? 'El pago simulado fue aprobado con éxito y el turno ya se encuentra asegurado.'
                  : 'Recibimos tu pago correctamente. Te enviamos el comprobante con los detalles a tu casilla de correo.'}
              </p>
              {mpPaymentId && (
                <p className="mt-2 font-mono text-xs text-neutral-400">
                  Comprobante MP: #{mpPaymentId}
                </p>
              )}
            </div>
            <div className="flex flex-col items-center justify-center gap-3 pt-2">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  [
                    '¡Hay partido en Copa 5!',
                    'Fecha: Próximo turno confirmado',
                    'Cancha: Copa 5 Complejo Deportivo',
                    'Ubicación: https://www.google.com/maps/search/?api=1&query=Copa+5+Complejo+Deportivo+C%C3%B3rdoba',
                    '¡Seña abonada! Entrá a armar el equipo para dividir el saldo en cancha.',
                    '¡Confirmen asistencia!',
                  ].join('\n')
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-full bg-[#25d366] px-6 text-sm font-bold text-white shadow-md transition-all hover:bg-[#20ba59] hover:shadow-lg sm:w-auto"
              >
                <WhatsAppIcon className="size-5" />
                Convocar equipo por WhatsApp
              </a>

              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:justify-center">
                <Button
                  variant="primary"
                  className="min-h-11 w-full sm:w-auto"
                  onPress={() => navigate('/mis-reservas')}
                >
                  Ver mis reservas
                </Button>
                <Button
                  variant="secondary"
                  className="min-h-11 w-full sm:w-auto"
                  onPress={() => navigate('/')}
                >
                  Volver al inicio
                </Button>
              </div>
            </div>
          </div>
        )}

        {isPending && (
          <div className="space-y-5 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-amber-500/15 text-amber-400">
              <ClockIcon className="size-7" />
            </div>
            <div>
              <Chip color="warning" size="sm" className="mb-2">En proceso</Chip>
              <h1 className="text-2xl font-bold tracking-tight text-white">Pago pendiente de acreditación</h1>
              <p className="mt-2 text-sm text-neutral-400">
                Tu pago está siendo procesado por el medio seleccionado. En cuanto se acredite, la reserva quedará confirmada automáticamente.
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-center">
              <Button variant="primary" className="min-h-11 w-full sm:w-auto" onPress={() => navigate('/mis-reservas')}>
                Ir a Mis Reservas
              </Button>
              <Button variant="secondary" className="min-h-11 w-full sm:w-auto" onPress={() => navigate('/')}>
                Volver al inicio
              </Button>
            </div>
          </div>
        )}

        {isError && (
          <div className="space-y-5 text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-danger/15 text-danger">
              <svg className="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
            <div>
              <Chip color="danger" size="sm" className="mb-2">No completado</Chip>
              <h1 className="text-2xl font-bold tracking-tight text-white">No pudimos procesar tu pago</h1>
              <p className="mt-2 text-sm text-neutral-400">
                {sandboxError ?? 'La operación fue cancelada o rechazada. El turno no ha sido confirmado.'}
              </p>
            </div>
            <div className="pt-2">
              <Button
                variant="primary"
                className="min-h-11 w-full sm:w-auto"
                onPress={() => navigate('/')}
              >
                Volver a la grilla de reservas
              </Button>
            </div>
          </div>
        )}

        {!isSuccess && !isPending && !isError && (
          <div className="space-y-4 text-center">
            <Alert status="warning">
              <Alert.Description>Estado de pago desconocido o incompleto.</Alert.Description>
            </Alert>
            <Link
              to="/"
              className="inline-block text-sm font-semibold underline text-[#c5d86d]"
            >
              Volver al inicio
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
