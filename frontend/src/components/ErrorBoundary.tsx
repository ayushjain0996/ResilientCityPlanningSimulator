import { Component } from 'react'
import type { ReactNode } from 'react'

export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() { return { failed: true } }

  render() {
    if (this.state.failed) return (
      <main className="panel error-page" role="alert">
        <h1>The workspace could not be displayed.</h1>
        <p>Reload to try again. Unsaved inputs will be cleared.</p>
        <button className="primary" onClick={() => window.location.reload()}>Reload application</button>
      </main>
    )
    return this.props.children
  }
}
