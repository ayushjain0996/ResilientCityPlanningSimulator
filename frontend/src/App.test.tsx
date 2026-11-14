import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('showsTheApplicationTitle', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { name: 'Resilient City Planning Simulator' }),
    ).toBeInTheDocument()
  })
})
