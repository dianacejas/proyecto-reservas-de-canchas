import { loadAuth, UNAUTHORIZED_EVENT } from '../auth/storage'

const BASE_URL = '/api'

interface ApiEnvelope<T> {
  data?: T
  error?: { message?: string; details?: unknown }
}

export class ApiError extends Error {
  readonly status: number
  readonly details?: unknown

  constructor(status: number, message: string, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error && error.message.length > 0
    ? error.message
    : 'Ocurrió un error inesperado'
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const auth = loadAuth()
  const headers = new Headers(init.headers)
  if (init.body !== undefined) headers.set('Content-Type', 'application/json')
  if (auth !== null) headers.set('Authorization', `Bearer ${auth.token}`)

  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}`, { ...init, headers })
  } catch {
    throw new ApiError(0, 'No se pudo conectar con el servidor. Verificá que el backend esté corriendo.')
  }

  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null

  if (!response.ok) {
    if (response.status === 401) {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
    }
    const message = payload?.error?.message ?? `Error ${response.status}`
    throw new ApiError(response.status, message, payload?.error?.details)
  }

  return (payload as ApiEnvelope<T>).data as T
}