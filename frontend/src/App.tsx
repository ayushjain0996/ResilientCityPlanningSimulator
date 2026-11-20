import { useState } from 'react'
import { AuthGate } from './auth/AuthGate'
import { readSettings } from './auth/settings'
import type { Identity, Session } from './auth/session'
import { GrowthWorkspace } from './features/plans/GrowthWorkspace'
import { HealthPanel } from './features/health/HealthPanel'
import { ROLES, USE_CASES } from './features/plans/catalogue'
import type { Role } from './features/plans/catalogue'

const SETTINGS = readSettings(import.meta.env)

function Workspace({ identity, session }: { identity: Identity | null; session: Session | null }) {
  const [view, setView] = useState<'workspace' | 'library'>('workspace')
  const [previewRole, setPreviewRole] = useState<Role>('PLANNER')
  const [signingOut, setSigningOut] = useState(false)
  const [sessionError, setSessionError] = useState('')
  const role = identity?.role ?? previewRole

  async function signOut() {
    if (!session || signingOut) return
    setSigningOut(true)
    setSessionError('')
    try { await session.signOut() }
    catch { setSessionError('Unable to sign out. Check your connection and try again.') }
    finally { setSigningOut(false) }
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <aside className="sidebar">
        <a className="brand" href="#main-content">
          <span className="brand-mark" aria-hidden="true">R<span> / </span>C</span>
          <span>RESILIENT CITY<small>PLANNING SIMULATOR</small></span>
        </a>
        <div className="sidebar-label">YOUR WORKSPACE</div>
        <nav aria-label="Main navigation">
          <button className={view === 'workspace' ? 'nav-item active' : 'nav-item'}
            aria-current={view === 'workspace' ? 'page' : undefined} onClick={() => setView('workspace')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="1.5" aria-hidden="true" focusable="false">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            Planning workspace
          </button>
          <button className={view === 'library' ? 'nav-item active' : 'nav-item'}
            aria-current={view === 'library' ? 'page' : undefined} onClick={() => setView('library')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="1.5" aria-hidden="true" focusable="false">
              <rect x="4" y="3" width="16" height="18" rx="2" />
              <path d="M8 8h8M8 12h8M8 16h5" />
            </svg>
            Use case library <small>12</small>
          </button>
        </nav>
        <div className="sidebar-bottom">
          <span className="sidebar-label">CS7CS3 &middot; GROUP 11</span>
          <p>Better prepared.<br/>More resilient.</p>
          <span className="sidebar-version">Architecture checkpoint</span>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <span>Resilient City Planning Simulator</span>
          {identity ? <div className="account-control">
            <span className="account-email">{identity.email}</span>
            <span className="badge">{ROLES[role]}</span>
            <button className="secondary" disabled={signingOut} onClick={() => void signOut()}>
              {signingOut ? 'Signing out...' : 'Sign out'}
            </button>
          </div> : <label className="role-control">Preview role
            <select value={previewRole} onChange={event => setPreviewRole(event.target.value as Role)}>
              {Object.entries(ROLES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>}
        </header>
        <div className="preview-banner">
          <span className="status-dot"/>
          <strong>{identity ? 'Staff workspace' : 'Local demonstration'}</strong>
          <span>{identity
            ? 'Signed in with Firebase. Planning inputs are local and are not saved to the server.'
            : 'Role selection is a preview, not authentication. Planning inputs are local; the connection check uses the real API.'}</span>
        </div>
        <main id="main-content" tabIndex={-1}>
          {sessionError && <p className="notice" role="alert">{sessionError}</p>}
          <HealthPanel getToken={identity?.getToken}/>
          <div hidden={view !== 'workspace'}>
            <GrowthWorkspace role={role} isPreview={!identity}/>
          </div>
          {view === 'library' && <>
            <div className="page-heading">
              <div><p className="eyebrow">EXPLORE THE SYSTEM</p><h1>Use case library</h1>
                <p className="muted">The system's planning scope. This checkpoint provides a growth input preview and backend connection check.</p>
              </div>
            </div>
            <div className="catalogue">
              {USE_CASES.map((name, index) => <article className="panel use-case" key={name}>
                <span className="eyebrow">UC-{String(index + 1).padStart(2, '0')}</span>
                <h2>{name}</h2>
                <span className="badge">{index === 0 ? 'Input preview available' : 'Outside checkpoint scope'}</span>
                {index === 0 && <button className="text-button" onClick={() => setView('workspace')}>
                  Open growth workspace <span aria-hidden="true">&rarr;</span>
                </button>}
              </article>)}
            </div>
            <p className="muted small">The architecture checkpoint verifies the selected technologies. It does not implement twelve complete use cases.</p>
          </>}
          <footer className="page-footer">
            <span>Resilient City / Group 11</span><span>Architecture checkpoint &middot; 20 November 2026</span>
          </footer>
        </main>
      </div>
    </div>
  )
}

function App() {
  return <AuthGate settings={SETTINGS}>
    {(identity, session) => <Workspace key={identity?.uid ?? 'preview'} identity={identity} session={session}/>}
  </AuthGate>
}

export default App
