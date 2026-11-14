import { Button } from '@heroui/react'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { getDailyMetrics } from '../../api'
import { getErrorMessage } from '../../api/client'
import ErrorState from '../common/ErrorState'
import { FileTextIcon } from '../common/Icons'
import Loading from '../common/Loading'
import DateNav from '../booking/DateNav'
import type { DailyMetrics } from '../../types'
import { formatCurrency } from '../../utils/payments'
import { todayKey } from '../../utils/date'

const CARD =
  'rounded-2xl border border-neutral-800 bg-neutral-900/90 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.4)] transition-all hover:border-neutral-700'
const LABEL = 'text-xs font-bold uppercase tracking-wider text-neutral-400'
const VALUE = 'mt-1 text-3xl font-black tracking-tight text-white'
const SUB_BOX =
  'mt-4 space-y-2 rounded-xl border border-neutral-800/60 bg-neutral-950/60 p-3'
const ROW = 'flex items-center justify-between gap-3 text-xs sm:text-sm'
const ROW_LABEL = 'text-neutral-400'
const ROW_VALUE = 'font-bold text-neutral-200 tabular-nums'

export default function AdminMetrics(): React.JSX.Element {
  const [date, setDate] = useState(todayKey())

  const metricsQuery = useQuery({
    queryKey: ['admin-metrics', date],
    queryFn: () => getDailyMetrics(date),
  })

  function handleDownloadPDF(): void {
    window.print()
  }

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
        <p className="text-sm text-neutral-400">
          Recaudación, saldo por cobrar y ocupación para la jornada seleccionada.
        </p>
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <Button
            variant="outline"
            size="sm"
            onPress={handleDownloadPDF}
            className="flex items-center gap-1.5 border-neutral-700 bg-neutral-900 text-neutral-200 hover:border-neutral-500 hover:text-white"
          >
            <FileTextIcon className="size-4 text-[#c5d86d]" />
            <span>Descargar PDF</span>
          </Button>
          <DateNav date={date} onChange={setDate} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <RecaudacionCard metrics={metrics} />
        <SaldoCard metrics={metrics} />
        <OcupacionCard metrics={metrics} />
        <CancelacionesCard metrics={metrics} />
      </div>

      <div className={CARD}>
        <p className="text-sm font-bold uppercase tracking-wider text-neutral-300">
          Estados de turnos
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <div className="rounded-xl border border-neutral-800/80 bg-neutral-950/70 p-3 text-center">
            <span className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-neutral-400">
              <span className="size-2 rounded-full bg-[#c5d86d]" />
              Confirmados
            </span>
            <p className="mt-1 text-xl font-black text-white tabular-nums">
              {metrics.turnos.confirmadas}
            </p>
          </div>
          <div className="rounded-xl border border-neutral-800/80 bg-neutral-950/70 p-3 text-center">
            <span className="text-xs font-semibold text-neutral-400">Pendientes</span>
            <p className="mt-1 text-xl font-black text-white tabular-nums">
              {metrics.turnos.pendientes}
            </p>
          </div>
          <div className="rounded-xl border border-neutral-800/80 bg-neutral-950/70 p-3 text-center">
            <span className="text-xs font-semibold text-neutral-400">Pagados</span>
            <p className="mt-1 text-xl font-black text-white tabular-nums">
              {metrics.turnos.pagadas}
            </p>
          </div>
          <div className="rounded-xl border border-neutral-800/80 bg-neutral-950/70 p-3 text-center">
            <span className="text-xs font-semibold text-neutral-400">Bloqueos</span>
            <p className="mt-1 text-xl font-black text-white tabular-nums">
              {metrics.turnos.bloqueadas}
            </p>
          </div>
          <div className="rounded-xl border border-neutral-800/80 bg-neutral-950/70 p-3 text-center">
            <span className="text-xs font-semibold text-neutral-400">Cancelados</span>
            <p className="mt-1 text-xl font-black text-white tabular-nums">
              {metrics.turnos.canceladas}
            </p>
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
      <div className={SUB_BOX}>
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
      <div className={SUB_BOX}>
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
      <p className={VALUE}>{porcentaje}%</p>
      <div className={SUB_BOX}>
        <p className="text-xs font-semibold text-neutral-300">
          {metrics.ocupacion.ocupados} de {metrics.ocupacion.totalTurnos} turnos ocupados
        </p>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-800">
          <div
            className="h-full rounded-full bg-[#c5d86d] transition-all"
            style={{ width: `${porcentaje}%` }}
          />
        </div>
      </div>
    </div>
  )
}

function CancelacionesCard({ metrics }: { metrics: DailyMetrics }): React.JSX.Element {
  return (
    <div className={CARD}>
      <p className={LABEL}>Cancelaciones</p>
      <p className={VALUE}>{metrics.cancelaciones.cantidad}</p>
      <div className={SUB_BOX}>
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