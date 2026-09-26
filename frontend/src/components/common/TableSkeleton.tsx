import Skeleton from './Skeleton'

interface TableSkeletonProps {
  rows?: number
  label?: string
}

export default function TableSkeleton({
  rows = 6,
  label = 'Cargando datos…',
}: TableSkeletonProps): React.JSX.Element {
  return (
    <div role="status" aria-label={label} className="space-y-3">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  )
}