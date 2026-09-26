interface SkeletonProps {
  className?: string
}

export default function Skeleton({ className = '' }: SkeletonProps): React.JSX.Element {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-xl bg-coffee/10 dark:bg-mauve/30 ${className}`}
    />
  )
}