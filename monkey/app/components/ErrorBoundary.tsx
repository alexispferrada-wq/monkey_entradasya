'use client'

import React from 'react'

interface Props {
  children: React.ReactNode
  /** Custom fallback UI — if omitted, the default card is shown */
  fallback?: React.ReactNode
  /** Called when the boundary catches an error (useful for error reporting) */
  onError?: (error: Error, info: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
}

/**
 * Class-based Error Boundary (React requires class components for this).
 * Wrap any subtree that might throw during rendering, e.g.:
 *
 *   <ErrorBoundary>
 *     <SomeDataFetchingComponent />
 *   </ErrorBoundary>
 *
 * The boundary catches errors during render and lifecycle methods — NOT
 * inside async event handlers (those must use try/catch themselves).
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log to console in all envs; swap for Sentry/Datadog in production
    console.error('[ErrorBoundary]', error.message, info.componentStack)
    this.props.onError?.(error, info)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="glass-card rounded-2xl p-8 text-center my-4">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-white font-bold text-lg mb-2">Algo salió mal</h2>
          <p className="text-slate-400 text-sm mb-6">
            Ocurrió un error inesperado. Recarga la página o intenta de nuevo.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="btn-primary"
          >
            Reintentar
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Convenience default export for the common case of wrapping a single section.
 */
export default ErrorBoundary
