import { Button, Disclosure, DisclosureContent, DisclosureTrigger } from '@heroui/react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../auth/useAuth'
import Logo from '../brand/Logo'

const navLinkClass = ({ isActive }: { isActive: boolean }): string =>
  `inline-flex items-center text-sm font-semibold transition-all py-2 px-3 relative rounded-lg ${
    isActive
      ? 'border border-[#c5d86d]/30 bg-[#c5d86d]/15 text-[#c5d86d] font-bold shadow-[0_0_15px_rgba(197,216,109,0.12)]'
      : 'border border-transparent text-neutral-400 hover:text-white'
  }`

/**
 * Enlaces del drawer movil con estilo minimalista SaaS.
 */
const drawerLinkClass = ({ isActive }: { isActive: boolean }): string =>
  `flex w-full items-center rounded-xl px-4 py-3 text-base font-semibold transition-all ${
    isActive
      ? 'border border-[#c5d86d]/30 bg-[#c5d86d]/15 text-[#c5d86d] font-bold'
      : 'border border-transparent text-neutral-300 hover:text-white'
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

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function scrollToSection(sectionId: string, navbarHeight = 80): void {
  const element = document.getElementById(sectionId)
  if (!element) return
  const elementPosition = element.getBoundingClientRect().top
  const offsetPosition = elementPosition + window.pageYOffset - navbarHeight

  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth',
  })
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
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const handleBeforeInstall = (e: Event): void => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
  }, [])

  const handleInstallClick = async (): Promise<void> => {
    if (!installPrompt) return
    await installPrompt.prompt()
    const choice = await installPrompt.userChoice
    if (choice.outcome === 'accepted') {
      setInstallPrompt(null)
    }
  }

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
  // con un par de timeouts.
  useEffect(() => {
    if (location.pathname !== '/' || location.hash !== '#reservas') return
    const navOffset = headerHeight > 0 ? headerHeight + 16 : 80
    const scroll = (): void => {
      setActiveSection('reservas')
      scrollToSection('reservas', navOffset)
    }
    scroll()
    const timers = [setTimeout(scroll, 120), setTimeout(scroll, 400)]
    return () => timers.forEach(clearTimeout)
  }, [location.pathname, location.hash, headerHeight])

  // Scroll Spy con IntersectionObserver adelantado (rootMargin '-20% 0px -60% 0px')
  useEffect(() => {
    if (location.pathname !== '/') return

    let observer: IntersectionObserver | null = null

    const attachObserver = (): boolean => {
      const target = document.getElementById('reservas')
      if (!target) return false
      observer?.disconnect()
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection('reservas')
            } else if (entry.boundingClientRect.top > window.innerHeight * 0.25) {
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
      return true
    }

    const onScrollTopReset = (): void => {
      if (window.scrollY < 120) {
        setActiveSection('home')
      }
    }

    attachObserver()
    window.addEventListener('scroll', onScrollTopReset, { passive: true })
    const timers = [setTimeout(attachObserver, 150), setTimeout(attachObserver, 500)]

    return () => {
      observer?.disconnect()
      window.removeEventListener('scroll', onScrollTopReset)
      timers.forEach(clearTimeout)
    }
  }, [location.pathname])

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
    scrollToSection('reservas', headerHeight > 0 ? headerHeight + 16 : 80)
  }

  const isOnHome = location.pathname === '/'
  const isReservasActive = isOnHome && activeSection === 'reservas'
  const isHomeActive = isOnHome && activeSection === 'home'

  return (
    <header
      ref={headerRef}
      className="fixed top-0 left-0 right-0 z-50 bg-neutral-950/80 backdrop-blur-md border-b border-white/10 transition-all duration-300"
    >
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-3.5">
        <div className="flex min-w-0 items-center gap-2">
          <NavLink to="/" end aria-label="Copa 5 - Inicio" className="shrink-0">
            <Logo className="h-9 w-9 sm:h-10 sm:w-10" />
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
          {installPrompt && (
            <Button
              variant="outline"
              size="sm"
              className="min-h-11 rounded-full border-lime/40 bg-lime/20 font-semibold text-[#c5d86d] hover:bg-lime/30"
              onPress={() => {
                void handleInstallClick()
              }}
            >
              Instalar App
            </Button>
          )}

          {isAuthenticated && user !== null ? (
            <>
              <span className="text-sm font-medium text-neutral-300">
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
              className="flex size-11 items-center justify-center rounded-xl border border-white/15 bg-neutral-900 text-neutral-100 transition-colors hover:bg-lime/10"
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
              className="fixed inset-x-0 z-40 w-full max-w-full border-b border-white/10 bg-neutral-950/95 px-6 pb-6 pt-4 text-white shadow-xl backdrop-blur-md"
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

                {installPrompt && (
                  <Button
                    variant="outline"
                    className="min-h-11 w-full rounded-xl border-lime/40 bg-lime/20 font-semibold text-[#c5d86d] hover:bg-lime/30"
                    onPress={() => {
                      void handleInstallClick()
                      closeMenu()
                    }}
                  >
                    Instalar App
                  </Button>
                )}

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