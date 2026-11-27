import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getHealth } from './api/health'
import { getMe } from './api/me'
import { useAuth } from './auth/useAuth'
import App from './App'

vi.mock('./api/health')
vi.mock('./api/me')
vi.mock('./auth/auth')
vi.mock('./auth/useAuth')

describe('App', () => {
  beforeEach(() => {
    vi.mocked(getHealth).mockResolvedValue({ status: 'UP' })
    vi.mocked(getMe).mockResolvedValue({ uid: 'uid-1', email: 'planner@example.com', role: 'PLANNER' })
  })

  it('showsTheApplicationTitleWhileTheSessionIsLoading', () => {
    vi.mocked(useAuth).mockReturnValue({ user: null, loading: true })

    render(<App />)

    expect(
      screen.getByRole('heading', { name: 'Resilient City Planning Simulator' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('form', { name: 'Sign in' })).not.toBeInTheDocument()
  })

  it('showsOnlyTheLoginFormWhenSignedOut', () => {
    vi.mocked(useAuth).mockReturnValue({ user: null, loading: false })

    render(<App />)

    expect(screen.getByRole('form', { name: 'Sign in' })).toBeInTheDocument()
    expect(screen.queryByText(/Backend/)).not.toBeInTheDocument()
  })

  it('showsTheAccountBarAndBackendHealthWhenSignedIn', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { uid: 'uid-1', email: 'planner@example.com', role: 'PLANNER' },
      loading: false,
    })

    render(<App />)

    expect(screen.getByText(/Signed in as planner@example.com \(PLANNER\)/)).toBeInTheDocument()
    expect(await screen.findByText(/Backend confirms: planner@example.com · role PLANNER/)).toBeInTheDocument()
    expect(await screen.findByText('Backend: UP')).toBeInTheDocument()
    expect(screen.queryByRole('form', { name: 'Sign in' })).not.toBeInTheDocument()
  })
})
