import { Button, Chip } from '@heroui/react'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { downloadBalanceExcel, getAdminMetrics, queryKeys } from '../../api'
import { getErrorMessage } from '../../api/client'
import { DownloadIcon, FileTextIcon as FileText, PrinterIcon } from '../common/Icons'
import ErrorState from '../common/ErrorState'
import Loading from '../common/Loading'
import DateNav from '../booking/DateNav'
import type { DailyMetrics } from '../../types'
import { formatCurrency } from '../../utils/payments'
import { todayKey } from '../../utils/date'

const CARD =
  'break-inside-avoid bg-neutral-900/90 border border-neutral-800 shadow-[0_8px_30px_rgb(0,0,0,0.4)] rounded-2xl p-5 hover:border-neutral-700 transition-all print:shadow-none print:bg-white print:border-neutral-300 print:text-neutral-950'
const LABEL = 'text-xs font-bold uppercase tracking-wider text-neutral-400 print:text-neutral-600'
const VALUE = 'mt-1.5 text-3xl font-black text-white tracking-tight print:text-neutral-950'
const SUB_BOX =
  'mt-3.5 space-y-2 rounded-xl border border-neutral-800/60 bg-neutral-950/60 p-3 print:bg-neutral-50 print:border-neutral-200'
const ROW = 'flex items-center justify-between gap-3 text-xs'
const ROW_LABEL = 'text-neutral-400 print:text-neutral-600'
const ROW_VALUE = 'text-neutral-200 font-bold print:text-neutral-900'

function getWeekRange(dateStr: string): { startDate: string; endDate: string } {
  const d = new Date(`${dateStr}T12:00:00Z`)
  const day = d.getUTCDay()
  const diffToMonday = day === 0 ? -6 : 1 - day
  const monday = new Date(d)
  monday.setUTCDate(d.getUTCDate() + diffToMonday)
  const sunday = new Date(monday)
  sunday.setUTCDate(monday.getUTCDate() + 6)
  return {
    startDate: monday.toISOString().slice(0, 10),
    endDate: sunday.toISOString().slice(0, 10),
  }
}

