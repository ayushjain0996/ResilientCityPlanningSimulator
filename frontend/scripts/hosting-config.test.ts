import { describe, expect, it } from 'vitest'
import { createHostingConfig } from './hosting-config.mjs'

const env = {
  VITE_APP_MODE: 'firebase', VITE_FIREBASE_API_KEY: 'public-test-key',
  VITE_FIREBASE_AUTH_DOMAIN: 'test-project.firebaseapp.com', VITE_FIREBASE_PROJECT_ID: 'test-project',
  VITE_FIREBASE_APP_ID: 'test-app', FIREBASE_RUN_SERVICE_ID: 'test-backend', FIREBASE_RUN_REGION: 'europe-west1',
}

describe('Hosting configuration', () => {
  it('routesApiBeforeTheSpaAndRebuildsBeforeDeployment', () => {
    const config = createHostingConfig(env)
    expect(config.hosting.rewrites.map((rule: { source: string }) => rule.source)).toEqual(['/api', '/api/**', '**'])
    expect(config.hosting.rewrites[1].run).toEqual({ serviceId: 'test-backend', region: 'europe-west1' })
    expect(config.hosting.predeploy).toEqual(['npm run check:deploy', 'npm run build'])
  })
  it('refusesBlankConfigurationAndDemoMode', () => {
    expect(() => createHostingConfig({})).toThrow('Missing configuration')
    expect(() => createHostingConfig({ ...env, VITE_APP_MODE: 'preview' })).toThrow('VITE_APP_MODE=firebase')
  })
  it('doesNotAcceptAnInjectedDomainInTheSecurityPolicy', () => {
    expect(() => createHostingConfig({ ...env, VITE_FIREBASE_AUTH_DOMAIN: "evil; script-src *" })).toThrow('hostname')
  })
})
