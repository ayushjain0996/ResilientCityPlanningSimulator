import { useState, type FormEvent } from 'react'
import { login } from '../../auth/auth'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(false)
    setSubmitting(true)
    try {
      await login(email, password)
    } catch {
      // The same message for every failure, so the form never reveals whether the email exists.
      setError(true)
      setPassword('')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} aria-label="Sign in">
      <p>
        <label htmlFor="login-email">Email</label>{' '}
        <input
          id="login-email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </p>
      <p>
        <label htmlFor="login-password">Password</label>{' '}
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </p>
      <button type="submit" disabled={submitting}>
        Sign in
      </button>
      {error && <p role="alert">Sign-in failed. Check your email and password.</p>}
    </form>
  )
}

export default LoginForm
