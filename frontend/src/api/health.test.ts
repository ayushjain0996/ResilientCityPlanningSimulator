import { afterEach, describe, expect, it, vi } from 'vitest'
import { getHealth } from './health'

describe('getHealth', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returnsTheStatusWhenTheBackendResponds', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: 'UP' }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(getHealth()).resolves.toEqual({ status: 'UP' })
    expect(fetchMock).toHaveBeenCalledWith('/api/health')
  })

  it('throwsWhenTheBackendReturnsAnErrorStatus', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 503 }))

    await expect(getHealth()).rejects.toThrow('503')
  })

  it('throwsWhenTheBackendIsUnreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    await expect(getHealth()).rejects.toThrow('Failed to fetch')
  })
})
