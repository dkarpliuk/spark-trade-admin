const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(apiUrl(path))

  if (!response.ok) {
    throw new ApiError(`GET ${path} failed with status ${response.status}`, response.status)
  }

  return (await response.json()) as T
}

export async function apiGetText(path: string): Promise<string> {
  const response = await fetch(apiUrl(path))

  if (!response.ok) {
    throw new ApiError(`GET ${path} failed with status ${response.status}`, response.status)
  }

  return await response.text()
}

export async function apiPost(path: string): Promise<void> {
  const response = await fetch(apiUrl(path), { method: 'POST' })

  if (!response.ok) {
    throw new ApiError(`POST ${path} failed with status ${response.status}`, response.status)
  }
}
