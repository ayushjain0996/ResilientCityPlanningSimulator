import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { getFirebaseAuth } from './firebase'

export type Role = 'PLANNER' | 'EMERGENCY_SERVICES_MANAGER' | 'AUDITOR'

export type AuthUser = {
  uid: string
  email: string
  role: Role | null
}

const ROLES: readonly string[] = ['PLANNER', 'EMERGENCY_SERVICES_MANAGER', 'AUDITOR']

// The role is set only on the server, in a custom claim called "role". Anything else counts as no role.
function toRole(claim: unknown): Role | null {
  return typeof claim === 'string' && ROLES.includes(claim) ? (claim as Role) : null
}

export async function login(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(getFirebaseAuth(), email, password)
}

export async function logout(): Promise<void> {
  await signOut(getFirebaseAuth())
}

// Calls the listener with the signed-in user, or null when signed out. Returns a function that stops listening.
export function onAuthChange(listener: (user: AuthUser | null) => void): () => void {
  let latest = 0
  const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (firebaseUser) => {
    const current = ++latest
    if (firebaseUser === null) {
      listener(null)
      return
    }
    const email = firebaseUser.email ?? ''
    firebaseUser
      .getIdTokenResult()
      .then((result) => {
        if (current === latest) {
          listener({ uid: firebaseUser.uid, email, role: toRole(result.claims.role) })
        }
      })
      .catch(() => {
        if (current === latest) {
          listener({ uid: firebaseUser.uid, email, role: null })
        }
      })
  })
  return () => {
    latest++
    unsubscribe()
  }
}

// Forces a token refresh first, so a role that was just assigned shows up without signing out.
export async function getRole(): Promise<Role | null> {
  const user = getFirebaseAuth().currentUser
  if (user === null) {
    return null
  }
  const result = await user.getIdTokenResult(true)
  return toRole(result.claims.role)
}

// Asks Firebase for the token on every call and never stores it. Firebase refreshes it when it is close to expiry.
export async function getIdToken(): Promise<string | null> {
  const user = getFirebaseAuth().currentUser
  return user === null ? null : await user.getIdToken()
}
