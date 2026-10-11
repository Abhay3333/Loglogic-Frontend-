import React from 'react'
import * as Sentry from '@sentry/react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error) {
    if (import.meta.env.VITE_SENTRY_DSN) {
      Sentry.captureException(error)
    }
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="min-h-screen bg-[#0a0e14] text-[#f1f3fc] flex items-center justify-center px-6">
          <div className="max-w-md text-center">
            <h1 className="text-xl font-semibold">Something broke in LogLogic</h1>
            <p className="mt-2 text-sm text-[#a8abb3]">Reload the page. The crash was reported when error monitoring is configured.</p>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
