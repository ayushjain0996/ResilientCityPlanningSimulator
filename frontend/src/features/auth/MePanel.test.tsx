import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, getMe } from '../../api/me'
import MePanel from './MePanel'

vi.mock('../../api/me', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../api/me')>()
  return { ...original, getMe: vi.fn() }
})

describe('MePanel', () => {
  beforeEach(() => {
    vi.mocked(getMe).mockReset()
  })

  it('showsWhileTheBackendIsBeingAsked', () => {
    vi.mocked(getMe).mockReturnValue(new Promise(() => {}))

    render(<MePanel />)

    expect(screen.getByText('Asking the backend who you are...')).toBeInTheDocument()
  })

  it('showsTheEmailRoleAndUidTheBackendVerified', async () => {
    vi.mocked(getMe).mockResolvedValue({ uid: 'uid-9', email: 'planner@example.com', role: 'PLANNER' })

    render(<MePanel />)

    expect(
      await screen.findByText('Backend confirms: planner@example.com · role PLANNER · uid uid-9'),
    ).toBeInTheDocument()
  })

  it('saysNoneWhenTheBackendSeesNoRole', async () => {
    vi.mocked(getMe).mockResolvedValue({ uid: 'uid-9', email: 'new@example.com', role: null })

    render(<MePanel />)

    expect(await screen.findByText(/role none/)).toBeInTheDocument()
  })

  it('showsTheStatusWhenTheBackendRejectsTheSession', async () => {
    vi.mocked(getMe).mockRejectedValue(new ApiError(401))

    render(<MePanel />)

    expect(await screen.findByRole('alert')).toHaveTextContent('did not accept your session (status 401)')
  })

  it('showsAGenericMessageWhenTheBackendCannotBeReached', async () => {
    vi.mocked(getMe).mockRejectedValue(new TypeError('Failed to fetch'))

    render(<MePanel />)

    expect(await screen.findByRole('alert')).toHaveTextContent('did not accept your session. Sign out')
  })
})
