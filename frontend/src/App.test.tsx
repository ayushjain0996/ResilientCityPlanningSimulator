import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { getHealth } from './api/health'
import App from './App'

vi.mock('./api/health')

describe('App', () => {
  it('showsTheApplicationTitle', async () => {
    vi.mocked(getHealth).mockResolvedValue({ status: 'UP' })

    render(<App />)

    expect(
      screen.getByRole('heading', { name: 'Resilient City Planning Simulator' }),
    ).toBeInTheDocument()
    expect(await screen.findByText('Backend: UP')).toBeInTheDocument()
  })
})
