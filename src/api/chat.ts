import type { ChatMessage, Location } from '@/types'
import { request } from './http'

export interface ChatResponse { message?: string; answer?: string; locations?: Location[] }
export const chatApi = {
  send: (message: string, history: ChatMessage[], currentRoute: Location[]) => request<ChatResponse>('/api/chat', {
    method: 'POST', body: JSON.stringify({ message, history, current_route: currentRoute }),
  }),
}
