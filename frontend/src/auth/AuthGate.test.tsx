import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthGate } from './AuthGate'
import { createSession } from './session'
import type { Identity, Session } from './session'
import type { AppSettings } from './settings'

vi.mock('./session', async importOriginal => ({
  ...await importOriginal<typeof import('./session')>(), createSession: vi.fn(),
}))

const settings: AppSettings = {
  mode: 'firebase', problems: [],
  firebase: { apiKey: 'test', authDomain: 'test.firebaseapp.com', projectId: 'test-project', appId: 'test' },
}
let listener: (identity: Identity | null) => void
let session: Session
const identity: Identity = { uid: 'test', email: 'staff@example.test', role: 'PLANNER', getToken: async () => 'token' }

beforeEach(() => {
  session = {
    subscribe: vi.fn(callback => { listener = callback; callback(null); return vi.fn() }),
    signIn: vi.fn().mockResolvedValue(undefined), signOut: vi.fn().mockResolvedValue(undefined),
    refresh: vi.fn().mockResolvedValue(undefined),
  }
  vi.mocked(createSession).mockReset().mockResolvedValue(session)
})

describe('AuthGate', () => {
  it('doesNotOpenTheWorkspaceOrInitialiseSdkWhenConfigurationIsMissing', () => {
    render(<AuthGate settings={{ ...settings, problems: ['Missing Firebase project.'] }}>{() => <p>Workspace</p>}</AuthGate>)
    expect(screen.getByText('Configuration required')).toBeInTheDocument()
    expect(screen.queryByText('Workspace')).not.toBeInTheDocument()
    expect(createSession).not.toHaveBeenCalled()
  })
  it('submitsCredentialsAndOpensOnlyAfterATrustedRoleArrives', async () => {
    render(<AuthGate settings={settings}>{user => <p>Workspace {user?.role}</p>}</AuthGate>)
    await screen.findByRole('button', { name: 'Sign in' })
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'staff@example.test' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'test-password' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    await waitFor(() => expect(session.signIn).toHaveBeenCalledWith('staff@example.test', 'test-password'))
    expect(screen.queryByText('Workspace PLANNER')).not.toBeInTheDocument()
    await act(async () => listener(identity))
    expect(screen.getByText('Workspace PLANNER')).toBeInTheDocument()
  })
  it('deniesUnknownRolesAndAllowsRefreshingAccess', async () => {
    render(<AuthGate settings={settings}>{() => <p>Workspace</p>}</AuthGate>)
    await screen.findByRole('button', { name: 'Sign in' })
    await act(async () => listener({ ...identity, role: null }))
    expect(screen.getByText('Role not assigned')).toBeInTheDocument()
    expect(screen.queryByText('Workspace')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Refresh access' }))
    await waitFor(() => expect(session.refresh).toHaveBeenCalledOnce())
  })
  it('removesTheWorkspaceWhenTheSessionEnds', async () => {
    render(<AuthGate settings={settings}>{() => <p>Workspace</p>}</AuthGate>)
    await screen.findByRole('button', { name: 'Sign in' })
    await act(async () => listener(identity))
    expect(screen.getByText('Workspace')).toBeInTheDocument()
    await act(async () => listener(null))
    expect(screen.queryByText('Workspace')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
  })
  it('clearsThePasswordAndShowsAUsefulErrorAfterRejectedSignIn', async () => {
    vi.mocked(session.signIn).mockRejectedValue({ code: 'auth/invalid-credential' })
    render(<AuthGate settings={settings}>{() => <p>Workspace</p>}</AuthGate>)
    await screen.findByRole('button', { name: 'Sign in' })
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'staff@example.test' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(await screen.findByText(/Sign-in failed/)).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toHaveValue('')
    expect(screen.queryByText('Workspace')).not.toBeInTheDocument()
  })
})
