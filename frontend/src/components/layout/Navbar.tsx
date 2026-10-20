import { Button, Disclosure, DisclosureContent, DisclosureTrigger } from '@heroui/react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../auth/useAuth'
import { useDarkMode } from '../../hooks/useDarkMode'
import Logo from '../brand/Logo'

const navLinkClass = ({ isActive }: { isActive: boolean }): string =>
  `inline-flex min-h-11 items-center rounded-full px-3.5 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-lime text-coffee shadow-surface'
      : 'text-tertiary hover:bg-lime/10 hover:text-coffee dark:text-mauve-soft dark:hover:bg-lime/10 dark:hover:text-[#f3efe8]'
  }`

/**
 * Enlaces del drawer movil.
 *
 * El inactivo NO puede llevar `text-white` fijo: el panel es claro en tema
 * claro, y blanco sobre crema daba 1.03:1 (invisible). Va neutral-700 con
 * variante dark. El activo va texto oscuro porque el fondo es lime claro.
 */
const drawerLinkClass = ({ isActive }: { isActive: boolean }): string =>
  `flex w-full min-h-11 items-center rounded-xl px-4 py-2 text-lg transition-colors ${
    isActive
      ? 'bg-lime font-bold text-neutral-900 shadow-surface'
      : 'text-neutral-700 hover:bg-lime/10 hover:text-black dark:text-neutral-300 dark:hover:bg-white'
  }`

function SunIcon({ className }: { className?: string }): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className ?? 'size-5'}
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="M4.93 4.93l1.41 1.41" />
      <path d="M17.66 17.66l1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="M6.34 17.66l-1.41 1.41" />
      <path d="M19.07 4.93l-1.41 1.41" />
    </svg>
  )
}

