import { afterEach, describe, expect, it, vi } from 'vitest'
import { getIdToken } from '../auth/auth'
import { getHealth } from './health'

vi.mock('../auth/auth')

describe('getHealth', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returnsTheStatusWhenTheBackendResponds', async () => {
    vi.mocked(getIdToken).mockResolvedValue(null)
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: 'UP' }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(getHealth()).resolves.toEqual({ status: 'UP' })
    expect(fetchMock.mock.calls[0][0]).toBe('/api/health')
  })

  it('throwsWhenTheBackendReturnsAnErrorStatus', async () => {
    vi.mocked(getIdToken).mockResolvedValue(null)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }))

    await expect(getHealth()).rejects.toThrow('503')
  })

  it('throwsWhenTheBackendIsUnreachable', async () => {
    vi.mocked(getIdToken).mockResolvedValue(null)
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    await expect(getHealth()).rejects.toThrow('Failed to fetch')
  })
})
