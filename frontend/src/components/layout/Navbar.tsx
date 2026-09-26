import { Button } from '@heroui/react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import { useDarkMode } from '../../hooks/useDarkMode'
import Logo from '../brand/Logo'

const navLinkClass = ({ isActive }: { isActive: boolean }): string =>
  `rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-lime text-coffee shadow-surface'
      : 'text-tertiary hover:bg-lime/10 hover:text-coffee dark:text-mauve-soft dark:hover:bg-lime/10 dark:hover:text-[#f3efe8]'
  }`

export default function Navbar(): React.JSX.Element {
  const { user, isAdmin, isAuthenticated, logout } = useAuth()
  const { isDark, toggleDark } = useDarkMode()
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-20 border-b border-line/70 bg-cream/80 backdrop-blur dark:border-mauve/50 dark:bg-coffee/85">
      <nav className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-2.5 sm:gap-4">
        <NavLink to="/" end aria-label="Copa 5 - Inicio">
          <Logo />
        </NavLink>
        <div className="flex items-center gap-1">
          <NavLink to="/" end className={navLinkClass}>
            Reservas
          </NavLink>
          <NavLink to="/torneos" className={navLinkClass}>
            Torneos
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin" className={navLinkClass}>
              Admin
            </NavLink>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" onPress={toggleDark}>
            {isDark ? 'Claro' : 'Oscuro'}
          </Button>

          {isAuthenticated && user !== null ? (
            <>
              <span className="hidden text-sm font-medium text-coffee sm:inline dark:text-mauve-soft">
                {user.name.split(' ')[0]} {user.role === 'admin' ? '· Admin' : ''}
              </span>
              <Button variant="outline" size="sm" onPress={() => { logout(); navigate('/') }}>
                Salir
              </Button>
            </>
          ) : (
            <Button variant="secondary" size="sm" onPress={() => navigate('/login')}>
              Iniciar sesión
            </Button>
          )}
        </div>
      </nav>
    </header>
  )
}