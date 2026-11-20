import { useEffect, useState } from 'react'
import { ApiError, getHealth, HEALTH_MESSAGES } from '../../api/health'

type HealthState = { kind: 'checking' } | { kind: 'up'; checkedAt: string } | { kind: 'error'; message: string }

export function HealthPanel({ getToken }: { getToken?: () => Promise<string> }) {
  const [state, setState] = useState<HealthState>({ kind: 'checking' })
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    void getHealth({ getToken, signal: controller.signal }).then(() => {
      if (!controller.signal.aborted) setState({ kind: 'up', checkedAt: new Date().toLocaleTimeString('en-IE') })
    }).catch(error => {
      if (!controller.signal.aborted) setState({
        kind: 'error', message: HEALTH_MESSAGES[error instanceof ApiError ? error.kind : 'network'],
      })
    })
    return () => controller.abort()
  }, [getToken, attempt])

  return (
    <section className="panel connection-panel" aria-labelledby="connection-title">
      <div className="connection-heading">
        <div><p className="eyebrow">LIVE CONNECTION</p><h2 id="connection-title">Backend connection</h2></div>
        <button className="secondary" disabled={state.kind === 'checking'} onClick={() => {
          setState({ kind: 'checking' })
          setAttempt(attempt + 1)
        }}>
          {state.kind === 'checking' ? 'Checking...' : 'Check again'}
        </button>
      </div>
      <div role="status" aria-live="polite">
        {state.kind === 'checking' && <p>Checking backend...</p>}
        {state.kind === 'up' && <p><span className="badge accent">Backend: UP</span> <span className="small muted">Last checked at {state.checkedAt} (your device time)</span></p>}
        {state.kind === 'error' && <p className="connection-error">{state.message}</p>}
      </div>
      <p className="small muted">Checks whether the application can reach the backend. This does not verify database, simulation or authentication enforcement.</p>
    </section>
  )
}
