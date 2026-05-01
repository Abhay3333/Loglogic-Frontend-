import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import PricingPage from './pages/Pricing'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Login from './pages/Login'
import Signup from './pages/Signup'
import PrivacyPage from './pages/Privacy'
import TermsPage from './pages/Terms'
import DocsPage from './pages/Docs'
import ChangelogPage from './pages/Changelog'
import DashboardPage from './pages/Dashboard'
import LiveTailPage from './pages/LiveTail'
import HistoricalLogsPage from './pages/HistoricalLogs'
import AlertsPage from './pages/Alerts'
import SettingsPage from './pages/Settings'

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

  return (
    <>
      {!isLoginPage && !isSignupPage && !isPrivateAppPage && <Navbar />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/changelog" element={<ChangelogPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
        <Route
          path="/app/dashboard"
          element={(
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/app/live"
          element={(
            <ProtectedRoute>
              <LiveTailPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/app/logs"
          element={(
            <ProtectedRoute>
              <HistoricalLogsPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/app/alerts"
          element={(
            <ProtectedRoute>
              <AlertsPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/app/settings"
          element={(
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          )}
        />
      </Routes>
      {!isLoginPage && !isSignupPage && !isPrivateAppPage && <Footer />}
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
