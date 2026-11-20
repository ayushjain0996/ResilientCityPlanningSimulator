import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError, getHealth } from '../../api/health'
import { HealthPanel } from './HealthPanel'

vi.mock('../../api/health', async importOriginal => ({
  ...await importOriginal<typeof import('../../api/health')>(), getHealth: vi.fn(),
}))

beforeEach(() => { vi.mocked(getHealth).mockReset() })

describe('HealthPanel', () => {
  it('showsLoadingAndPreventsDuplicateRequests', () => {
    vi.mocked(getHealth).mockReturnValue(new Promise(() => {}))
    render(<HealthPanel />)
    expect(screen.getByText('Checking backend...')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Checking...' })).toBeDisabled()
  })
  it('recoversFromFailureWhenTheUserRetries', async () => {
    vi.mocked(getHealth).mockRejectedValueOnce(new ApiError('network')).mockResolvedValueOnce({ status: 'UP' })
    render(<HealthPanel />)
    expect(await screen.findByText(/Backend unreachable/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Check again' }))
    expect(await screen.findByText('Backend: UP')).toBeInTheDocument()
    expect(screen.queryByText(/Backend unreachable/)).not.toBeInTheDocument()
  })
  it('cancelsOutstandingRequestsOnUnmount', async () => {
    vi.mocked(getHealth).mockReturnValue(new Promise(() => {}))
    const { unmount } = render(<HealthPanel />)
    await waitFor(() => expect(getHealth).toHaveBeenCalledTimes(1))
    const signal = vi.mocked(getHealth).mock.calls[0][0]?.signal
    unmount()
    expect(signal?.aborted).toBe(true)
  })
})
