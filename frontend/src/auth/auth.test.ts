import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getFirebaseAuth } from './firebase'
import { getIdToken, getRole, login, logout, onAuthChange, type AuthUser } from './auth'

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
}))
vi.mock('./firebase', () => ({ getFirebaseAuth: vi.fn() }))

const fakeAuth = { name: 'fake-auth' }

function signedInUser(claims: Record<string, unknown>) {
  return {
    uid: 'uid-1',
    email: 'planner@example.com',
    getIdToken: vi.fn().mockResolvedValue('token'),
    getIdTokenResult: vi.fn().mockResolvedValue({ claims }),
  }
}

function setCurrentUser(user: ReturnType<typeof signedInUser> | null) {
  vi.mocked(getFirebaseAuth).mockReturnValue({ ...fakeAuth, currentUser: user } as never)
}

describe('auth', () => {
  beforeEach(() => {
    vi.mocked(getFirebaseAuth).mockReset()
    vi.mocked(signInWithEmailAndPassword).mockReset()
    vi.mocked(signOut).mockReset()
    vi.mocked(onAuthStateChanged).mockReset()
    setCurrentUser(null)
  })

  it('loginSignsInWithEmailAndPassword', async () => {
    await login('planner@example.com', 'secret')

    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'fake-auth' }),
      'planner@example.com',
      'secret',
    )
  })

  it('logoutSignsOut', async () => {
    await logout()

    expect(signOut).toHaveBeenCalledWith(expect.objectContaining({ name: 'fake-auth' }))
  })

  it('getRoleForcesATokenRefreshAndReturnsTheRoleClaim', async () => {
    const user = signedInUser({ role: 'PLANNER' })
    setCurrentUser(user)

    await expect(getRole()).resolves.toBe('PLANNER')
    expect(user.getIdTokenResult).toHaveBeenCalledWith(true)
  })

  it('getRoleReturnsNullWhenNobodyIsSignedIn', async () => {
    await expect(getRole()).resolves.toBeNull()
  })

  it('getRoleReturnsNullForARoleThatIsNotKnown', async () => {
    setCurrentUser(signedInUser({ role: 'ADMIN' }))

    await expect(getRole()).resolves.toBeNull()
  })

  it('getIdTokenAsksFirebaseForATokenOnEveryCall', async () => {
    const user = signedInUser({})
    setCurrentUser(user)

    await getIdToken()
    await getIdToken()

    expect(user.getIdToken).toHaveBeenCalledTimes(2)
  })

  it('getIdTokenReturnsNullWhenNobodyIsSignedIn', async () => {
    await expect(getIdToken()).resolves.toBeNull()
  })

  it('onAuthChangeReportsTheSignedInUserWithTheirRole', async () => {
    const received: (AuthUser | null)[] = []
    onAuthChange((user) => received.push(user))
    const callback = vi.mocked(onAuthStateChanged).mock.calls[0][1] as (user: unknown) => void

    callback(signedInUser({ role: 'AUDITOR' }))

    await vi.waitFor(() => {
      expect(received).toEqual([{ uid: 'uid-1', email: 'planner@example.com', role: 'AUDITOR' }])
    })
  })

  it('onAuthChangeReportsNullWhenSignedOut', () => {
    const received: (AuthUser | null)[] = []
    onAuthChange((user) => received.push(user))
    const callback = vi.mocked(onAuthStateChanged).mock.calls[0][1] as (user: unknown) => void

    callback(null)

    expect(received).toEqual([null])
  })

  it('onAuthChangeReportsNoRoleWhenTheClaimIsMissing', async () => {
    const received: (AuthUser | null)[] = []
    onAuthChange((user) => received.push(user))
    const callback = vi.mocked(onAuthStateChanged).mock.calls[0][1] as (user: unknown) => void

    callback(signedInUser({}))

    await vi.waitFor(() => {
      expect(received[0]?.role).toBeNull()
    })
  })
})
