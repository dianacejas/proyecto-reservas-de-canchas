import { Link } from 'react-router-dom'
import Logo from '../brand/Logo'
import { WHATSAPP_HREF, WhatsAppIcon } from '../whatsapp/WhatsAppButton'

/**
 * Pie de página compacto del complejo: 3 bloques (marca, navegación breve y
 * garantía/ubicación + redes) más una barra inferior de copyright y legales.
 * En móvil (< sm) todo se apila centrado y simétrico; desde sm se distribuye
 * en columnas compactas. Los datos de contacto extensos (mapa embebido, botón
 * de WhatsApp) viven en la sección de ubicación y en el botón flotante, así
 * que acá solo queda una referencia breve.
 */

interface NavItem {
  label: string
  to: string
}

interface SocialItem {
  /** Texto alternativo / tooltip del botón (incluye el handle). */
  label: string
  href: string
  icon: (props: { className?: string }) => React.JSX.Element
}

const NAV_LINKS: NavItem[] = [
  { label: 'Reservar', to: '/#reservas' },
  { label: 'Torneos', to: '/torneos' },
  // La tabla de goleadores no tiene ruta propia: vive como pestaña dentro de
  // cada torneo, así que el enlace lleva al listado de torneos.
  { label: 'Goleadores', to: '/torneos' },
  { label: 'Mis Turnos', to: '/mis-reservas' },
  { label: 'Admin', to: '/admin' },
]

const SOCIAL_LINKS: SocialItem[] = [
  { label: 'Instagram — @copa5futbol', href: 'https://instagram.com', icon: InstagramIcon },
  { label: 'TikTok — @copa5complejo', href: 'https://tiktok.com', icon: TikTokIcon },
  { label: 'WhatsApp — Canal / Comunidad oficial', href: WHATSAPP_HREF, icon: WhatsAppIcon },
]

const ADDRESS = 'Av. Deportiva 1250, Cancha Central'
const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ADDRESS)}`

/* El lima de marca (#c5d86d) sobre el fondo claro (neutral-100) queda en ~1.4:1
   de contraste: ilegible. En modo claro el hover pasa a neutral-900; en oscuro,
   donde el lima si contrasta, se mantiene. */
const HOVER_LIME = 'transition-colors hover:text-neutral-900 dark:hover:text-[#c5d86d]'

export default function Footer(): React.JSX.Element {
  return (
    <footer className="mt-10 border-t border-neutral-200/80 bg-neutral-100/90 text-neutral-600 transition-colors dark:border-white/10 dark:bg-[#15070a] dark:text-neutral-400">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 justify-items-center gap-6 text-center sm:grid-cols-2 sm:justify-items-start sm:gap-5 sm:text-left lg:grid-cols-3 lg:gap-8">
          {/* Marca */}
          <div>
            <Logo subtitle="Canchas de fútbol 5 y torneos" />
          </div>

          {/* Navegación compacta en dos columnas */}
          <nav aria-label="Navegación del complejo">
            <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs font-medium sm:grid sm:grid-flow-col sm:grid-rows-3 sm:justify-start sm:gap-x-6 sm:gap-y-1">
              {NAV_LINKS.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className={`inline-flex py-1 ${HOVER_LIME}`}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Pagos, ubicación y redes, agrupados en el extremo derecho */}
          <div className="flex flex-col items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 sm:col-span-2 sm:items-end lg:col-span-1">
            <div className="flex flex-col items-center gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-1">
              <p className="inline-flex items-center gap-1.5">
                <ShieldCheckIcon className="size-3.5 shrink-0" />
                Pagos seguros con Mercado Pago
              </p>
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1.5 ${HOVER_LIME}`}
              >
                <MapPinIcon className="size-3.5 shrink-0" />
                {ADDRESS}
              </a>
            </div>

            {/* Redes: centradas en mobile, alineadas a la derecha desde sm */}
            <div className="flex items-center justify-center gap-3 sm:justify-end">
              {SOCIAL_LINKS.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    title={social.label}
                    className="inline-flex items-center justify-center rounded-full border border-transparent bg-neutral-200/80 p-1.5 transition-colors hover:bg-[#c5d86d] hover:text-neutral-900 dark:border-white/15 dark:bg-white/10 dark:text-neutral-200 dark:hover:border-transparent dark:hover:bg-[#c5d86d] dark:hover:text-neutral-900"
                  >
                    <Icon className="size-4" />
                  </a>
                )
              })}
            </div>
          </div>
        </div>

        {/* Copyright y legales en un solo renglón */}
        <div className="mt-6 border-t border-neutral-200/70 pt-4 dark:border-white/5">
          <div className="flex flex-col items-center justify-between gap-2 text-center text-[11px] sm:flex-row sm:text-left">
            <p>© 2026 Copa 5. Todos los derechos reservados.</p>
            <p className="flex items-center gap-3">
              <Link to="/reglamento" className={HOVER_LIME}>
                Reglamento
              </Link>
              <span aria-hidden="true" className="text-neutral-300 dark:text-white/20">
                ·
              </span>
              <Link to="/politica-de-cancelacion" className={HOVER_LIME}>
                Cancelaciones
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ---------------------------------------------------------------------------
   Íconos (estilo lucide, SVG inline: el proyecto no depende de lucide-react)
   ------------------------------------------------------------------------ */

function MapPinIcon({ className }: { className?: string }): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? 'size-3.5'}
      aria-hidden="true"
    >
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function ShieldCheckIcon({ className }: { className?: string }): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? 'size-3.5'}
      aria-hidden="true"
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

function InstagramIcon({ className }: { className?: string }): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? 'size-4'}
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <path d="M17.5 6.5h.01" />
    </svg>
  )
}

function TikTokIcon({ className }: { className?: string }): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? 'size-4'}
      aria-hidden="true"
    >
      {/* Nota musical: tallo tangent a la cuerda + bandera, gesto del logo. */}
      <path d="M14 4v12" />
      <circle cx="10" cy="16" r="4" />
      <path d="M14 4c2.6.6 4.7 2.6 5.4 5.2" />
    </svg>
  )
}
