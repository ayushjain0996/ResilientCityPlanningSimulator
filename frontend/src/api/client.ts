import { getIdToken } from '../auth/auth'

// Empty by default, so calls stay on the same origin (/api, proxied by Vite in development).
function apiUrl(): string {
  return import.meta.env.VITE_API_URL ?? ''
}

// Every call to the backend goes through here. It fetches a fresh token each time and never keeps it.
export async function api(path: string, options: RequestInit = {}): Promise<Response> {
  const token = await getIdToken()
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')
  if (token !== null) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  return fetch(`${apiUrl()}${path}`, { ...options, headers })
}
