export type AppSettings = {
  mode: 'preview' | 'firebase'
  firebase: { apiKey: string; authDomain: string; projectId: string; appId: string }
  problems: string[]
}

export function readSettings(env: Record<string, unknown>): AppSettings {
  const value = (key: string) => typeof env[key] === 'string' ? (env[key] as string).trim() : ''
  const requested = value('VITE_APP_MODE')
  const mode = env.MODE === 'demo' || (!requested && env.DEV === true)
    || (requested === 'preview' && env.DEV === true) ? 'preview' : 'firebase'
  const firebase = {
    apiKey: value('VITE_FIREBASE_API_KEY'),
    authDomain: value('VITE_FIREBASE_AUTH_DOMAIN'),
    projectId: value('VITE_FIREBASE_PROJECT_ID'),
    appId: value('VITE_FIREBASE_APP_ID'),
  }
  const problems: string[] = []
  if (requested && !['preview', 'firebase'].includes(requested)) {
    problems.push('VITE_APP_MODE must be preview or firebase.')
  }
  if (mode === 'firebase') {
    for (const [key, entry] of Object.entries(firebase)) {
      if (!entry) problems.push(`Firebase ${key} has not been configured.`)
    }
    if (firebase.authDomain && !/^[a-z0-9.-]+$/i.test(firebase.authDomain)) {
      problems.push('Firebase authDomain must be a hostname without a protocol or path.')
    }
  }
  return { mode, firebase, problems }
}
