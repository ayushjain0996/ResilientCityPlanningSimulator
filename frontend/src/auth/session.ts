import type { Role } from '../features/plans/catalogue'
import type { AppSettings } from './settings'

export type Identity = {
  uid: string
  email: string
  role: Role | null
  getToken: () => Promise<string>
}

export type Session = {
  subscribe: (listener: (identity: Identity | null) => void, onError: () => void) => () => void
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  refresh: () => Promise<void>
}

export function readRole(role: unknown): Role | null {
  return role === 'PLANNER' || role === 'AUDITOR' || role === 'EMERGENCY_SERVICES_MANAGER' ? role : null
}

export function signInMessage(error: unknown): string {
  const code = error && typeof error === 'object' && 'code' in error ? error.code : ''
  if (code === 'auth/network-request-failed') return 'Unable to connect. Check your connection and try again.'
  if (code === 'auth/too-many-requests') return 'Too many attempts. Please wait before trying again.'
  if (code === 'auth/operation-not-allowed') return 'Email sign-in is unavailable. Contact your administrator.'
  return 'Sign-in failed. Check your email and password, or contact your administrator.'
}

let sessionPromise: Promise<Session> | undefined

export function createSession(settings: AppSettings): Promise<Session> {
  sessionPromise ??= loadSession(settings).catch(error => {
    sessionPromise = undefined
    throw error
  })
  return sessionPromise
}

async function loadSession(settings: AppSettings): Promise<Session> {
  const [{ initializeApp, getApps }, sdk] = await Promise.all([import('firebase/app'), import('firebase/auth')])
  const app = getApps().find(item => item.name === 'resilient-city')
    ?? initializeApp(settings.firebase, 'resilient-city')
  const auth = sdk.initializeAuth(app, { persistence: sdk.browserSessionPersistence })
  auth.languageCode = 'en'
  return {
    subscribe(listener, onError) {
      let generation = 0
      let lastUid: string | null = null
      const unsubscribe = sdk.onIdTokenChanged(auth, user => {
        const current = ++generation
        if (!user) {
          lastUid = null
          listener(null)
          return
        }
        // Clear data between accounts, but keep a draft during the same user's routine token refresh.
        if (lastUid !== user.uid) listener(null)
        void user.getIdTokenResult().then(result => {
          if (generation !== current) return
          lastUid = user.uid
          listener({
            uid: user.uid,
            email: user.email ?? 'Staff account',
            role: readRole(result.claims.role),
            getToken: () => user.getIdToken(),
          })
        }).catch(() => { if (generation === current) onError() })
      }, onError)
      return () => { generation++; unsubscribe() }
    },
    async signIn(email, password) { await sdk.signInWithEmailAndPassword(auth, email, password) },
    async signOut() { await sdk.signOut(auth) },
    async refresh() { await auth.currentUser?.getIdToken(true) },
  }
}