export default function AdminMetrics(): React.JSX.Element {
  const [date, setDate] = useState(todayKey())
  const [mode, setMode] = useState<'dia' | 'semana'>('dia')

  const metricsQuery = useQuery({
    queryKey: queryKeys.adminMetrics({ date, mode }),
    queryFn: () =>
      mode === 'semana'
        ? getAdminMetrics(getWeekRange(date))
        : getAdminMetrics({ date }),
  })

  if (metricsQuery.isLoading) return <Loading label="Calculando métricas…" />
  if (metricsQuery.isError) {
    return (
      <ErrorState
        message={getErrorMessage(metricsQuery.error)}
        onRetry={() => void metricsQuery.refetch()}
      />
    )
  }

  const metrics = metricsQuery.data
  if (metrics === undefined) return <Loading label="Calculando métricas…" />

  const handleDownloadPDF = (): void => {
    window.print()
  }

  const periodLabel =
    mode === 'semana'
      ? `Semana del ${metrics.startDate ?? ''} al ${metrics.endDate ?? ''}`
      : `Jornada del ${metrics.date}`

  return (
    <div className="w-full space-y-6 print:space-y-4">
      {/* Membrete corporativo único para impresión */}
      <div className="hidden print:block mb-5 border-b-2 border-neutral-900 pb-3">
        <h1 className="text-xl font-black tracking-tight text-neutral-950">
          COPA 5 · COMPLEJO DEPORTIVO
        </h1>
        <div className="mt-1 flex items-center justify-between text-xs font-medium text-neutral-600">
          <span>Balance de Caja y Reporte Operativo</span>
          <span className="font-bold text-neutral-900">{periodLabel}</span>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              @page {
                size: A4;
                margin: 14mm;
              }
              html, body {
                background: #ffffff !important;
                color: #0a0a0a !important;
                overflow: visible !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              main {
                padding-top: 0 !important;
                margin: 0 !important;
                max-width: 100% !important;
              }
              header, nav, footer, button, a[href*="wa.me"], .no-print, .print\\:hidden, [role="tablist"] {
                display: none !important;
              }
              .print\\:block {
                display: block !important;
              }
              .break-inside-avoid {
                break-inside: avoid !important;
                page-break-inside: avoid !important;
                box-shadow: none !important;
                filter: none !important;
              }
            }
          `,
        }}
      />

      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h2 className="text-base font-bold text-white">Reporte de Caja y Métricas</h2>
          <p className="text-xs text-neutral-400">{periodLabel}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Botones de Exportación e Impresión */}
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 rounded-xl border-neutral-700 bg-neutral-900/90 px-3.5 text-xs font-semibold text-neutral-200 hover:bg-neutral-800"
            onPress={() => void downloadBalanceExcel(metrics.startDate || date, metrics.endDate || date)}
          >
            <DownloadIcon className="size-3.5 text-[#c5d86d]" />
            Descargar Excel
          </Button>

          <button
            type="button"
            onClick={handleDownloadPDF}
            className="border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-2 transition-colors shadow-sm"
          >
            <FileText className="w-4 h-4 text-[#c5d86d]" /> Descargar PDF
          </button>

          <Button
            variant="ghost"
            size="sm"
            className="h-9 gap-1.5 text-xs font-semibold text-neutral-400 hover:text-white"
            onPress={() => window.print()}
          >
            <PrinterIcon className="size-3.5" />
            Imprimir Resumen
          </Button>

          <div className="flex rounded-lg border border-neutral-800 bg-neutral-900/60 p-0.5">
            <Button
              variant={mode === 'dia' ? 'primary' : 'ghost'}
              size="sm"
              className="h-8 px-3 text-xs font-semibold"
              onPress={() => setMode('dia')}
            >
              Día
            </Button>
            <Button
              variant={mode === 'semana' ? 'primary' : 'ghost'}
              size="sm"
              className="h-8 px-3 text-xs font-semibold"
              onPress={() => setMode('semana')}
            >
              Semana
            </Button>
          </div>
          <DateNav date={date} onChange={setDate} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 print:grid-cols-2 print:gap-4">
        <CajaCard metrics={metrics} mode={mode} />
        <DesgloseMostradorCard metrics={metrics} />
        <OcupacionCard metrics={metrics} mode={mode} />
        <SaldoCard metrics={metrics} />
      </div>

      {/* Tarjetas de Business Intelligence */}
      <div className="grid gap-3 sm:grid-cols-2 print:grid-cols-2 print:gap-4">
        <TopCourtCard topCourt={metrics.topCourt} />
        <PeakHourCard peakHour={metrics.peakHour} />
      </div>

      <div className="break-inside-avoid rounded-2xl border border-neutral-800 bg-neutral-900/90 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.4)] print:border-neutral-300 print:bg-white print:shadow-none">
        <p className="text-xs font-bold uppercase tracking-wider text-neutral-400 print:text-neutral-600">
          Distribución de turnos en el período
        </p>
        <div className="mt-3.5 grid grid-cols-2 gap-3 sm:grid-cols-5 print:grid-cols-5 print:gap-2.5">
          <div className="rounded-xl border border-neutral-800/80 bg-neutral-950/70 p-3 text-center print:border-neutral-200 print:bg-neutral-50">
            <div className="flex items-center justify-center gap-1.5">
              <span className="size-2 rounded-full bg-[#c5d86d]" />
              <span className="text-xs font-semibold text-neutral-400 print:text-neutral-600">Confirmados</span>
            </div>
            <p className="mt-1.5 text-xl font-black text-white print:text-neutral-950">{metrics.turnos.confirmadas}</p>
          </div>
          <div className="rounded-xl border border-neutral-800/80 bg-neutral-950/70 p-3 text-center print:border-neutral-200 print:bg-neutral-50">
            <span className="block text-xs font-semibold text-neutral-400 print:text-neutral-600">Pendientes</span>
            <p className="mt-1.5 text-xl font-black text-white print:text-neutral-950">{metrics.turnos.pendientes}</p>
          </div>
          <div className="rounded-xl border border-neutral-800/80 bg-neutral-950/70 p-3 text-center print:border-neutral-200 print:bg-neutral-50">
            <span className="block text-xs font-semibold text-neutral-400 print:text-neutral-600">Liquidados</span>
            <p className="mt-1.5 text-xl font-black text-white print:text-neutral-950">{metrics.turnos.pagadas}</p>
          </div>
          <div className="rounded-xl border border-neutral-800/80 bg-neutral-950/70 p-3 text-center print:border-neutral-200 print:bg-neutral-50">
            <span className="block text-xs font-semibold text-neutral-400 print:text-neutral-600">Bloqueos</span>
            <p className="mt-1.5 text-xl font-black text-white print:text-neutral-950">{metrics.turnos.bloqueadas}</p>
          </div>
          <div className="rounded-xl border border-neutral-800/80 bg-neutral-950/70 p-3 text-center print:border-neutral-200 print:bg-neutral-50">
            <span className="block text-xs font-semibold text-neutral-400 print:text-neutral-600">Cancelados</span>
            <p className="mt-1.5 text-xl font-black text-white print:text-neutral-950">{metrics.turnos.canceladas}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function CajaCard({ metrics, mode }: { metrics: DailyMetrics; mode: 'dia' | 'semana' }): React.JSX.Element {
  const onlineRev = metrics.onlineRevenue ?? metrics.recaudacion.pasarela
  const counterRev = metrics.counterRevenue?.total ?? metrics.recaudacion.mostrador
  const totalRev = metrics.totalRevenue ?? metrics.recaudacion.total

  return (
    <div className={CARD}>
      <p className={LABEL}>{mode === 'semana' ? 'Caja Semanal' : 'Caja de Hoy'}</p>
      <p className={VALUE}>{formatCurrency(totalRev)}</p>
      <div className={SUB_BOX}>
        <div className={ROW}>
          <span className={ROW_LABEL}>Señas online (MP)</span>
          <span className="font-bold text-[#c5d86d]">{formatCurrency(onlineRev)}</span>
        </div>
        <div className={ROW}>
          <span className={ROW_LABEL}>Recaudación mostrador</span>
          <span className={ROW_VALUE}>{formatCurrency(counterRev)}</span>
        </div>
      </div>
    </div>
  )
}

function DesgloseMostradorCard({ metrics }: { metrics: DailyMetrics }): React.JSX.Element {
  const breakdown = metrics.counterRevenue ?? {
    efectivo: metrics.recaudacion.mostrador,
    transferencia: 0,
    debito: 0,
    total: metrics.recaudacion.mostrador,
  }

  return (
    <div className={CARD}>
      <p className={LABEL}>Desglose Mostrador</p>
      <p className={VALUE}>{formatCurrency(breakdown.total)}</p>
      <div className={SUB_BOX}>
        <div className={ROW}>
          <span className={ROW_LABEL}>Efectivo</span>
          <span className={ROW_VALUE}>{formatCurrency(breakdown.efectivo)}</span>
        </div>
        <div className={ROW}>
          <span className={ROW_LABEL}>Transferencias</span>
          <span className={ROW_VALUE}>{formatCurrency(breakdown.transferencia)}</span>
        </div>
        <div className={ROW}>
          <span className={ROW_LABEL}>Débito</span>
          <span className={ROW_VALUE}>{formatCurrency(breakdown.debito)}</span>
        </div>
      </div>
    </div>
  )
}

function OcupacionCard({ metrics, mode }: { metrics: DailyMetrics; mode: 'dia' | 'semana' }): React.JSX.Element {
  const porcentaje = metrics.occupancyRate ?? metrics.ocupacion.porcentaje

  return (
    <div className={CARD}>
      <div className="flex items-center justify-between">
        <p className={LABEL}>{mode === 'semana' ? 'Ocupación Semanal' : 'Ocupación Diaria'}</p>
        <Chip color="success" size="sm">
          {porcentaje}%
        </Chip>
      </div>
      <p className={VALUE}>
        {porcentaje}%
      </p>
      <div className={SUB_BOX}>
        <div className={ROW}>
          <span className={ROW_LABEL}>Turnos ocupados</span>
          <span className={ROW_VALUE}>
            {metrics.ocupacion.ocupados} / {metrics.ocupacion.totalTurnos}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
          <div
            className="h-full rounded-full bg-[#c5d86d] transition-all duration-300"
            style={{ width: `${Math.min(porcentaje, 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}

function SaldoCard({ metrics }: { metrics: DailyMetrics }): React.JSX.Element {
  return (
    <div className={CARD}>
      <p className={LABEL}>Saldo por Cobrar</p>
      <p className={VALUE}>{formatCurrency(metrics.saldoPorCobrar.saldoRestante)}</p>
      <div className={SUB_BOX}>
        <div className={ROW}>
          <span className={ROW_LABEL}>Señas acreditadas</span>
          <span className={ROW_VALUE}>{formatCurrency(metrics.saldoPorCobrar.senasAbonadas)}</span>
        </div>
        <div className={ROW}>
          <span className={ROW_LABEL}>Saldo a liquidar</span>
          <span className="font-bold text-[#c5d86d]">
            {formatCurrency(metrics.saldoPorCobrar.saldoRestante)}
          </span>
        </div>
      </div>
    </div>
  )
}

function TopCourtCard({ topCourt }: { topCourt?: DailyMetrics['topCourt'] }): React.JSX.Element {
  return (
    <div className={CARD}>
      <div className="flex items-center justify-between">
        <p className={LABEL}>Cancha más solicitada</p>
        <Chip color="success" size="sm">
          Líder
        </Chip>
      </div>

      {topCourt ? (
        <>
          <p className="mt-1.5 text-2xl font-black tracking-tight text-white print:text-neutral-950">
            {topCourt.name}
          </p>
          <div className={SUB_BOX}>
            <div className={ROW}>
              <span className={ROW_LABEL}>Turnos jugados</span>
              <span className={ROW_VALUE}>{topCourt.bookingsCount}</span>
            </div>
            <div className={ROW}>
              <span className={ROW_LABEL}>Recaudación</span>
              <span className="font-bold text-[#c5d86d] print:text-neutral-900">{formatCurrency(topCourt.totalRevenue)}</span>
            </div>
          </div>
        </>
      ) : (
        <div className={SUB_BOX}>
          <p className="text-xs text-neutral-400">
            Sin actividad registrada en este período.
          </p>
        </div>
      )}
    </div>
  )
}

function PeakHourCard({ peakHour }: { peakHour?: DailyMetrics['peakHour'] }): React.JSX.Element {
  return (
    <div className={CARD}>
      <div className="flex items-center justify-between">
        <p className={LABEL}>Horario de mayor concurrencia</p>
        {peakHour && (
          <Chip color="warning" size="sm">
            {peakHour.occupancyPercentage}% ocupación
          </Chip>
        )}
      </div>

      {peakHour ? (
        <>
          <p className="mt-1.5 text-2xl font-black tracking-tight text-white print:text-neutral-950">
            {peakHour.timeSlot}
          </p>
          <div className={SUB_BOX}>
            <div className={ROW}>
              <span className={ROW_LABEL}>Turnos en franja</span>
              <span className={ROW_VALUE}>{peakHour.bookingsCount}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
              <div
                className="h-full rounded-full bg-[#c5d86d] transition-all duration-300"
                style={{ width: `${Math.min(peakHour.occupancyPercentage, 100)}%` }}
              />
            </div>
          </div>
        </>
      ) : (
        <div className={SUB_BOX}>
          <p className="text-xs text-neutral-400">
            Sin actividad registrada en este período.
          </p>
        </div>
      )}
    </div>
  )
}