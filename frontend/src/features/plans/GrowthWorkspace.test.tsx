import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { GrowthWorkspace } from './GrowthWorkspace'

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals() })

describe('growth input download', () => {
  it('downloadsReviewedInputsWithAnExplicitNonSimulationNotice', async () => {
    const createObjectURL = vi.fn(() => 'blob:test-inputs')
    class DownloadURL extends URL {
      static createObjectURL = createObjectURL
      static revokeObjectURL = vi.fn()
    }
    vi.stubGlobal('URL', DownloadURL)
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    render(<GrowthWorkspace role="PLANNER"/>)
    fireEvent.change(screen.getByLabelText('Plan name'), { target: { value: 'Growth test' } })
    fireEvent.change(screen.getByLabelText('Current population'), { target: { value: '1000' } })
    fireEvent.change(screen.getByLabelText('Population assumptions'), { target: { value: 'Test assumptions' } })
    fireEvent.click(screen.getByRole('button', { name: 'Review inputs' }))
    expect(screen.getByRole('region', { name: 'Input review' })).toHaveFocus()
    fireEvent.click(screen.getByRole('button', { name: 'Download inputs (JSON)' }))
    expect(click).toHaveBeenCalledOnce()
    const blob = (createObjectURL.mock.calls as unknown as [Blob][])[0][0]
    const content = await new Promise<string>(resolve => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.readAsText(blob)
    })
    expect(JSON.parse(content)).toMatchObject({
      kind: 'local-growth-inputs', planName: 'Growth test', population: 1000, seed: '42', horizons: [5, 10, 20],
      notice: expect.stringContaining('No simulation has been run'),
    })
  })
  it('rejectsUnsafePopulationAndSeedValues', () => {
    render(<GrowthWorkspace role="PLANNER"/>)
    fireEvent.change(screen.getByLabelText('Random seed'), { target: { value: '9007199254740992' } })
    fireEvent.change(screen.getByLabelText('Current population'), { target: { value: '3.5' } })
    fireEvent.click(screen.getByRole('button', { name: 'Review inputs' }))
    expect(screen.getByText('Enter a positive whole population.')).toBeInTheDocument()
    expect(screen.getByText('Enter a whole seed from 0 to 9007199254740991.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Download inputs (JSON)' })).not.toBeInTheDocument()
  })
})
