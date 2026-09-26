import { Spinner } from '@heroui/react'

export default function Loading({ label = 'Cargando…' }: { label?: string }): React.JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-zinc-500">
      <Spinner size="lg" />
      <p className="text-sm">{label}</p>
    </div>
  )
}