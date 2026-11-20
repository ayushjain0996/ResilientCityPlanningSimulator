import { describe, expect, it } from 'vitest'
import { readSettings } from './settings'
import { readRole, signInMessage } from './session'

describe('authentication configuration', () => {
  it('allowsLocalPreviewWithoutInventingFirebaseConfiguration', () => {
    expect(readSettings({ DEV: true })).toMatchObject({ mode: 'preview', problems: [] })
  })
  it('failsClosedInProductionWithoutConfiguration', () => {
    expect(readSettings({ DEV: false, VITE_APP_MODE: 'preview' }).mode).toBe('firebase')
    expect(readSettings({ DEV: false }).problems).toHaveLength(4)
  })
  it('onlyEnablesAnExplicitDemoBuildAsAProductionPreview', () => {
    expect(readSettings({ DEV: false, MODE: 'demo' }).mode).toBe('preview')
  })
  it('rejectsInvalidAuthDomainsAndModes', () => {
    expect(readSettings({ VITE_FIREBASE_AUTH_DOMAIN: 'https://wrong.example/', VITE_APP_MODE: 'bad' }).problems)
      .toContain('Firebase authDomain must be a hostname without a protocol or path.')
  })
  it('onlyAcceptsTheThreeTrustedRoleNames', () => {
    expect(readRole('PLANNER')).toBe('PLANNER')
    expect(readRole('AUDITOR')).toBe('AUDITOR')
    expect(readRole('EMERGENCY_SERVICES_MANAGER')).toBe('EMERGENCY_SERVICES_MANAGER')
    for (const value of [undefined, null, 'admin', 'planner', ['PLANNER'], '__proto__']) expect(readRole(value)).toBeNull()
  })
  it('doesNotExposeAccountEnumerationErrors', () => {
    expect(signInMessage({ code: 'auth/user-not-found' })).toBe(signInMessage({ code: 'auth/wrong-password' }))
  })
})
