import { api } from './client'

export type HealthResponse = {
  status: string
}

export async function getHealth(): Promise<HealthResponse> {
  const response = await api('/api/health')
  if (!response.ok) {
    throw new Error(`Health check failed with status ${response.status}`)
  }
  return (await response.json()) as HealthResponse
}
