import { Button, Disclosure, DisclosureContent, DisclosureTrigger } from '@heroui/react'
import { NavLink, useNavigate } from 'react-router-dom'
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

const drawerLinkClass = ({ isActive }: { isActive: boolean }): string =>
  `flex w-full min-h-11 items-center rounded-xl px-4 py-2 text-lg font-semibold transition-colors ${
    isActive
      ? 'bg-lime text-coffee shadow-surface'
      : 'text-white/90 hover:bg-lime/10 dark:text-white/90 dark:hover:bg-lime/10'
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

  function closeMenu(): void {
    setIsMenuOpen(false)
  }

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

            <DisclosureContent
              style={{ top: headerHeight }}
              className="fixed inset-x-0 z-40 w-full max-w-full border-b border-line bg-cream px-6 pb-6 pt-4 shadow-lg dark:border-mauve dark:bg-[#1a090d]/95 dark:backdrop-blur-md"
            >
              <nav className="flex w-full flex-col gap-4" aria-label="Navegación principal">
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