import { useEffect, useState } from 'react'
import { ApiError, getMe, type MeResponse } from '../../api/me'

type MeState =
  | { kind: 'loading' }
  | { kind: 'confirmed'; me: MeResponse }
  | { kind: 'rejected'; status: number | null }

// Shows what the backend verified from the token. The browser's own view of the role is not enough to prove
// that the backend agrees, so this calls GET /api/me.
function MePanel() {
  const [state, setState] = useState<MeState>({ kind: 'loading' })

  useEffect(() => {
    let cancelled = false
    getMe()
      .then((me) => {
        if (!cancelled) {
          setState({ kind: 'confirmed', me })
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({ kind: 'rejected', status: error instanceof ApiError ? error.status : null })
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section aria-label="Backend view of your account">
      {state.kind === 'loading' && <p>Asking the backend who you are...</p>}
      {state.kind === 'confirmed' && (
        <p>
          Backend confirms: {state.me.email ?? 'no email'} · role {state.me.role ?? 'none'} · uid {state.me.uid}
        </p>
      )}
      {state.kind === 'rejected' && (
        <p role="alert">
          The backend did not accept your session
          {state.status !== null ? ` (status ${state.status})` : ''}. Sign out and sign in again.
        </p>
      )}
    </section>
  )
}

export default MePanel
