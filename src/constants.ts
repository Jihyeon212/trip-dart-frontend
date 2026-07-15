import type { Category, PostType } from './types'

export const CATEGORY_META: Record<Category, { label: string; icon: string; color: string; contentTypeId: string; description: string }> = {
  tourist_spot: { label: '관광지', icon: '🏞️', color: '#2563eb', contentTypeId: '12', description: '광주의 풍경과 명소' },
  leisure_sports: { label: '레포츠', icon: '🚲', color: '#059669', contentTypeId: '28', description: '몸을 움직이는 즐거움' },
  cultural_facility: { label: '문화시설', icon: '🏛️', color: '#7c3aed', contentTypeId: '14', description: '예술과 이야기를 만나는 곳' },
  shopping: { label: '쇼핑', icon: '🛍️', color: '#d97706', contentTypeId: '38', description: '광주의 시장과 쇼핑 공간' },
  restaurant: { label: '음식점', icon: '🍴', color: '#dc2626', contentTypeId: '39', description: '광주의 맛을 발견하는 곳' },
}
export const CATEGORIES = Object.keys(CATEGORY_META) as Category[]
export const POST_TYPE_LABELS: Record<PostType, string> = { random_course: '랜덤 코스', travel_review: '여행 후기', local_info: '지역 정보' }
export const STORAGE_KEY = 'gwangju-random-trip-v1'
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '')
