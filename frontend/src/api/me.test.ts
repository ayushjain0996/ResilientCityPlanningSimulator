import { afterEach, describe, expect, it, vi } from 'vitest'
import { getIdToken } from '../auth/auth'
import { ApiError, getMe } from './me'

vi.mock('../auth/auth')

describe('getMe', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returnsWhatTheBackendKnowsAboutTheCaller', async () => {
    vi.mocked(getIdToken).mockResolvedValue('token-1')
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ uid: 'uid-1', email: 'planner@example.com', role: 'PLANNER' }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await expect(getMe()).resolves.toEqual({ uid: 'uid-1', email: 'planner@example.com', role: 'PLANNER' })
    expect(fetchMock.mock.calls[0][0]).toBe('/api/me')
    expect((fetchMock.mock.calls[0][1].headers as Headers).get('Authorization')).toBe('Bearer token-1')
  })

  it('throwsAnApiErrorWithTheStatusWhenTheBackendRejectsTheToken', async () => {
    vi.mocked(getIdToken).mockResolvedValue('expired')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401 }))

    await expect(getMe()).rejects.toMatchObject({ status: 401 })
    await expect(getMe()).rejects.toBeInstanceOf(ApiError)
  })
})
