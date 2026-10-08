import MyBookingsView from '../components/booking/MyBookingsView'

export default function MyBookingsPage(): React.JSX.Element {
  return (
    <div className="space-y-6">
      <header>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-mauve/30 bg-lime/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-coffee dark:border-lime/30 dark:bg-lime/10 dark:text-lime">
          Copa 5 · Mi cuenta
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Mis Reservas</h1>
        <p className="mt-1 text-sm text-tertiary dark:text-mauve-soft">
          Gestioná tus próximos turnos, pagá la seña y compartí el partido con tu equipo.
        </p>
      </header>

      <MyBookingsView />
    </div>
  )
}
