import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

interface FadeUpProps {
  children: ReactNode
  className?: string
  delayMs?: number
}

export default function FadeUp({
  children,
  className = '',
  delayMs = 0,
}: FadeUpProps): React.JSX.Element {
  const prefersReducedMotion = useMemo(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(prefersReducedMotion)

  useEffect(() => {
    if (prefersReducedMotion) return
    const element = ref.current
    if (element === null) return
    const observer = new IntersectionObserver(
      (entries) => {
        setVisible(entries[0].isIntersecting)
      },
      { threshold: 0.12, rootMargin: '0px 0px -48px 0px' },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [prefersReducedMotion])

  return (
    <div
      ref={ref}
      className={`${visible ? 'animate-fade-in-up' : 'opacity-0'} ${className}`}
      style={delayMs > 0 ? { animationDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </div>
  )
}