function MoonIcon({ className }: { className?: string }): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className ?? 'size-5'}
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  )
}

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
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const headerRef = useRef<HTMLElement | null>(null)
  const [headerHeight, setHeaderHeight] = useState(0)

  // HeroUI envuelve el Disclosure en un div `relative` que mide solo el ancho
  // del trigger, asi que un panel `absolute inset-x-0` queda angosto y se
  // corta. Midiendo el header podemosPositionarlo respecto de la ventana.
  useEffect(() => {
    const el = headerRef.current
    if (el === null) return
    const update = (): void => setHeaderHeight(el.getBoundingClientRect().height)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Al llegar con /#reservas desde otra ruta el scroll nativo no alcanza:
  // el id se monta despues de resolver la query de canchas. Reintentamos
  // con un par de timeouts. Depende de location porque el Navbar esta
  // montado en el layout y no se remonta al cambiar de ruta.
  useEffect(() => {
    if (location.pathname !== '/' || location.hash !== '#reservas') return
    const scroll = (): void => {
      document.getElementById('reservas')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    scroll()
    const timers = [setTimeout(scroll, 120), setTimeout(scroll, 400)]
    return () => timers.forEach(clearTimeout)
  }, [location.pathname, location.hash])

  function closeMenu(): void {
    setIsMenuOpen(false)
  }

  /**
   * "Reservas" apunta al ancla de la grilla.
   *
   * En la home no dejamos que Link navegue: su `to="/"` borraria el hash y
   * cancelaria el desplazamiento, asi que hacemos scroll puro. Desde otra
   * ruta dejamos que Link vaya a /#reservas y el effect de hash completa el
   * scroll cuando la grilla ya esta montada.
   */
  function goToReservas(event: React.MouseEvent<HTMLAnchorElement>): void {
    closeMenu()
    if (location.pathname !== '/') return
    event.preventDefault()
    document.getElementById('reservas')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const reservasTarget = location.pathname === '/' ? '/' : '/#reservas'

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-30 border-b border-line/70 bg-cream/80 backdrop-blur dark:border-mauve/50 dark:bg-coffee/85"
    >
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <NavLink to="/" end aria-label="Copa 5 - Inicio" className="shrink-0">
            <Logo className="size-8 sm:h-9 sm:w-9" />
          </NavLink>
        </div>

        <div className="hidden items-center gap-1 md:flex">
          <NavLink to={reservasTarget} end className={navLinkClass} onClick={goToReservas}>
            Reservas
          </NavLink>
          {isAuthenticated && !isAdmin && (
            <NavLink to="/mis-reservas" className={navLinkClass}>
              Mis Reservas
            </NavLink>
          )}
          <NavLink to="/torneos" className={navLinkClass}>
            Torneos
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin" className={navLinkClass}>
              Admin
            </NavLink>
          )}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Button
            isIconOnly
            variant="ghost"
            size="sm"
            className="min-h-11 min-w-11 rounded-full"
            onPress={toggleDark}
            aria-label="Cambiar tema"
          >
            {isDark ? <SunIcon className="size-5 text-amber-400" /> : <MoonIcon className="size-5 text-neutral-700" />}
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

        <div className="flex items-center gap-2 md:hidden">
          <Button
            isIconOnly
            variant="ghost"
            size="sm"
            className="pointer-events-auto min-h-11 min-w-11 rounded-full"
            onPress={toggleDark}
            aria-label="Cambiar tema"
          >
            {isDark ? <SunIcon className="size-5 text-amber-400" /> : <MoonIcon className="size-5 text-neutral-700" />}
          </Button>

          <Disclosure isExpanded={isMenuOpen} onExpandedChange={setIsMenuOpen}>
            <DisclosureTrigger
              aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              className="flex size-11 items-center justify-center rounded-xl border border-line bg-cream text-coffee transition-colors hover:bg-lime/10 dark:border-mauve dark:bg-coffee-elev dark:text-[#f3efe8]"
            >
              <MenuIcon open={isMenuOpen} />
            </DisclosureTrigger>

            {isMenuOpen && (
              <div
                aria-hidden="true"
                style={{ top: headerHeight }}
                className="fixed inset-x-0 bottom-0 z-20 bg-neutral-900/40 backdrop-blur-sm md:hidden"
                onClick={closeMenu}
              />
            )}

            <DisclosureContent
              style={{ top: headerHeight }}
              className="fixed inset-x-0 z-40 w-full max-w-full border-b border-neutral-200 bg-white/95 px-6 pb-6 pt-4 text-neutral-900 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-[#1a090d]/95 dark:text-white"
            >
              <nav className="flex w-full flex-col gap-4" aria-label="Navegación principal">
                <NavLink to={reservasTarget} end className={drawerLinkClass} onClick={goToReservas}>
                  Reservas
                </NavLink>
                {isAuthenticated && !isAdmin && (
                  <NavLink to="/mis-reservas" className={drawerLinkClass} onClick={closeMenu}>
                    Mis Reservas
                  </NavLink>
                )}
                <NavLink to="/torneos" className={drawerLinkClass} onClick={closeMenu}>
                  Torneos
                </NavLink>
                {isAdmin && (
                  <NavLink to="/admin" className={drawerLinkClass} onClick={closeMenu}>
                    Admin
                  </NavLink>
                )}

                <div className="my-2 h-px bg-neutral-200 dark:bg-white/10" />

                {isAuthenticated && user !== null ? (
                  <>
                    {/*
                      text-neutral-500 daba 4.24:1 sobre el panel claro (falla AA
                      en texto de 14px). El proyecto no define neutral-600, asi
                      que el siguiente tono disponible es neutral-700 (9.3:1).
                    */}
                    <p className="px-4 pb-1 text-sm text-neutral-700 dark:text-neutral-400">
                      Sesión de {user.name.split(' ')[0]}
                      {user.role === 'admin' ? ' (admin)' : ''}
                    </p>
                    <Button
                      variant="outline"
                      className="min-h-11 border border-neutral-300 text-neutral-800 dark:border-white/20 dark:text-white"
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