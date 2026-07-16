import type { Location } from '@/types'
import { request } from './http'
import { normalizeLocation, type ApiLocation } from './locations'

interface ApiChatResponse {
  answer: string
  locations: ApiLocation[]
  posts: Array<{
    id: number
    post_type: string
    title: string
    content: string
    nickname: string
    created_at: string
  }>
}

export interface ChatResponse {
  answer: string
  locations: Location[]
}

export const chatApi = {
  async send(message: string, currentRoute: Location[]): Promise<ChatResponse> {
    const response = await request<ApiChatResponse>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        current_route: currentRoute.map((location) => ({
          contentid: location.contentid,
          title: location.title,
          category: location.category,
          category_name: location.categoryLabel,
          addr1: location.address,
          latitude: location.latitude,
          longitude: location.longitude,
        })),
      }),
    })
    return {
      answer: response.answer,
      locations: response.locations.map(normalizeLocation),
    }
  },
}
