import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { login } from '../../auth/auth'
import LoginForm from './LoginForm'

vi.mock('../../auth/auth')

function fillAndSubmit() {
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'planner@example.com' } })
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret-password' } })
  fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
}

describe('LoginForm', () => {
  beforeEach(() => {
    vi.mocked(login).mockReset()
  })

  it('signsInWithTheEnteredEmailAndPassword', async () => {
    vi.mocked(login).mockResolvedValue()

    render(<LoginForm />)
    fillAndSubmit()

    await vi.waitFor(() => {
      expect(login).toHaveBeenCalledWith('planner@example.com', 'secret-password')
    })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('showsAnErrorAndClearsThePasswordWhenSignInFails', async () => {
    vi.mocked(login).mockRejectedValue(new Error('auth/invalid-credential'))

    render(<LoginForm />)
    fillAndSubmit()

    expect(await screen.findByRole('alert')).toHaveTextContent('Sign-in failed')
    expect(screen.getByLabelText('Password')).toHaveValue('')
    expect(screen.getByLabelText('Email')).toHaveValue('planner@example.com')
  })

  it('hasNoSignUpLink', () => {
    render(<LoginForm />)

    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
