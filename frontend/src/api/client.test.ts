import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getIdToken } from '../auth/auth'
import { api } from './client'

vi.mock('../auth/auth')

describe('api', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    fetchMock.mockReset().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  function sentHeaders(call = 0): Headers {
    return fetchMock.mock.calls[call][1].headers as Headers
  }

  it('sendsTheBearerTokenAndJsonContentType', async () => {
    vi.mocked(getIdToken).mockResolvedValue('token-1')

    await api('/api/me')

    expect(fetchMock.mock.calls[0][0]).toBe('/api/me')
    expect(sentHeaders().get('Authorization')).toBe('Bearer token-1')
    expect(sentHeaders().get('Content-Type')).toBe('application/json')
  })

  it('asksForAFreshTokenOnEveryRequest', async () => {
    vi.mocked(getIdToken).mockResolvedValueOnce('token-1').mockResolvedValueOnce('token-2')

    await api('/api/me')
    await api('/api/me')

    expect(getIdToken).toHaveBeenCalledTimes(2)
    expect(sentHeaders(0).get('Authorization')).toBe('Bearer token-1')
    expect(sentHeaders(1).get('Authorization')).toBe('Bearer token-2')
  })

  it('sendsNoAuthorizationHeaderWhenSignedOut', async () => {
    vi.mocked(getIdToken).mockResolvedValue(null)

    await api('/api/health')

    expect(sentHeaders().has('Authorization')).toBe(false)
  })

  it('keepsTheCallersMethodBodyAndExtraHeaders', async () => {
    vi.mocked(getIdToken).mockResolvedValue('token-1')

    await api('/api/runs', { method: 'POST', body: '{"a":1}', headers: { 'X-Test': 'yes' } })

    const init = fetchMock.mock.calls[0][1]
    expect(init.method).toBe('POST')
    expect(init.body).toBe('{"a":1}')
    expect(sentHeaders().get('X-Test')).toBe('yes')
  })

  it('prefixesThePathWithTheConfiguredApiUrl', async () => {
    vi.mocked(getIdToken).mockResolvedValue(null)
    vi.stubEnv('VITE_API_URL', 'https://api.example.test')

    await api('/api/me')

    expect(fetchMock.mock.calls[0][0]).toBe('https://api.example.test/api/me')
  })
})
