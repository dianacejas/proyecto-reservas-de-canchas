import { useId } from 'react'
import { crestInitials, teamCrestColor, withColorAlpha } from '../../utils/crest'

export type CrestSize = 'xs' | 'sm' | 'md' | 'lg'

const SIZE_CLASS: Record<CrestSize, string> = {
  xs: 'size-5 sm:size-6',
  sm: 'size-6 sm:size-8',
  md: 'size-8 sm:size-10',
  lg: 'size-12 sm:size-16',
}

const LABEL_CLASS: Record<CrestSize, string> = {
  xs: 'text-[9px] sm:text-[10px]',
  sm: 'text-[10px] sm:text-xs md:text-sm',
  md: 'text-xs sm:text-sm md:text-base',
  lg: 'text-base sm:text-xl md:text-2xl',
}

const SHIELD =
  'M22 1.6C28 3.4 40.4 7.6 40.4 7.6V23.2C40.4 34.5 32 42.2 22 46C12 42.2 3.6 34.5 3.6 23.2V7.6C3.6 7.6 16 3.4 22 1.6Z'

const SHIELD_HIGHLIGHT =
  'M22 4.4C16 5.9 7 9 7 9V13.4C11.4 15.4 16.4 16.4 22 16.4S32.6 15.4 37 13.4V9C37 9 28 5.9 22 4.4Z'

const DEEP = '#0b0407'

export default function TeamCrest({
  name,
  color,
  size = 'sm',
  dimmed = false,
  className,
}: {
  name: string
  color?: string
  size?: CrestSize
  dimmed?: boolean
  className?: string
}): React.JSX.Element {
  const base = color ?? teamCrestColor(name)
  const glow = withColorAlpha(base, 0.36)
  const gradientId = `crest-${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const shellClass = [
    'relative inline-flex shrink-0 items-center justify-center',
    SIZE_CLASS[size],
    dimmed ? 'grayscale' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span
      className={shellClass}
      style={
        dimmed
          ? undefined
          : {
              filter: `drop-shadow(0 1px 2px rgba(0,0,0,0.45)) drop-shadow(0 0 7px ${glow})`,
            }
      }
      aria-hidden="true"
    >
      <svg viewBox="0 0 44 48" className="size-full" focusable="false">
        <defs>
          <linearGradient id={gradientId} x1="0.2" y1="0" x2="0.75" y2="1">
            <stop offset="0" stopColor={base} />
            <stop offset="1" stopColor={`color-mix(in oklab, ${base} 42%, ${DEEP})`} />
          </linearGradient>
        </defs>
        <path d={SHIELD} fill={`url(#${gradientId})`} />
        <path d={SHIELD_HIGHLIGHT} fill="rgba(255,255,255,0.16)" />
        <g transform="translate(22 24) scale(0.9) translate(-22 -24)">
          <path
            d={SHIELD}
            fill="none"
            stroke="rgba(255,255,255,0.24)"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </g>
      </svg>
      <span
        className={`pointer-events-none absolute inset-0 flex items-center justify-center pb-[6%] font-black uppercase leading-none text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.6)] ${LABEL_CLASS[size]}`}
      >
        {crestInitials(name)}
      </span>
    </span>
  )
}
