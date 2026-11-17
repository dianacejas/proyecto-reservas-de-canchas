import { Alert, Button } from '@heroui/react'
import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { getErrorMessage } from '../api/client'
import Logo from '../components/brand/Logo'
import { TextInput } from '../components/common/fields'

type Mode = 'login' | 'register'

interface FieldErrors {
  name?: string
  email?: string
  password?: string
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const AUTH_INPUT_CLASS =
  'bg-neutral-950 border-neutral-800 focus:border-[#c5d86d] focus:ring-1 focus:ring-[#c5d86d] text-white'

function validateAuthForm(mode: Mode, name: string, email: string, password: string): FieldErrors {
  const errors: FieldErrors = {}
  if (mode === 'register' && name.trim().length < 2) {
    errors.name = 'Ingresá tu nombre y apellido (mínimo 2 caracteres).'
  }
  if (!EMAIL_REGEX.test(email.trim())) {
    errors.email = 'Ingresá un correo electrónico válido.'
  }
  if (password.length < 6) {
    errors.password = 'La contraseña debe tener al menos 6 caracteres.'
  }
  return errors
}

export default function LoginPage(): React.JSX.Element {
  const { isAuthenticated, login, register } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as { from?: string; denied?: boolean } | null

  const [mode, setMode] = useState<Mode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isLogin = mode === 'login'

  function switchMode(next: Mode): void {
    setMode(next)
    setError(null)
    setFieldErrors({})
  }

  async function executeAuth(targetMode: Mode, targetName: string, targetEmail: string, targetPass: string): Promise<void> {
    setError(null)
    setIsSubmitting(true)
    try {
      if (targetMode === 'login') {
        await login(targetEmail.trim(), targetPass)
      } else {
        await register(targetName.trim(), targetEmail.trim(), targetPass)
      }
      navigate(state?.from ?? '/', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
      setIsSubmitting(false)
    }
  }

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault()
    const validation = validateAuthForm(mode, name, email, password)
    if (Object.keys(validation).length > 0) {
      setFieldErrors(validation)
      return
    }
    setFieldErrors({})
    void executeAuth(mode, name, email, password)
  }

  function handleQuickLogin(demoEmail: string, demoPassword: string): void {
    setMode('login')
    setEmail(demoEmail)
    setPassword(demoPassword)
    setFieldErrors({})
    void executeAuth('login', '', demoEmail, demoPassword)
  }

  if (isAuthenticated) {
    return <Navigate to={state?.from ?? '/'} replace />
  }

  return (
    <div className="grid min-h-[calc(100vh-8rem)] grid-cols-1 items-stretch gap-8 py-4 lg:grid-cols-2 lg:py-8">
      {/* Columna Izquierda: Inmersiva / Visual */}
      <section className="relative hidden flex-col justify-between overflow-hidden rounded-3xl border border-neutral-800/80 bg-neutral-950 p-10 shadow-2xl lg:flex">
        <img
          src="/images/canchas/nocturna.jpg"
          alt="Cancha nocturna Copa 5"
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/75 to-neutral-950/50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(197,216,109,0.16),transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />

        <div className="relative z-10 flex items-center justify-between">
          <Logo />
          <span className="rounded-full border border-[#c5d86d]/30 bg-[#c5d86d]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#c5d86d]">
            Córdoba · Fútbol 5
          </span>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-neutral-900/80 px-3.5 py-1.5 text-xs font-semibold text-neutral-300 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-[#c5d86d] shadow-[0_0_8px_#c5d86d]" />
            Pasión por el fútbol amateur
          </div>

          <h2 className="text-3xl font-black leading-tight tracking-tight text-white xl:text-4xl">
            Tu complejo deportivo, tus reservas y torneos en un solo lugar.
          </h2>

          <p className="max-w-md text-sm leading-relaxed text-neutral-300">
            Césped sintético FIFA Pro, iluminación LED 500 Lux y confirmación instantánea con seña online. Armá tu partido en segundos.
          </p>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="rounded-2xl border border-white/10 bg-neutral-900/75 p-3.5 backdrop-blur-sm">
              <p className="text-lg font-black text-[#c5d86d]">50%</p>
              <p className="text-xs text-neutral-400">Seña online</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-neutral-900/75 p-3.5 backdrop-blur-sm">
              <p className="text-lg font-black text-[#c5d86d]">÷ 10</p>
              <p className="text-xs text-neutral-400">Modo Vaquita</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-neutral-900/75 p-3.5 backdrop-blur-sm">
              <p className="text-lg font-black text-[#c5d86d]">24/7</p>
              <p className="text-xs text-neutral-400">Fixture en vivo</p>
            </div>
          </div>
        </div>
      </section>

      {/* Columna Derecha: Formulario */}
      <section className="flex items-center justify-center">
        <div className="w-full max-w-md space-y-6 rounded-3xl border border-neutral-800/80 bg-neutral-900/90 p-8 shadow-2xl">
          <div className="lg:hidden">
            <Logo />
          </div>

          <header className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight text-white">
              {isLogin ? 'Bienvenido de vuelta' : 'Creá tu cuenta'}
            </h1>
            <p className="text-sm text-neutral-400">
              {isLogin
                ? 'Iniciá sesión para gestionar tus turnos y torneos.'
                : 'Registrate para reservar canchas y seguir tu equipo.'}
            </p>
          </header>

          {state?.denied === true && (
            <Alert status="warning">
              <Alert.Description>Necesitás una cuenta de administrador para acceder ahí.</Alert.Description>
            </Alert>
          )}

          {/* Pestañas de navegación Login / Register */}
          <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-neutral-800 bg-neutral-950 p-1">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`rounded-lg py-2 text-sm font-bold transition-all ${
                isLogin
                  ? 'bg-[#c5d86d] text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`rounded-lg py-2 text-sm font-bold transition-all ${
                !isLogin
                  ? 'bg-[#c5d86d] text-neutral-950 shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Registrarse
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <TextInput
                  label="Nombre y apellido"
                  value={name}
                  onValueChange={(val) => {
                    setName(val)
                    if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }))
                  }}
                  placeholder="Ej: Juan Pérez"
                  inputClassName={AUTH_INPUT_CLASS}
                />
                {fieldErrors.name && <p className="text-xs font-medium text-rose-400">{fieldErrors.name}</p>}
              </div>
            )}

            <div className="space-y-1">
              <TextInput
                label="Email"
                type="email"
                value={email}
                onValueChange={(val) => {
                  setEmail(val)
                  if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }))
                }}
                placeholder="tu@email.com"
                inputClassName={AUTH_INPUT_CLASS}
              />
              {fieldErrors.email && <p className="text-xs font-medium text-rose-400">{fieldErrors.email}</p>}
            </div>

            <div className="space-y-1">
              <TextInput
                label="Contraseña"
                type="password"
                value={password}
                onValueChange={(val) => {
                  setPassword(val)
                  if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }))
                }}
                placeholder="Mínimo 6 caracteres"
                inputClassName={AUTH_INPUT_CLASS}
              />
              {fieldErrors.password && <p className="text-xs font-medium text-rose-400">{fieldErrors.password}</p>}
            </div>

            {error !== null && (
              <Alert status="danger">
                <Alert.Description>{error}</Alert.Description>
              </Alert>
            )}

            <Button
              type="submit"
              isDisabled={isSubmitting}
              className="w-full rounded-xl bg-[#c5d86d] py-3 font-black tracking-wide text-neutral-950 shadow-[0_0_20px_rgba(197,216,109,0.15)] transition-all hover:bg-[#b5c75d]"
            >
              {isSubmitting ? 'Ingresando…' : isLogin ? 'Ingresar ahora' : 'Crear cuenta'}
            </Button>
          </form>

          {/* Acceso Rápido Demo (QA) */}
          <div className="space-y-2.5 border-t border-neutral-800/80 pt-5">
            <p className="text-center text-[11px] font-bold uppercase tracking-widest text-neutral-500">
              Acceso Rápido Demo (QA)
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleQuickLogin('admin@canchas.com', 'admin123')}
                className="flex flex-col items-start rounded-xl border border-neutral-800 bg-neutral-950/80 px-3 py-2 text-left transition-colors hover:border-[#c5d86d]/50 hover:bg-neutral-950 disabled:opacity-50"
              >
                <span className="text-xs font-bold text-[#c5d86d]">Acceso Admin</span>
                <span className="text-[11px] text-neutral-400">admin@canchas.com</span>
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleQuickLogin('juan@canchas.com', 'juan123')}
                className="flex flex-col items-start rounded-xl border border-neutral-800 bg-neutral-950/80 px-3 py-2 text-left transition-colors hover:border-[#c5d86d]/50 hover:bg-neutral-950 disabled:opacity-50"
              >
                <span className="text-xs font-bold text-white">Acceso Cliente</span>
                <span className="text-[11px] text-neutral-400">juan@canchas.com</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
