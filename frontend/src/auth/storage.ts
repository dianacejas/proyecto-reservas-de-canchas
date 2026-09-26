import type { AuthUser } from '../types'

export interface StoredAuth {
  token: string
  user: AuthUser
}

export const UNAUTHORIZED_EVENT = 'canchas:unauth'

const STORAGE_KEY = 'canchas.auth'

export function loadAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return null
    const parsed = JSON.parse(raw) as StoredAuth
    if (typeof parsed?.token !== 'string' || parsed.token.length === 0 || parsed?.user?.id === undefined) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function saveAuth(auth: StoredAuth): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth))
}

export function clearAuth(): void {
  localStorage.removeItem(STORAGE_KEY)
}