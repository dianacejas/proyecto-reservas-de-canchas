import { RouterProvider } from '@heroui/react'
import { lazy, Suspense } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import Footer from './components/layout/Footer'
import Navbar from './components/layout/Navbar'
import Loading from './components/common/Loading'
import ErrorBoundary from './components/common/ErrorBoundary'
import ScrollToTop from './components/common/ScrollToTop'
import WhatsAppButton from './components/whatsapp/WhatsAppButton'
import { RequireAdmin, RequireClient } from './components/common/AuthGuards'
import ReservasPage from './pages/ReservasPage'

const AdminPage = lazy(() => import('./pages/AdminPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const MyBookingsPage = lazy(() => import('./pages/MyBookingsPage'))
const NotFoundView = lazy(() => import('./pages/NotFoundView'))
const PagoResultadoPage = lazy(() => import('./pages/PagoResultadoPage'))
const PoliticaCancelacionPage = lazy(() => import('./pages/PoliticaCancelacionPage'))
const ReglamentoPage = lazy(() => import('./pages/ReglamentoPage'))
const ComunidadPage = lazy(() => import('./pages/ComunidadPage'))
const TorneoPage = lazy(() => import('./pages/TorneoPage'))
const TorneosPage = lazy(() => import('./pages/TorneosPage'))

export default function App(): React.JSX.Element {
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <RouterProvider navigate={navigate}>
      <div className="flex min-h-svh w-full max-w-full flex-col overflow-x-hidden bg-neutral-950 text-neutral-100">
        <ScrollToTop />
        <Navbar />
        <main className={`w-full flex-1 pt-20 ${isHome ? '' : 'mx-auto max-w-7xl px-6 pb-6 sm:pb-8'}`}>
          <ErrorBoundary key={location.pathname}>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<ReservasPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/mis-reservas"
                element={
                  <RequireClient>
                    <MyBookingsPage />
                  </RequireClient>
                }
              />
              <Route
                path="/admin"
                element={
                  <RequireAdmin>
                    <AdminPage />
                  </RequireAdmin>
                }
              />
              <Route path="/torneos" element={<TorneosPage />} />
              <Route path="/torneos/:id" element={<TorneoPage />} />
              <Route path="/comunidad" element={<ComunidadPage />} />
              <Route path="/pago/:status" element={<PagoResultadoPage />} />
              <Route path="/pago/sandbox/:paymentId/confirmar" element={<PagoResultadoPage />} />
              <Route path="/reglamento" element={<ReglamentoPage />} />
              <Route path="/politica-de-cancelacion" element={<PoliticaCancelacionPage />} />
              <Route path="*" element={<NotFoundView />} />
            </Routes>
          </Suspense>
          </ErrorBoundary>
        </main>
        <Footer />
        <WhatsAppButton />
      </div>
    </RouterProvider>
  )
}
