interface LogoProps {
  className?: string
  showText?: boolean
  subtitle?: string
}

export default function Logo({
  className,
  showText = true,
  subtitle = 'Complejo Deportivo',
}: LogoProps): React.JSX.Element {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg viewBox="0 0 64 64" aria-hidden="true" className={className ?? 'h-9 w-9'}>
        <rect width="64" height="64" rx="14" className="fill-coffee" />
        <path d="M24 12c0 6 3 10 8 10s8-4 8-10z" className="fill-lime" />
        <ellipse cx="32" cy="12" rx="8" ry="2.6" className="fill-evergreen" />
        <path
          d="M24 14c-4.5 2-7 5.5-7 9.5 0 3 1.2 5.2 3.4 6.4"
          stroke="#c57b57"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M40 14c4.5 2 7 5.5 7 9.5 0 3-1.2 5.2-3.4 6.4"
          stroke="#c57b57"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <text
          x="32"
          y="22"
          textAnchor="middle"
          fontSize="13"
          fontWeight="800"
          className="fill-coffee"
          dy="0.35em"
        >
          5
        </text>
        <rect x="30" y="22" width="4" height="8" rx="2" className="fill-cinnamon" />
        <path d="M22 30h20l-2 8H24z" className="fill-cinnamon" />
        <path d="M20 38h24v4c0 4-3.5 6-8 6h-8c-4.5 0-8-2-8-6z" className="fill-evergreen" />
        <rect x="28" y="46" width="8" height="4" rx="2" className="fill-lime" />
      </svg>
      {showText && (
        <span className="flex flex-col leading-none">
          <span className="text-lg font-extrabold tracking-tight text-coffee dark:text-[#f3efe8]">
            Copa 5
          </span>
          <span className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-tertiary dark:text-mauve-soft">
            {subtitle}
          </span>
        </span>
      )}
    </span>
  )
}