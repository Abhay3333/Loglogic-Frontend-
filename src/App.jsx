import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { supabase } from './lib/supabase'
import LandingPage from './pages/LandingPage'
import PricingPage from './pages/Pricing'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedDashboard from './components/ProtectedDashboard'
import Onboarding from './pages/Onboarding'
import Login from './pages/Login'
import Signup from './pages/Signup'
import AcceptInvite from './pages/AcceptInvite'
import PrivacyPage from './pages/Privacy'
import TermsPage from './pages/Terms'
import DocsPage from './pages/Docs'
import ChangelogPage from './pages/Changelog'
import StatusPage from './pages/Status'
import DashboardPage from './pages/Dashboard'
import LiveTailPage from './pages/LiveTail'
import HistoricalLogsPage from './pages/HistoricalLogs'
import AlertsPage from './pages/Alerts'
import IntegrationsPage from './pages/Integrations'
import IncidentsPage from './pages/Incidents'
import SettingsPage from './pages/Settings'
import AppPricing from './pages/AppPricing'
import AdminDashboard from './pages/AdminDashboard'
import AdminInfrastructure from './pages/AdminInfrastructure'
import AdminSecurityBilling from './pages/AdminSecurityBilling'
import { getOrganizations } from './api/organization'

// Admin routes require a real Supabase session AND an elevated role
// (owner/admin) in at least one workspace. The old localStorage flag was
// spoofable and set on any login, so any signed-in user could reach the
// platform console — this closes that gap.
const AdminRoute = ({ children }) => {
  const [status, setStatus] = useState('checking') // checking | allowed | denied | unauth

  useEffect(() => {
    let active = true
    const verify = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        if (active) setStatus('unauth')
        return
      }
      try {
        const { organizations = [] } = await getOrganizations()
        const elevated = organizations.some(
          (o) => o.role === 'owner' || o.role === 'admin'
        )
        if (active) setStatus(elevated ? 'allowed' : 'denied')
      } catch {
        if (active) setStatus('denied')
      }
    }
    verify()
    return () => { active = false }
  }, [])

  if (status === 'checking') {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center font-mono text-primary">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <span>[VERIFYING ADMIN ACCESS...]</span>
      </div>
    )
  }

  if (status === 'unauth') return <Navigate to="/login" replace />
  if (status === 'denied') return <Navigate to="/app/dashboard" replace />

  return children
}

const AppContent = () => {
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'
  const isSignupPage = location.pathname === '/signup'
  const isPrivateAppPage = location.pathname.startsWith('/app')
  const isAdminPage = location.pathname.startsWith('/admin')

  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        localStorage.setItem('loglogic_auth', 'true')
      } else {
        localStorage.removeItem('loglogic_auth')
      }
      setCheckingAuth(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        localStorage.setItem('loglogic_auth', 'true')
      } else {
        localStorage.removeItem('loglogic_auth')
      }
      setCheckingAuth(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center font-mono text-primary">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <span>[BOOTING LOGLOGIC SYSTEM...]</span>
      </div>
    )
  }

  return (
    <>
      {!isLoginPage && !isSignupPage && !isPrivateAppPage && !isAdminPage && <Navbar />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/changelog" element={<ChangelogPage />} />
        <Route path="/status" element={<StatusPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/invite" element={<AcceptInvite />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/app" element={<ProtectedDashboard />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="live" element={<LiveTailPage />} />
          <Route path="logs" element={<HistoricalLogsPage />} />
          <Route path="alerts" element={<AlertsPage />} />
          <Route path="integrations" element={<IntegrationsPage />} />
          <Route path="incidents" element={<IncidentsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="pricing" element={<AppPricing />} />
          <Route path="onboarding" element={<Onboarding />} />
        </Route>
        <Route
          path="/admin/dashboard"
          element={(
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          )}
        />
        <Route
          path="/admin/infrastructure"
          element={(
            <AdminRoute>
              <Navigate to="/admin/queues" replace />
            </AdminRoute>
          )}
        />
        <Route
          path="/admin/queues"
          element={(
            <AdminRoute>
              <AdminInfrastructure />
            </AdminRoute>
          )}
        />
        <Route
          path="/admin/alerts"
          element={(
            <AdminRoute>
              <AdminInfrastructure />
            </AdminRoute>
          )}
        />
        <Route
          path="/admin/billing"
          element={(
            <AdminRoute>
              <AdminSecurityBilling />
            </AdminRoute>
          )}
        />
        <Route
          path="/admin/settings"
          element={(
            <AdminRoute>
              <AdminSecurityBilling />
            </AdminRoute>
          )}
        />
      </Routes>
      {!isLoginPage && !isSignupPage && !isPrivateAppPage && !isAdminPage && <Footer />}
    </>
  )
}

const App = () => {
  return (
    <div>
      <Router>
        <AppContent />
      </Router>
    </div>
  )
}

export default App
