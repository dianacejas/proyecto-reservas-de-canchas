import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { getDailyMetrics } from '../../api'
import { getErrorMessage } from '../../api/client'
import ErrorState from '../common/ErrorState'
import Loading from '../common/Loading'
import DateNav from '../booking/DateNav'
import type { DailyMetrics } from '../../types'
import { formatCurrency } from '../../utils/payments'
import { todayKey } from '../../utils/date'

const CARD =
  'rounded-xl border border-line bg-cream p-4 dark:border-mauve dark:bg-coffee-elev'
const LABEL = 'text-xs font-medium uppercase tracking-wide text-tertiary dark:text-mauve-soft'
const VALUE = 'text-2xl font-bold tracking-tight text-coffee dark:text-[#f3efe8]'
const ROW = 'flex items-center justify-between gap-3 text-sm'
const ROW_LABEL = 'text-tertiary dark:text-mauve-soft'
const ROW_VALUE = 'font-semibold text-coffee dark:text-[#f3efe8]'

export default function AdminMetrics(): React.JSX.Element {
  const [date, setDate] = useState(todayKey())

  const metricsQuery = useQuery({
    queryKey: ['admin-metrics', date],
    queryFn: () => getDailyMetrics(date),
  })

  if (metricsQuery.isLoading) return <Loading label="Calculando métricas del día…" />
  if (metricsQuery.isError) {
    return (
      <ErrorState
        message={getErrorMessage(metricsQuery.error)}
        onRetry={() => void metricsQuery.refetch()}
      />
    )
  }

  const metrics = metricsQuery.data
  if (metrics === undefined) return <Loading label="Calculando métricas del día…" />

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-tertiary dark:text-mauve-soft">
          Recaudación, saldo por cobrar y ocupación para la jornada seleccionada.
        </p>
        <DateNav date={date} onChange={setDate} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <RecaudacionCard metrics={metrics} />
        <SaldoCard metrics={metrics} />
        <OcupacionCard metrics={metrics} />
        <CancelacionesCard metrics={metrics} />
      </div>

      <div className={CARD}>
        <p className="text-sm font-semibold text-coffee dark:text-[#f3efe8]">Estados de turnos</p>
        <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-5">
          <div className={ROW}>
            <span className={ROW_LABEL}>Confirmados</span>
            <span className={ROW_VALUE}>{metrics.turnos.confirmadas}</span>
          </div>
          <div className={ROW}>
            <span className={ROW_LABEL}>Pendientes</span>
            <span className={ROW_VALUE}>{metrics.turnos.pendientes}</span>
          </div>
          <div className={ROW}>
            <span className={ROW_LABEL}>Pagados</span>
            <span className={ROW_VALUE}>{metrics.turnos.pagadas}</span>
          </div>
          <div className={ROW}>
            <span className={ROW_LABEL}>Bloqueos</span>
            <span className={ROW_VALUE}>{metrics.turnos.bloqueadas}</span>
          </div>
          <div className={ROW}>
            <span className={ROW_LABEL}>Cancelados</span>
            <span className={ROW_VALUE}>{metrics.turnos.canceladas}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function RecaudacionCard({ metrics }: { metrics: DailyMetrics }): React.JSX.Element {
  return (
    <div className={CARD}>
      <p className={LABEL}>Recaudación del día</p>
      <p className={VALUE}>{formatCurrency(metrics.recaudacion.total)}</p>
      <div className="mt-3 space-y-2">
        <div className={ROW}>
          <span className={ROW_LABEL}>Efectivo / mostrador</span>
          <span className={ROW_VALUE}>{formatCurrency(metrics.recaudacion.mostrador)}</span>
        </div>
        <div className={ROW}>
          <span className={ROW_LABEL}>Pasarela / Mercado Pago</span>
          <span className={ROW_VALUE}>{formatCurrency(metrics.recaudacion.pasarela)}</span>
        </div>
      </div>
    </div>
  )
}

function SaldoCard({ metrics }: { metrics: DailyMetrics }): React.JSX.Element {
  return (
    <div className={CARD}>
      <p className={LABEL}>Saldo por cobrar</p>
      <p className={VALUE}>{formatCurrency(metrics.saldoPorCobrar.saldoRestante)}</p>
      <div className="mt-3 space-y-2">
        <div className={ROW}>
          <span className={ROW_LABEL}>Señas abonadas</span>
          <span className={ROW_VALUE}>{formatCurrency(metrics.saldoPorCobrar.senasAbonadas)}</span>
        </div>
        <div className={ROW}>
          <span className={ROW_LABEL}>Saldo a cobrar en cancha</span>
          <span className={ROW_VALUE}>{formatCurrency(metrics.saldoPorCobrar.saldoRestante)}</span>
        </div>
      </div>
    </div>
  )
}

function OcupacionCard({ metrics }: { metrics: DailyMetrics }): React.JSX.Element {
  const porcentaje = metrics.ocupacion.porcentaje
  return (
    <div className={CARD}>
      <p className={LABEL}>Tasa de ocupación</p>
      <p className="text-2xl font-bold tracking-tight text-coffee dark:text-[#f3efe8]">
        {porcentaje}%
      </p>
      <p className="mt-1 text-sm text-tertiary dark:text-mauve-soft">
        {metrics.ocupacion.ocupados} de {metrics.ocupacion.totalTurnos} turnos ocupados
      </p>
      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-paper dark:bg-mauve-deep">
        <div
          className="h-full rounded-full bg-[#8ea63f] transition-all"
          style={{ width: `${porcentaje}%` }}
        />
      </div>
    </div>
  )
}

function CancelacionesCard({ metrics }: { metrics: DailyMetrics }): React.JSX.Element {
  return (
    <div className={CARD}>
      <p className={LABEL}>Cancelaciones</p>
      <p className={VALUE}>{metrics.cancelaciones.cantidad}</p>
      <div className="mt-3 space-y-2">
        <div className={ROW}>
          <span className={ROW_LABEL}>Turnos perdidos</span>
          <span className={ROW_VALUE}>{metrics.turnos.canceladas}</span>
        </div>
        <div className={ROW}>
          <span className={ROW_LABEL}>Monto no cobrado</span>
          <span className={ROW_VALUE}>{formatCurrency(metrics.cancelaciones.montoPerdido)}</span>
        </div>
      </div>
    </div>
  )
}