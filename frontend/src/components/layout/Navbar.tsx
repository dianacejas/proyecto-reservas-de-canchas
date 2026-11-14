import { Button, Disclosure, DisclosureContent, DisclosureTrigger } from '@heroui/react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../auth/useAuth'
import Logo from '../brand/Logo'

const navLinkClass = ({ isActive }: { isActive: boolean }): string =>
  `inline-flex min-h-11 items-center rounded-full px-3.5 text-sm transition-colors ${
    isActive
      ? 'border border-[#c5d86d]/30 bg-[#c5d86d]/15 font-bold text-[#c5d86d]'
      : 'font-medium text-neutral-300 hover:bg-white/5 hover:text-white'
  }`

const drawerLinkClass = ({ isActive }: { isActive: boolean }): string =>
  `flex w-full min-h-11 items-center rounded-xl px-4 py-2 text-lg transition-colors ${
    isActive
      ? 'bg-[#c5d86d] font-bold text-neutral-950 shadow-surface'
      : 'text-neutral-300 hover:bg-white/10 hover:text-white'
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

function scrollToSection(sectionId: string, navbarHeight: number): void {
  const el = document.getElementById(sectionId)
  if (el === null) return
  const y = el.getBoundingClientRect().top + window.scrollY - Math.max(navbarHeight, 80) - 8
  window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' })
}

export default function Navbar(): React.JSX.Element {
  const { user, isAdmin, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const headerRef = useRef<HTMLElement | null>(null)
  const [headerHeight, setHeaderHeight] = useState(0)
  /** Sección activa en la home: "Reservas" es un ancla de la misma página. */
  const [activeSection, setActiveSection] = useState<'home' | 'reservas'>('home')

  useEffect(() => {
    const el = headerRef.current
    if (el === null) return
    const update = (): void => setHeaderHeight(el.getBoundingClientRect().height)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (location.pathname !== '/' || location.hash !== '#reservas') return
    const scroll = (): void => scrollToSection('reservas', headerHeight)
    scroll()
    const timers = [setTimeout(scroll, 120), setTimeout(scroll, 400)]
    return () => timers.forEach(clearTimeout)
  }, [location.pathname, location.hash, headerHeight])

  // Scroll Spy con IntersectionObserver adelantado para marcar "Reservas" apenas
  // entra en el tercio superior de la pantalla debajo del Navbar fijo.
  useEffect(() => {
    if (location.pathname !== '/') return

    let observer: IntersectionObserver | null = null
    const attach = (): void => {
      const target = document.getElementById('reservas')
      if (target === null) return
      observer?.disconnect()
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection('reservas')
            } else if (window.scrollY < target.offsetTop - Math.max(headerHeight, 80)) {
              setActiveSection('home')
            }
          })
        },
        {
          rootMargin: '-20% 0px -60% 0px',
          threshold: 0.1,
        }
      )
      observer.observe(target)
    }

    attach()
    const timers = [setTimeout(attach, 200), setTimeout(attach, 600)]
    return () => {
      observer?.disconnect()
      timers.forEach(clearTimeout)
    }
  }, [location.pathname, headerHeight])

  function closeMenu(): void {
    setIsMenuOpen(false)
  }

  function goToHome(event: React.MouseEvent<HTMLAnchorElement>): void {
    closeMenu()
    setActiveSection('home')
    if (location.pathname !== '/') return
    event.preventDefault()
    if (location.hash !== '') navigate('/', { replace: true })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function goToReservas(event: React.MouseEvent<HTMLAnchorElement>): void {
    closeMenu()
    setActiveSection('reservas')
    if (location.pathname !== '/') return
    event.preventDefault()
    scrollToSection('reservas', headerHeight)
  }

  const isOnHome = location.pathname === '/'
  const isReservasActive = isOnHome && activeSection === 'reservas'
  const isHomeActive = isOnHome && activeSection === 'home'

  return (
    <header
      ref={headerRef}
      className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-neutral-950/80 backdrop-blur-md transition-all duration-300"
    >
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <NavLink to="/" end aria-label="Copa 5 - Inicio" className="shrink-0">
            <Logo className="size-8 sm:h-9 sm:w-9" />
          </NavLink>
        </div>

        <div className="hidden items-center gap-1 md:flex">
          <Link
            to="/"
            aria-current={isHomeActive ? 'page' : undefined}
            className={navLinkClass({ isActive: isHomeActive })}
            onClick={goToHome}
          >
            Inicio
          </Link>
          <Link
            to="/#reservas"
            aria-current={isReservasActive ? 'page' : undefined}
            className={navLinkClass({ isActive: isReservasActive })}
            onClick={goToReservas}
          >
            Reservas
          </Link>
          {isAuthenticated && !isAdmin && (
            <NavLink to="/mis-reservas" className={navLinkClass}>
              Mis Reservas
            </NavLink>
          )}
          <NavLink to="/torneos" className={navLinkClass}>
            Torneos
          </NavLink>
          <NavLink to="/comunidad" className={navLinkClass}>
            Comunidad
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin" className={navLinkClass}>
              Admin
            </NavLink>
          )}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated && user !== null ? (
            <>
              <span className="text-sm font-medium text-mauve-soft">
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
          <Disclosure isExpanded={isMenuOpen} onExpandedChange={setIsMenuOpen}>
            <DisclosureTrigger
              aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              className="flex size-11 items-center justify-center rounded-xl border transition-colors hover:bg-lime/10 border-mauve bg-coffee-elev text-[#f3efe8]"
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
              className="fixed inset-x-0 z-40 w-full max-w-full border-b px-6 pb-6 pt-4 shadow-xl backdrop-blur-md border-white/10 bg-[#1a090d]/95 text-white"
            >
              <nav className="flex w-full flex-col gap-4" aria-label="Navegación principal">
                <Link
                  to="/"
                  aria-current={isHomeActive ? 'page' : undefined}
                  className={drawerLinkClass({ isActive: isHomeActive })}
                  onClick={goToHome}
                >
                  Inicio
                </Link>
                <Link
                  to="/#reservas"
                  aria-current={isReservasActive ? 'page' : undefined}
                  className={drawerLinkClass({ isActive: isReservasActive })}
                  onClick={goToReservas}
                >
                  Reservas
                </Link>
                {isAuthenticated && !isAdmin && (
                  <NavLink to="/mis-reservas" className={drawerLinkClass} onClick={closeMenu}>
                    Mis Reservas
                  </NavLink>
                )}
                <NavLink to="/torneos" className={drawerLinkClass} onClick={closeMenu}>
                  Torneos
                </NavLink>
                <NavLink to="/comunidad" className={drawerLinkClass} onClick={closeMenu}>
                  Comunidad
                </NavLink>
                {isAdmin && (
                  <NavLink to="/admin" className={drawerLinkClass} onClick={closeMenu}>
                    Admin
                  </NavLink>
                )}

                <div className="my-2 h-px bg-white/10" />

                {isAuthenticated && user !== null ? (
                  <>
                    <p className="px-4 pb-1 text-sm text-neutral-400">
                      Sesión de {user.name.split(' ')[0]}
                      {user.role === 'admin' ? ' (admin)' : ''}
                    </p>
                    <Button
                      variant="outline"
                      className="min-h-11 border border-white/20 text-white"
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