import { Chip } from '@heroui/react'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { listAdminCustomers, queryKeys } from '../../api'
import { getErrorMessage } from '../../api/client'
import ErrorState from '../common/ErrorState'
import Loading from '../common/Loading'
import { TextInput } from '../common/fields'
import type { AdminCustomer } from '../../types'
import { formatCurrency } from '../../utils/payments'
import { formatDayShort } from '../../utils/date'

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function matches(customer: AdminCustomer, query: string): boolean {
  const token = normalize(query.trim())
  if (token.length === 0) return true
  return (
    normalize(customer.name).includes(token) ||
    normalize(customer.phone).includes(normalize(query.trim())) ||
    customer.phone.replace(/\D/g, '').includes(token)
  )
}

function isFrecuente(customer: AdminCustomer): boolean {
  return customer.totalReservas >= 5
}

function isRiesgo(customer: AdminCustomer): boolean {
  const perdidas = customer.canceladas + customer.inasistencias
  return perdidas >= 3 || (customer.totalReservas >= 5 && customer.tasaCancelacion >= 50)
}

export default function AdminCustomers(): React.JSX.Element {
  const customersQuery = useQuery({
    queryKey: queryKeys.adminCustomers(),
    queryFn: listAdminCustomers,
  })
  const [search, setSearch] = useState('')

  const customers = useMemo(() => {
    const all = customersQuery.data ?? []
    return all.filter((customer) => matches(customer, search))
  }, [customersQuery.data, search])

  if (customersQuery.isLoading) return <Loading label="Cargando clientes…" />
  if (customersQuery.isError) {
    return (
      <ErrorState
        message={getErrorMessage(customersQuery.error)}
        onRetry={() => void customersQuery.refetch()}
      />
    )
  }

  const total = customersQuery.data ?? []
  const frecuentes = total.filter(isFrecuente).length
  const enRiesgo = total.filter(isRiesgo).length

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2 text-sm">
          <Chip color="accent" size="sm">
            {total.length} clientes
          </Chip>
          <Chip color="success" size="sm">
            {frecuentes} frecuentes
          </Chip>
          <Chip color="warning" size="sm">
            {enRiesgo} con riesgos
          </Chip>
        </div>
        <TextInput
          aria-label="Buscar clientes por nombre o teléfono"
          type="search"
          className="w-full sm:w-72"
          value={search}
          onValueChange={setSearch}
          placeholder="Buscar por nombre o teléfono…"
        />
      </div>

      {customers.length === 0 ? (
        <p className="py-8 text-center text-sm text-neutral-400">
          No se encontraron clientes.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl overflow-hidden border shadow-sm border-white/10 bg-neutral-900/60">
          <table className="w-full min-w-230 text-left text-sm">
            <thead className="bg-neutral-800/80 text-neutral-300">
              <tr>
                <th className="px-4 py-2 font-medium">Cliente</th>
                <th className="px-4 py-2 font-medium">Reservas</th>
                <th className="px-4 py-2 font-medium">Completadas</th>
                <th className="px-4 py-2 font-medium">Canceladas</th>
                <th className="px-4 py-2 font-medium">Inasist.</th>
                <th className="px-4 py-2 font-medium">Tasa riesgo</th>
                <th className="px-4 py-2 font-medium">Recaudado</th>
                <th className="px-4 py-2 text-right font-medium">Contacto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {customers.map((customer) => (
                <CustomerRow key={customer.id} customer={customer} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-neutral-400">
        Clientes agrupados por teléfono o usuario registrado. «Inasist.» son turnos confirmados
        pasados con saldo sin cobrar. Revisá la reputación antes de aprobar un turno manual.
      </p>
    </div>
  )
}

function CustomerRow({ customer }: { customer: AdminCustomer }): React.JSX.Element {
  const riesgo = isRiesgo(customer)
  const frecuente = isFrecuente(customer)

  const waText = `Hola ${customer.name}! Queremos avisarte sobre tu próxima reserva en el complejo.`
  const waHref =
    customer.whatsapp !== null ? `https://wa.me/${customer.whatsapp}?text=${encodeURIComponent(waText)}` : null

  return (
    <tr className="bg-neutral-900/60 hover:bg-neutral-900">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="min-w-0">
            <p className="max-w-52 truncate font-medium text-white">
              {customer.name}
            </p>
            {customer.userId !== null && (
              <p className="text-xs text-neutral-400">Cuenta registrada</p>
            )}
          </div>
          {frecuente && (
            <Chip color="success" size="sm">
              Frecuente
            </Chip>
          )}
          {riesgo && (
            <Chip color="warning" size="sm">
              Riesgo
            </Chip>
          )}
        </div>
      </td>
      <td className="px-4 py-3 font-semibold text-white">
        {customer.totalReservas}
      </td>
      <td className="px-4 py-3 text-neutral-400">{customer.completadas}</td>
      <td className="px-4 py-3 text-neutral-400">{customer.canceladas}</td>
      <td className="px-4 py-3 text-neutral-400">{customer.inasistencias}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-14 overflow-hidden rounded-full bg-neutral-800">
            <div
              className="h-full rounded-full bg-amber-500"
              style={{ width: `${Math.min(customer.tasaCancelacion, 100)}%` }}
            />
          </div>
          <span
            className={`font-semibold ${riesgo ? 'text-amber-400' : 'text-neutral-400'}`}
          >
            {customer.tasaCancelacion}%
          </span>
        </div>
      </td>
      <td className="px-4 py-3 font-medium text-white">
        {formatCurrency(customer.totalRecaudado)}
      </td>
      <td className="px-4 py-3">
        <div className="flex justify-end gap-2">
          <span className="inline-flex items-center text-xs text-neutral-400">
            {customer.ultimaReserva !== null ? formatDayShort(customer.ultimaReserva) : '—'}
          </span>
          {waHref !== null && (
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-7 items-center rounded-md bg-[#25d366] px-2 text-xs font-semibold text-[#04210e] transition-colors hover:bg-[#1fd05f]"
            >
              WhatsApp
            </a>
          )}
        </div>
      </td>
    </tr>
  )
}