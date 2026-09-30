import { Alert, Button } from '@heroui/react'
import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { getErrorMessage } from '../api/client'

type Mode = 'login' | 'register'

export default function LoginPage(): React.JSX.Element {
  const { isAuthenticated, login, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as { from?: string; denied?: boolean } | null

  const [mode, setMode] = useState<Mode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isLogin = mode === 'login'
  const canSubmit =
    !isSubmitting &&
    email.trim().length > 0 &&
    password.length >= 6 &&
    (isLogin || name.trim().length >= 2)

  function switchMode(next: Mode): void {
    setMode(next)
    setError(null)
  }

  async function handleSubmit(): Promise<void> {
    setError(null)
    setIsSubmitting(true)
    try {
      if (isLogin) {
        await login(email.trim(), password)
      } else {
        await register(name.trim(), email.trim(), password)
      }
      navigate(state?.from ?? '/', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
      setIsSubmitting(false)
    }
  }

  if (isAuthenticated) {
    return <Navigate to={state?.from ?? '/'} replace />
  }

  return (
    <div className="mx-auto max-w-md space-y-6 py-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">{isLogin ? 'Ingresá' : 'Creá tu cuenta'}</h1>
        <p className="mt-1 text-sm text-tertiary dark:text-mauve-soft">
          {isLogin
            ? 'Iniciá sesión para pagar tus reservas online.'
            : 'Registrate para gestionar y pagar tus reservas.'}
        </p>
      </header>

      {state?.denied === true && (
        <Alert status="warning">
          <Alert.Description>Necesitás una cuenta de administrador para acceder ahí.</Alert.Description>
        </Alert>
      )}

      <div className="flex gap-2">
        <Button
          variant={isLogin ? 'secondary' : 'ghost'}
          size="sm"
          className="min-h-11 flex-1"
          onPress={() => switchMode('login')}
        >
          Iniciar sesión
        </Button>
        <Button
          variant={!isLogin ? 'secondary' : 'ghost'}
          size="sm"
          className="min-h-11 flex-1"
          onPress={() => switchMode('register')}
        >
          Registrarse
        </Button>
      </div>

      <div className="space-y-4 rounded-2xl border border-line bg-cream p-6 shadow-surface dark:border-mauve dark:bg-coffee-elev">
        {!isLogin && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-coffee/80 dark:text-mauve-soft" htmlFor="auth-name">
              Nombre y apellido
            </label>
            <input
              id="auth-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ej: Juan Pérez"
              className="min-h-11 w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-coffee outline-none transition-colors focus:border-lime dark:border-mauve dark:bg-coffee-elev dark:text-[#f3efe8]"
            />
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-coffee/80 dark:text-mauve-soft" htmlFor="auth-email">
            Email
          </label>
          <input
            id="auth-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="tu@email.com"
            className="min-h-11 w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-coffee outline-none transition-colors focus:border-lime dark:border-mauve dark:bg-coffee-elev dark:text-[#f3efe8]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-coffee/80 dark:text-mauve-soft" htmlFor="auth-password">
            Contraseña
          </label>
          <input
            id="auth-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Mínimo 6 caracteres"
            className="min-h-11 w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-coffee outline-none transition-colors focus:border-lime dark:border-mauve dark:bg-coffee-elev dark:text-[#f3efe8]"
          />
        </div>

        {error !== null && (
          <Alert status="danger">
            <Alert.Description>{error}</Alert.Description>
          </Alert>
        )}

        <Button variant="primary" className="min-h-11 w-full" isDisabled={!canSubmit} onPress={handleSubmit}>
          {isSubmitting ? 'Enviando…' : isLogin ? 'Ingresar' : 'Crear cuenta'}
        </Button>

        {isLogin && (
          <p className="text-xs text-tertiary dark:text-mauve-soft">
            Demo admin: admin@canchas.com · admin123 — Demo cliente: juan@canchas.com · juan123
          </p>
        )}
      </div>
    </div>
  )
}