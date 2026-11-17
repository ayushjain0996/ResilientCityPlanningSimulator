import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getHealth } from '../../api/health'
import HealthPanel from './HealthPanel'

vi.mock('../../api/health')

describe('HealthPanel', () => {
  beforeEach(() => {
    vi.mocked(getHealth).mockReset()
  })

  it('showsCheckingMessageWhileWaitingForTheBackend', () => {
    vi.mocked(getHealth).mockReturnValue(new Promise(() => {}))

    render(<HealthPanel />)

    expect(screen.getByText('Checking backend...')).toBeInTheDocument()
  })

  it('showsTheBackendStatusWhenTheBackendIsUp', async () => {
    vi.mocked(getHealth).mockResolvedValue({ status: 'UP' })

    render(<HealthPanel />)

    expect(await screen.findByText('Backend: UP')).toBeInTheDocument()
  })

  it('showsUnreachableMessageWhenTheBackendCannotBeReached', async () => {
    vi.mocked(getHealth).mockRejectedValue(new Error('Failed to fetch'))

    render(<HealthPanel />)

    expect(await screen.findByText('Backend unreachable')).toBeInTheDocument()
  })
})
