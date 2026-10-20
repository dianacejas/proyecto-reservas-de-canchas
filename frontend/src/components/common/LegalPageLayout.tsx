import { Link } from 'react-router-dom'

/**
 * Shell compartido de las páginas legales (reglamento y política de
 * cancelación): encabezado con la fecha de actualización, aviso de contenido
 * de ejemplo, el cuerpo en una superficie de lectura y la vuelta al inicio.
 *
 * Es presentacional: cada página define su contenido y sus títulos con
 * <LegalSection>, así el texto se edita sin tocar el layout.
 *
 * El aviso de placeholder se mantiene mientras el producto esté en desarrollo:
 * evita que un texto de ejemplo se lea como la política definitiva del complejo.
 */

interface LegalSectionProps {
  title: string
  children: React.ReactNode
}

export function LegalSection({ title, children }: LegalSectionProps): React.JSX.Element {
  return (
    <section className="space-y-2">
      <h2 className="text-base font-bold tracking-tight text-coffee dark:text-[#f3efe8]">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed text-tertiary dark:text-mauve-soft">
        {children}
      </div>
    </section>
  )
}

interface LegalPageLayoutProps {
  eyebrow: string
  title: string
  intro: string
  updatedAt: string
  children: React.ReactNode
}

export default function LegalPageLayout({
  eyebrow,
  title,
  intro,
  updatedAt,
  children,
}: LegalPageLayoutProps): React.JSX.Element {
  return (
    <article className="mx-auto w-full max-w-3xl">
      <header>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-mauve/30 bg-lime/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-coffee dark:border-lime/30 dark:bg-lime/10 dark:text-lime">
          {eyebrow}
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-tertiary dark:text-mauve-soft">{intro}</p>
        <p className="mt-2 text-xs text-neutral-500 dark:text-mauve-soft">
          Última actualización: {updatedAt}
        </p>
      </header>

      <div
        role="note"
        className="mt-5 flex items-start gap-2.5 rounded-xl border border-amber-300/70 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-200"
      >
        <AlertIcon className="mt-0.5 size-4 shrink-0" />
        <p>
          <strong className="font-semibold">Contenido de ejemplo.</strong> Copa 5 está en fase de
          desarrollo: este documento es un placeholder y todavía no es la versión definitiva. Los
          plazos, importes y condiciones pueden cambiar antes del lanzamiento.
        </p>
      </div>

      <div className="mt-5 space-y-6 rounded-xl border border-line bg-cream p-5 shadow-surface dark:border-mauve dark:bg-coffee-elev sm:p-6">
        {children}
      </div>

      <div className="mt-6 text-xs">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-neutral-500 transition-colors hover:text-neutral-900 dark:text-mauve-soft dark:hover:text-[#c5d86d]"
        >
          <span aria-hidden="true">←</span>
          Volver al inicio
        </Link>
      </div>
    </article>
  )
}

/* Ícono de advertencia (estilo lucide, SVG inline: el proyecto no depende de
   lucide-react). */
function AlertIcon({ className }: { className?: string }): React.JSX.Element {
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
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  )
}
