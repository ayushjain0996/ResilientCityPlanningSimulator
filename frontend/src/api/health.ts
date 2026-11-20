export type HealthResponse = { status: 'UP' }

export class ApiError extends Error {
  readonly kind: 'network' | 'timeout' | 'unauthorised' | 'forbidden' | 'server' | 'response'

  constructor(kind: ApiError['kind']) {
    super(kind)
    this.name = 'ApiError'
    this.kind = kind
  }
}

export const HEALTH_MESSAGES: Record<ApiError['kind'], string> = {
  network: 'Backend unreachable. Check your connection and make sure the backend is running.',
  timeout: 'The connection check timed out. Try again when the backend is available.',
  unauthorised: 'Your session was not accepted. Sign out and sign in again.',
  forbidden: 'Your account does not have permission to access this endpoint.',
  server: 'The backend returned an error. Try again or contact the backend owner.',
  response: 'The backend returned an unexpected response. Check the API deployment and routing.',
}

export async function getHealth(options: {
  signal?: AbortSignal
  getToken?: () => Promise<string>
} = {}): Promise<HealthResponse> {
  const controller = new AbortController()
  const abort = () => controller.abort()
  options.signal?.addEventListener('abort', abort, { once: true })
  if (options.signal?.aborted) controller.abort()
  let timedOut = false
  const timer = window.setTimeout(() => { timedOut = true; controller.abort() }, 10000)
  try {
    const aborted = new Promise<never>((_, reject) => {
      if (controller.signal.aborted) reject(new DOMException('Aborted', 'AbortError'))
      else controller.signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true })
    })
    const request = async () => {
      const token = options.getToken ? await options.getToken().catch(() => { throw new ApiError('unauthorised') }) : undefined
      if (options.getToken && !token) throw new ApiError('unauthorised')
      controller.signal.throwIfAborted()
      const response = await fetch('/api/health', {
        signal: controller.signal,
        headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        cache: 'no-store',
        redirect: 'error',
      })
      if (response.status === 401) throw new ApiError('unauthorised')
      if (response.status === 403) throw new ApiError('forbidden')
      if (!response.ok) throw new ApiError('server')
      if (!response.headers.get('content-type')?.includes('application/json')) throw new ApiError('response')
      const body: unknown = await response.json().catch(() => { throw new ApiError('response') })
      if (!body || typeof body !== 'object' || !('status' in body) || body.status !== 'UP') {
        throw new ApiError('response')
      }
      return { status: 'UP' } as const
    }
    return await Promise.race([request(), aborted])
  } catch (error) {
    if (options.signal?.aborted) throw new DOMException('Aborted', 'AbortError')
    if (timedOut) throw new ApiError('timeout')
    throw error instanceof ApiError ? error : new ApiError('network')
  } finally {
    window.clearTimeout(timer)
    options.signal?.removeEventListener('abort', abort)
  }
}
