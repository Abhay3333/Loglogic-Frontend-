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
import DashboardPage from './pages/Dashboard'
import LiveTailPage from './pages/LiveTail'
import HistoricalLogsPage from './pages/HistoricalLogs'
import AlertsPage from './pages/Alerts'
import SettingsPage from './pages/Settings'
import AdminDashboard from './pages/AdminDashboard'
import AdminInfrastructure from './pages/AdminInfrastructure'
import AdminSecurityBilling from './pages/AdminSecurityBilling'

const isAuthenticated = () => localStorage.getItem('loglogic_auth') === 'true'

const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

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
          <Route path="settings" element={<SettingsPage />} />
          <Route path="onboarding" element={<Onboarding />} />
        </Route>
        <Route
          path="/admin/dashboard"
          element={(
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/admin/infrastructure"
          element={(
            <ProtectedRoute>
              <Navigate to="/admin/queues" replace />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/admin/queues"
          element={(
            <ProtectedRoute>
              <AdminInfrastructure />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/admin/alerts"
          element={(
            <ProtectedRoute>
              <AdminInfrastructure />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/admin/billing"
          element={(
            <ProtectedRoute>
              <AdminSecurityBilling />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/admin/settings"
          element={(
            <ProtectedRoute>
              <AdminSecurityBilling />
            </ProtectedRoute>
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
