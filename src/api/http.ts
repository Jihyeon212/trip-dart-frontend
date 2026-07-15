import { API_BASE_URL } from '@/constants'

export class ApiError extends Error {
  constructor(message: string, public status = 0) { super(message) }
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    })
  } catch {
    throw new ApiError('백엔드 서버에 연결할 수 없습니다.')
  }
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { detail?: string; message?: string }
    throw new ApiError(body.detail || body.message || '요청을 처리하지 못했습니다.', response.status)
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}
