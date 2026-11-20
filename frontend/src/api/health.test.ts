import { afterEach, describe, expect, it, vi } from 'vitest'
import { getHealth } from './health'

afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers() })

describe('health API', () => {
  it('usesTheGroupEndpointAndTheCurrentToken', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{"status":"UP"}', { headers: { 'content-type': 'application/json' } }))
    vi.stubGlobal('fetch', fetchMock)
    await expect(getHealth({ getToken: async () => 'test-token' })).resolves.toEqual({ status: 'UP' })
    expect(fetchMock).toHaveBeenCalledWith('/api/health', expect.objectContaining({
      headers: { Accept: 'application/json', Authorization: 'Bearer test-token' }, redirect: 'error',
    }))
  })
  it('doesNotInventAnAuthHeaderForLocalPreview', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{"status":"UP"}', { headers: { 'content-type': 'application/json' } }))
    vi.stubGlobal('fetch', fetchMock)
    await getHealth()
    expect(fetchMock.mock.calls[0][1].headers).not.toHaveProperty('Authorization')
  })
  it.each([[401, 'unauthorised'], [403, 'forbidden'], [503, 'server']])('classifiesStatus%s', async (status, kind) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: Number(status) })))
    await expect(getHealth()).rejects.toMatchObject({ kind })
  })
  it.each(['{"status":"DOWN"}', '{}', 'null', 'broken'])('rejectsUnexpectedJson%s', async body => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(body, { headers: { 'content-type': 'application/json' } })))
    await expect(getHealth()).rejects.toMatchObject({ kind: 'response' })
  })
  it('rejectsAnHtmlFallbackInsteadOfReportingSuccess', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html/>', { headers: { 'content-type': 'text/html' } })))
    await expect(getHealth()).rejects.toMatchObject({ kind: 'response' })
  })
  it('doesNotSendAnUnauthenticatedRequestAfterTokenFailure', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    await expect(getHealth({ getToken: async () => { throw new Error('expired') } })).rejects.toMatchObject({ kind: 'unauthorised' })
    expect(fetchMock).not.toHaveBeenCalled()
  })
  it('timesOutEvenIfTokenRetrievalNeverFinishes', async () => {
    vi.useFakeTimers()
    const request = getHealth({ getToken: () => new Promise(() => {}) })
    const assertion = expect(request).rejects.toMatchObject({ kind: 'timeout' })
    await vi.advanceTimersByTimeAsync(10000)
    await assertion
  })
  it('supportsCancellationWithoutReportingAServerFailure', async () => {
    const controller = new AbortController()
    controller.abort()
    await expect(getHealth({ signal: controller.signal })).rejects.toMatchObject({ name: 'AbortError' })
  })
  it('classifiesNetworkFailures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    await expect(getHealth()).rejects.toMatchObject({ kind: 'network' })
  })
})
