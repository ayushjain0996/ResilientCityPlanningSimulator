import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { logout } from '../../auth/auth'
import AccountBar from './AccountBar'

vi.mock('../../auth/auth')

describe('AccountBar', () => {
  it('showsTheEmailAndRoleOfTheSignedInUser', () => {
    render(<AccountBar user={{ uid: 'uid-1', email: 'auditor@example.com', role: 'AUDITOR' }} />)

    expect(screen.getByText(/Signed in as auditor@example.com \(AUDITOR\)/)).toBeInTheDocument()
  })

  it('saysWhenNoRoleHasBeenAssigned', () => {
    render(<AccountBar user={{ uid: 'uid-1', email: 'new@example.com', role: null }} />)

    expect(screen.getByText(/no role assigned/)).toBeInTheDocument()
  })

  it('signsOutWhenTheSignOutButtonIsClicked', () => {
    vi.mocked(logout).mockResolvedValue()
    render(<AccountBar user={{ uid: 'uid-1', email: 'planner@example.com', role: 'PLANNER' }} />)

    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }))

    expect(logout).toHaveBeenCalled()
  })
})
