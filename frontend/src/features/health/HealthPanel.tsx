import { useEffect, useState } from 'react'
import { getHealth } from '../../api/health'

type HealthState =
  | { kind: 'loading' }
  | { kind: 'up'; status: string }
  | { kind: 'unreachable' }

function HealthPanel() {
  const [state, setState] = useState<HealthState>({ kind: 'loading' })

  useEffect(() => {
    let cancelled = false
    getHealth()
      .then((health) => {
        if (!cancelled) {
          setState({ kind: 'up', status: health.status })
        }
      })
      .catch(() => {
        if (!cancelled) {
          setState({ kind: 'unreachable' })
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section aria-label="Backend health">
      {state.kind === 'loading' && <p>Checking backend...</p>}
      {state.kind === 'up' && <p>Backend: {state.status}</p>}
      {state.kind === 'unreachable' && <p>Backend unreachable</p>}
    </section>
  )
}

export default HealthPanel
