import { Button, Disclosure, DisclosureContent, DisclosureTrigger } from '@heroui/react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../auth/useAuth'
import { useDarkMode } from '../../hooks/useDarkMode'
import Logo from '../brand/Logo'

const navLinkClass = ({ isActive }: { isActive: boolean }): string =>
  `inline-flex min-h-11 items-center rounded-full px-3.5 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-lime text-coffee shadow-surface'
      : 'text-tertiary hover:bg-lime/10 hover:text-coffee dark:text-mauve-soft dark:hover:bg-lime/10 dark:hover:text-[#f3efe8]'
  }`

/** Enlaces del drawer: ancho completo y area tactil comoda. */
const drawerLinkClass = ({ isActive }: { isActive: boolean }): string =>
  `flex min-h-11 items-center rounded-xl px-4 text-base font-medium transition-colors ${
    isActive
      ? 'bg-lime text-coffee shadow-surface'
      : 'text-tertiary hover:bg-lime/10 dark:text-mauve-soft dark:hover:bg-lime/10 dark:hover:text-[#f3efe8]'
  }`

function MenuIcon({ open }: { open: boolean }): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
      className="size-5"
    >
      {open ? (
        <>
          <path d="M6 6l12 12" />
          <path d="M18 6L6 18" />
        </>
      ) : (
        <>
          <path d="M3 6h18" />
          <path d="M3 12h18" />
          <path d="M3 18h18" />
        </>
      )}
    </svg>
  )
}

export default function Navbar(): React.JSX.Element {
  const { user, isAdmin, isAuthenticated, logout } = useAuth()
  const { isDark, toggleDark } = useDarkMode()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // El drawer se cierra al navegar para no tapar la pagina de destino.
  function closeMenu(): void {
    setIsMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-30 border-b border-line/70 bg-cream/80 backdrop-blur dark:border-mauve/50 dark:bg-coffee/85">
      <nav className="mx-auto flex w-full max-w-6xl items-center gap-2 px-4 py-2.5 sm:gap-3 md:gap-4">
        <NavLink to="/" end aria-label="Copa 5 - Inicio" className="shrink-0">
          <Logo className="size-8 sm:h-9 sm:w-9" />
        </NavLink>

        {/* Navegacion principal: solo desde md */}
        <div className="hidden items-center gap-1 md:flex">
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

        {/* Acciones de escritorio */}
        <div className="ml-auto hidden items-center gap-2 md:flex">
          <Button variant="ghost" size="sm" className="min-h-11" onPress={toggleDark}>
            {isDark ? 'Claro' : 'Oscuro'}
          </Button>

          {isAuthenticated && user !== null ? (
            <>
              <span className="text-sm font-medium text-coffee dark:text-mauve-soft">
                {user.name.split(' ')[0]} {user.role === 'admin' ? '· Admin' : ''}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="min-h-11"
                onPress={() => {
                  logout()
                  navigate('/')
                }}
              >
                Salir
              </Button>
            </>
          ) : (
            <Button variant="secondary" size="sm" className="min-h-11" onPress={() => navigate('/login')}>
              Iniciar sesión
            </Button>
          )}
        </div>

        {/* Hamburguesa hasta md */}
        <div className="ml-auto md:hidden">
          <Disclosure isExpanded={isMenuOpen} onExpandedChange={setIsMenuOpen}>
            <DisclosureTrigger
              aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              className="flex size-11 items-center justify-center rounded-xl border border-line bg-cream text-coffee transition-colors hover:bg-lime/10 dark:border-mauve dark:bg-coffee-elev dark:text-[#f3efe8]"
            >
              <MenuIcon open={isMenuOpen} />
            </DisclosureTrigger>

            <DisclosureContent className="border-b border-line bg-cream px-4 pb-4 pt-2 shadow-lg dark:border-mauve dark:bg-coffee-elev">
              <nav className="flex flex-col gap-1" aria-label="Navegación principal">
                <NavLink to="/" end className={drawerLinkClass} onClick={closeMenu}>
                  Reservas
                </NavLink>
                <NavLink to="/torneos" className={drawerLinkClass} onClick={closeMenu}>
                  Torneos
                </NavLink>
                {isAdmin && (
                  <NavLink to="/admin" className={drawerLinkClass} onClick={closeMenu}>
                    Admin
                  </NavLink>
                )}

                <div className="my-2 h-px bg-line dark:bg-mauve/60" />

                <Button
                  variant="ghost"
                  className="min-h-11 justify-start"
                  onPress={() => {
                    toggleDark()
                    closeMenu()
                  }}
                >
                  {isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                </Button>

                {isAuthenticated && user !== null ? (
                  <>
                    <p className="px-4 pb-1 text-sm text-tertiary dark:text-mauve-soft">
                      Sesión de {user.name.split(' ')[0]}
                      {user.role === 'admin' ? ' (admin)' : ''}
                    </p>
                    <Button
                      variant="outline"
                      className="min-h-11"
                      onPress={() => {
                        logout()
                        closeMenu()
                        navigate('/')
                      }}
                    >
                      Salir
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="secondary"
                    className="min-h-11"
                    onPress={() => {
                      closeMenu()
                      navigate('/login')
                    }}
                  >
                    Iniciar sesión
                  </Button>
                )}
              </nav>
            </DisclosureContent>
          </Disclosure>
        </div>
      </nav>
    </header>
  )
}