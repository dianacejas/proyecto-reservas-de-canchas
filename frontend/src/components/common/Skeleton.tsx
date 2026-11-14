interface SkeletonProps {
  className?: string
}

export default function Skeleton({ className = '' }: SkeletonProps): React.JSX.Element {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-xl bg-neutral-200/80 dark:bg-neutral-800/80 ${className}`}
    />
  )
}