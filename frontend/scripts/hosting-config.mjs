export function createHostingConfig(env) {
  const required = [
    'VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_AUTH_DOMAIN', 'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_APP_ID', 'FIREBASE_RUN_SERVICE_ID', 'FIREBASE_RUN_REGION',
  ]
  const missing = required.filter(key => !env[key]?.trim())
  if (missing.length) throw new Error(`Missing configuration: ${missing.join(', ')}`)
  if (env.VITE_APP_MODE !== 'firebase') throw new Error('Set VITE_APP_MODE=firebase before preparing a deployment.')
  const domain = env.VITE_FIREBASE_AUTH_DOMAIN.trim()
  if (!/^[a-z0-9.-]+$/i.test(domain)) throw new Error('authDomain must be a hostname.')
  if (!/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(env.VITE_FIREBASE_PROJECT_ID)) {
    throw new Error('Invalid Firebase project ID.')
  }
  if (!/^[a-z][a-z0-9-]*[a-z0-9]$/.test(env.FIREBASE_RUN_SERVICE_ID)) {
    throw new Error('Invalid Cloud Run service ID.')
  }
  if (!/^[a-z]+-[a-z]+[0-9]+$/.test(env.FIREBASE_RUN_REGION)) throw new Error('Invalid Cloud Run region.')
  const run = { serviceId: env.FIREBASE_RUN_SERVICE_ID, region: env.FIREBASE_RUN_REGION }
  return {
    hosting: {
      public: 'dist',
      ignore: ['firebase.json', '**/.*', '**/node_modules/**'],
      predeploy: ['npm run check:deploy', 'npm run build'],
      rewrites: [{ source: '/api', run }, { source: '/api/**', run }, { source: '**', destination: '/index.html' }],
      headers: [
        {
          source: '**', headers: [
            { key: 'X-Content-Type-Options', value: 'nosniff' },
            { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
            { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
            { key: 'Cache-Control', value: 'no-cache' },
            {
              key: 'Content-Security-Policy',
              value: `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com; frame-src https://${domain}; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'`,
            },
          ],
        },
        { source: '/assets/**', headers: [{ key: 'Cache-Control', value: 'public,max-age=31536000,immutable' }] },
      ],
    },
  }
}
