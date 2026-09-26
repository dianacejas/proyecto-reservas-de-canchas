import { Link } from 'react-router-dom'
import Logo from '../brand/Logo'

const LEGEND = [
  { color: 'bg-lime', label: 'Disponible' },
  { color: 'bg-cinnamon', label: 'Pendiente de pago / confirmación' },
  { color: 'bg-evergreen', label: 'Confirmada' },
]

export default function Footer(): React.JSX.Element {
  return (
    <footer className="mt-10 border-t border-line/70 dark:border-mauve/50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-sm space-y-4">
          <Logo subtitle="Complejo Deportivo" />
          <p className="text-sm leading-relaxed text-tertiary dark:text-mauve-soft">
            Reserva tu cancha en minutos y seguí la tabla de los torneos de tu comunidad. Copa 5 es
            el complejo deportivo de todos.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-tertiary dark:text-mauve-soft">
            Leyenda de horarios
          </p>
          <ul className="space-y-2">
            {LEGEND.map((item) => (
              <li key={item.label} className="flex items-center gap-2.5 text-sm text-coffee dark:text-[#f3efe8]">
                <span className={`size-3 rounded-full ${item.color}`} />
                {item.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-tertiary dark:text-mauve-soft">
            Navegación
          </p>
          <ul className="space-y-2 text-sm text-coffee dark:text-[#f3efe8]">
            <li>
              <Link to="/" className="hover:text-coffee/70 dark:hover:text-lime">
                Reservas
              </Link>
            </li>
            <li>
              <Link to="/torneos" className="hover:text-coffee/70 dark:hover:text-lime">
                Torneos
              </Link>
            </li>
            <li>
              <Link to="/login" className="hover:text-coffee/70 dark:hover:text-lime">
                Iniciar sesión
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line/60 py-4 text-center text-xs text-tertiary dark:border-mauve/40 dark:text-mauve-soft">
        Copa 5 - Complejo Deportivo · Demo de reservas y torneos
      </div>
    </footer>
  )
}