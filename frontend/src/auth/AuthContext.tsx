import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { login as apiLogin, register as apiRegister } from '../api'
import { AuthContext } from './auth-context'
import { clearAuth, loadAuth, saveAuth, type StoredAuth } from './storage'

export function AuthProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [auth, setAuth] = useState<StoredAuth | null>(loadAuth)

  useEffect(() => {
    function clearSession(): void {
      setAuth(null)
      clearAuth()
    }
    window.addEventListener('canchas:unauth', clearSession)
    return () => window.removeEventListener('canchas:unauth', clearSession)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiLogin({ email, password })
    const next: StoredAuth = { token: data.token, user: data.user }
    setAuth(next)
    saveAuth(next)
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    const data = await apiRegister({ name, email, password })
    const next: StoredAuth = { token: data.token, user: data.user }
    setAuth(next)
    saveAuth(next)
  }, [])

  const logout = useCallback(() => {
    setAuth(null)
    clearAuth()
  }, [])

  const value = useMemo(
    () => ({
      user: auth?.user ?? null,
      token: auth?.token ?? null,
      isAuthenticated: auth !== null,
      isAdmin: auth?.user?.role === 'admin',
      login,
      register,
      logout,
    }),
    [auth, login, register, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}