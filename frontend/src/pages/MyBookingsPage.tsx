import MyBookingsView from '../components/booking/MyBookingsView'

export default function MyBookingsPage(): React.JSX.Element {
  return (
    <div className="space-y-6">
      <header>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#c5d86d]/30 bg-[#c5d86d]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#c5d86d]">
          Copa 5 · Mi cuenta
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Mis Reservas</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Gestioná tus próximos turnos, pagá la seña y compartí el partido con tu equipo.
        </p>
      </header>

      <MyBookingsView />
    </div>
  )
}