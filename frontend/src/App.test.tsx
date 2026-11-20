import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { getHealth } from './api/health'

vi.mock('./api/health', async importOriginal => ({
  ...await importOriginal<typeof import('./api/health')>(), getHealth: vi.fn(),
}))
vi.mock('./auth/settings', () => ({ readSettings: () => ({ mode: 'preview', firebase: {}, problems: [] }) }))
beforeEach(() => { vi.mocked(getHealth).mockReturnValue(new Promise(() => {})) })

describe('App', () => {
  it('previewsGrowthInputsWithoutClaimingToRunASimulation', () => {
    render(<App />)
    fireEvent.change(screen.getByLabelText('Plan name'), { target: { value: 'Dublin growth study' } })
    fireEvent.change(screen.getByLabelText('Current population'), { target: { value: '50000' } })
    fireEvent.change(screen.getByLabelText('Population assumptions'), { target: { value: 'Assumed annual growth of 1%.' } })
    fireEvent.click(screen.getByRole('button', { name: 'Review inputs' }))
    const summary = screen.getByRole('region', { name: 'Input review' })
    expect(within(summary).getByText('Dublin growth study')).toBeInTheDocument()
    expect(within(summary).getByText('5, 10, 20 years')).toBeInTheDocument()
    expect(within(summary).getByText('42')).toBeInTheDocument()
    expect(within(summary).getByText(/No simulation has been started/)).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Plan name'), { target: { value: 'Revised study' } })
    expect(screen.queryByRole('region', { name: 'Input review' })).not.toBeInTheDocument()
  })

  it('showsRequiredFieldsAndRejectsAnInvalidSeedAndEmptyHorizons', () => {
    render(<App />)
    fireEvent.change(screen.getByLabelText('Random seed'), { target: { value: '-1' } })
    for (const years of [5, 10, 20]) fireEvent.click(screen.getByLabelText(`${years} years`))
    fireEvent.click(screen.getByRole('button', { name: 'Review inputs' }))
    expect(screen.getByText('Enter a plan name.')).toBeInTheDocument()
    expect(screen.getByText('Enter a positive whole population.')).toBeInTheDocument()
    expect(screen.getByText('Choose at least one growth horizon.')).toBeInTheDocument()
    expect(screen.getByText('Enter a whole seed from 0 to 9007199254740991.')).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Input review' })).not.toBeInTheDocument()
  })

  it('keepsReviewRolesReadOnlyInThePreview', () => {
    render(<App />)
    for (const role of ['AUDITOR', 'EMERGENCY_SERVICES_MANAGER']) {
      fireEvent.change(screen.getByLabelText('Preview role'), { target: { value: role } })
      expect(screen.getByLabelText('Plan name')).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Review inputs' })).toBeDisabled()
      expect(screen.getByText(/Read-only preview/)).toBeInTheDocument()
    }
  })

  it('browsesAllUseCasesWithoutPretendingTheyAreImplemented', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Use case library/ }))
    expect(screen.getAllByRole('article')).toHaveLength(12)
    expect(screen.getByText('Staff and vehicle allocation')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Open growth workspace' }))
    expect(screen.getByLabelText('Plan name')).toBeInTheDocument()
  })
})
