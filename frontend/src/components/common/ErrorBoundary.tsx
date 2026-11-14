import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary]', error, info.componentStack)
    }
  }

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children

    return (
      <div
        role="alert"
        className="mx-auto my-16 flex max-w-md flex-col items-center gap-4 rounded-2xl border p-8 text-center shadow-sm border-white/10 bg-neutral-900/60"
      >
        <h2 className="text-lg font-bold text-white">
          Algo salió mal al cargar esta sección
        </h2>
        <p className="text-sm text-neutral-400">
          Ocurrió un error inesperado. Recargá la página para volver a intentarlo.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-xl bg-[#c5d86d] px-5 py-2.5 text-sm font-bold text-neutral-950 transition hover:brightness-95"
        >
          Recargar página
        </button>
      </div>
    )
  }
}
