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
      <span className="inline-flex shrink-0 items-center justify-center rounded-xl border p-1.5 transition-all duration-300 border-white/5 bg-[#1b0a0e]/50 hover:bg-[#1b0a0e]/70">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className={className ?? 'h-8 w-8 sm:h-9 sm:w-9'}
        >
          <path
            d="M6 4h12v4a6 6 0 0 1-12 0V4Z"
            className="stroke-white"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6 6H4a2 2 0 0 0 0 4h2M18 6h2a2 2 0 0 1 0 4h-2"
            className="stroke-white"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 14v4M8 20h8"
            className="stroke-white"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          <text
            x="12"
            y="12.5"
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-[#c5d86d] text-[10.5px] font-black"
          >
            5
          </text>
        </svg>
      </span>
      {showText && (
        <span className="flex flex-col leading-none">
          <span className="text-base font-extrabold tracking-tight text-white sm:text-lg">
            Copa 5
          </span>
          <span className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-neutral-400 sm:text-[11px]">
            {subtitle}
          </span>
        </span>
      )}
    </span>
  )
}