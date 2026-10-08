import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'

export function RequireAuth({ children }: { children: React.JSX.Element }): React.JSX.Element {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return children
}

export function RequireClient({ children }: { children: React.JSX.Element }): React.JSX.Element {
  const { isAuthenticated, isAdmin } = useAuth()
  const location = useLocation()
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  if (isAdmin) {
    return <Navigate to="/admin" replace />
  }
  return children
}

export function RequireAdmin({ children }: { children: React.JSX.Element }): React.JSX.Element {
  const { isAuthenticated, isAdmin } = useAuth()
  const location = useLocation()
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  if (!isAdmin) {
    return <Navigate to="/" replace state={{ denied: true }} />
  }
  return children
}