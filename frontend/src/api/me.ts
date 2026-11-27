import { api } from './client'

export type MeResponse = {
  uid: string
  email: string | null
  role: string | null
}

export class ApiError extends Error {
  readonly status: number

  constructor(status: number) {
    super(`Request failed with status ${status}`)
    this.status = status
  }
}

// What the backend itself has verified about the caller, as opposed to what the browser's token says.
export async function getMe(): Promise<MeResponse> {
  const response = await api('/api/me')
  if (!response.ok) {
    throw new ApiError(response.status)
  }
  return (await response.json()) as MeResponse
}
