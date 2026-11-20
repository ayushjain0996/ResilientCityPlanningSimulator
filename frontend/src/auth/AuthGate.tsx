import { useEffect, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { createSession, signInMessage } from './session'
import type { Identity, Session } from './session'
import type { AppSettings } from './settings'

export function AuthGate({ settings, children }: {
  settings: AppSettings
  children: (identity: Identity | null, session: Session | null) => ReactNode
}) {
  const [session, setSession] = useState<Session | null>(null)
  const [identity, setIdentity] = useState<Identity | null>(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (settings.mode === 'preview' || settings.problems.length) return
    let active = true
    let unsubscribe = () => {}
    const timeout = window.setTimeout(() => {
      if (active) { setLoading(false); setError('Sign-in service is taking too long. Please reconnect.') }
    }, 15000)
    void createSession(settings).then(connection => {
      if (!active) return
      setSession(connection)
      unsubscribe = connection.subscribe(user => {
        if (!active) return
        window.clearTimeout(timeout)
        setIdentity(user)
        setLoading(false)
        setError('')
      }, () => {
        if (!active) return
        window.clearTimeout(timeout)
        setIdentity(null)
        setLoading(false)
        setError('Unable to verify your session. Please reconnect.')
      })
    }).catch(() => {
      if (!active) return
      window.clearTimeout(timeout)
      setLoading(false)
      setError('Sign-in service is unavailable. Check the application configuration and reconnect.')
    })
    return () => { active = false; window.clearTimeout(timeout); unsubscribe() }
  }, [settings, attempt])

  if (!settings.problems.length && settings.mode === 'preview') return children(null, null)
  if (identity?.role && !loading && !error) return children(identity, session)

  async function signIn(event: FormEvent) {
    event.preventDefault()
    if (!session || busy) return
    if (!email.trim() || !password) { setError('Enter your email and password.'); return }
    setBusy(true)
    setError('')
    try { await session.signIn(email.trim(), password) }
    catch (failure) { setError(signInMessage(failure)) }
    finally { setPassword(''); setBusy(false) }
  }

  async function accountAction(action: 'refresh' | 'signOut') {
    if (!session) return
    setBusy(true)
    setError('')
    try { await session[action]() }
    catch { setError('Unable to update your session. Please try again.') }
    finally { setBusy(false) }
  }

  return (
    <main className="auth-page">
      <section className="auth-intro">
        <p className="eyebrow">RESILIENT CITY / GROUP 11</p>
        <h1>Plan with confidence.<br/>Prepare together.</h1>
        <p>A shared workspace for urban planning and emergency preparedness.</p>
      </section>
      <section className="panel auth-card" aria-label="Staff access">
        {settings.problems.length > 0 ? <>
          <h2>Configuration required</h2>
          <p>This installation has not been connected to its sign-in service.</p>
          <ul>{settings.problems.map(problem => <li key={problem}>{problem}</li>)}</ul>
          <p>Contact the project administrator. No account access has been granted.</p>
        </> : loading ? <p role="status">Restoring your session...</p> : identity ? <>
          <h2>Role not assigned</h2>
          <p>Your account does not have a recognised staff role. Ask your administrator to assign one.</p>
          <button className="primary" disabled={busy} onClick={() => void accountAction('refresh')}>Refresh access</button>
          <button className="secondary" disabled={busy} onClick={() => void accountAction('signOut')}>Sign out</button>
        </> : <>
          <p className="eyebrow">STAFF ACCESS</p>
          <h2>Welcome back</h2>
          <p>Sign in with your organisation's account.</p>
          <form onSubmit={signIn}>
            <label htmlFor="email">Email address</label>
            <input id="email" type="email" autoComplete="username" required value={email}
              onChange={event => setEmail(event.target.value)} disabled={busy} />
            <label htmlFor="password">Password</label>
            <input id="password" type="password" autoComplete="current-password" required value={password}
              onChange={event => setPassword(event.target.value)} disabled={busy} />
            <button className="primary" type="submit" disabled={busy || !session}>
              {busy ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <p className="small muted">Accounts are provided by your administrator. Contact them for access or password assistance.</p>
        </>}
        {error && <div role="alert"><p className="field-error">{error}</p>
          <button className="text-button" disabled={busy} onClick={() => {
            setLoading(true)
            setError('')
            setSession(null)
            setAttempt(attempt + 1)
          }}>Reconnect sign-in service</button>
        </div>}
      </section>
    </main>
  )
}
