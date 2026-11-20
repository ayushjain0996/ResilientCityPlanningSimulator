import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { createSession } from './auth/session'
import type { Identity, Session } from './auth/session'
import { getHealth } from './api/health'

vi.mock('./auth/settings', () => ({ readSettings: () => ({ mode: 'firebase', firebase: {}, problems: [] }) }))
vi.mock('./auth/session', async importOriginal => ({
  ...await importOriginal<typeof import('./auth/session')>(), createSession: vi.fn(),
}))
vi.mock('./api/health', async importOriginal => ({
  ...await importOriginal<typeof import('./api/health')>(), getHealth: vi.fn(),
}))

let listener: (identity: Identity | null) => void
let session: Session
const identity: Identity = { uid: 'account-a', email: 'staff@example.test', role: 'AUDITOR', getToken: async () => 'test-token' }

beforeEach(() => {
  session = {
    subscribe: callback => { listener = callback; callback(null); return () => {} },
    signIn: vi.fn(), refresh: vi.fn(),
    signOut: vi.fn(async () => { listener(null) }),
  }
  vi.mocked(createSession).mockResolvedValue(session)
  vi.mocked(getHealth).mockResolvedValue({ status: 'UP' })
})

describe('authenticated workspace', () => {
  it('usesTrustedRolesAndTokensWithoutExposingThePreviewRolePicker', async () => {
    render(<App />)
    await screen.findByRole('button', { name: 'Sign in' })
    await act(async () => listener(identity))
    expect(await screen.findByText('Backend: UP')).toBeInTheDocument()
    expect(screen.queryByLabelText('Preview role')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Plan name')).toBeDisabled()
    expect(getHealth).toHaveBeenCalledWith(expect.objectContaining({ getToken: identity.getToken }))
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }))
    await screen.findByRole('button', { name: 'Sign in' })
    expect(screen.queryByLabelText('Plan name')).not.toBeInTheDocument()
  })
  it('doesNotCarryAnotherAccountsInputsAcrossSignOut', async () => {
    render(<App />)
    await screen.findByRole('button', { name: 'Sign in' })
    await act(async () => listener({ ...identity, role: 'PLANNER' }))
    fireEvent.change(screen.getByLabelText('Plan name'), { target: { value: 'Account A draft' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }))
    await screen.findByRole('button', { name: 'Sign in' })
    await act(async () => listener({ ...identity, uid: 'account-b', role: 'PLANNER' }))
    await waitFor(() => expect(screen.getByLabelText('Plan name')).toHaveValue(''))
  })
})
