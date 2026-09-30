import { Navigate, Route, Routes } from 'react-router-dom'
import Footer from './components/layout/Footer'
import Navbar from './components/layout/Navbar'
import WhatsAppButton from './components/whatsapp/WhatsAppButton'
import { RequireAdmin } from './components/common/AuthGuards'
import AdminPage from './pages/AdminPage'
import LoginPage from './pages/LoginPage'
import ReservasPage from './pages/ReservasPage'
import TorneoPage from './pages/TorneoPage'
import TorneosPage from './pages/TorneosPage'

export default function App(): React.JSX.Element {
  return (
    <div className="flex min-h-svh w-full max-w-full flex-col overflow-x-hidden bg-paper text-coffee transition-colors dark:bg-coffee dark:text-[#f3efe8]">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8">
        <Routes>
          <Route path="/" element={<ReservasPage />} />
          <Route path="/login" element={<LoginPage />} />
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}