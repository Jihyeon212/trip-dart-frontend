import type { PaginatedPosts, Post, PostPayload } from '@/types'
import { request } from './http'

export const postsApi = {
  list: (page = 1, keyword = '') => request<PaginatedPosts | Post[]>(`/api/posts?page=${page}&size=10&keyword=${encodeURIComponent(keyword.trim())}`),
  detail: (id: number) => request<Post>(`/api/posts/${id}`),
  create: (payload: PostPayload) => request<Post>('/api/posts', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: number, payload: PostPayload) => request<Post>(`/api/posts/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  remove: (id: number, password: string) => request<void>(`/api/posts/${id}`, { method: 'DELETE', body: JSON.stringify({ password }) }),
  verify: (id: number, password: string) => request<{ valid: boolean }>(`/api/posts/${id}/verify-password`, { method: 'POST', body: JSON.stringify({ password }) }),
}
