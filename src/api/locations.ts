import { request } from './http'
import { CATEGORY_META } from '@/constants'
import type { Category, Location, TransportMode } from '@/types'

export interface ApiLocation {
  contentid: string
  contenttypeid: string
  category: string
  category_name: string
  title: string
  addr1: string
  addr2: string
  tel: string
  longitude: number
  latitude: number
  image_url: string
  thumbnail_url: string
  sigungucode: string
  distance_km?: number
}

interface CandidateResponse {
  locations: ApiLocation[]
  search_scope: 'radius' | 'all_gwangju'
  applied_radius_km: number | null
  radius_expanded: boolean
  candidate_count: number
  message: string | null
}

interface RandomResponse {
  status: 'selected' | 'skipped'
  selected_location: ApiLocation | null
  search_scope: 'radius' | 'all_gwangju'
  applied_radius_km: number | null
  radius_expanded: boolean
  candidate_count: number
  message: string
}

export function normalizeLocation(raw: ApiLocation): Location {
  const category = raw.category as Category
  return {
    contentid: raw.contentid,
    contenttypeid: raw.contenttypeid,
    title: raw.title,
    category,
    categoryLabel: raw.category_name || CATEGORY_META[category]?.label || raw.category,
    address: [raw.addr1, raw.addr2].filter(Boolean).join(' '),
    tel: raw.tel,
    longitude: raw.longitude,
    latitude: raw.latitude,
    image: raw.image_url || raw.thumbnail_url,
    copyrightType: '',
    distanceKm: raw.distance_km,
  }
}

function tripRequest(category: Category, transportMode: TransportMode, center: Location | null, excludedIds: string[]) {
  return {
    category,
    transport_mode: transportMode,
    center: center ? { latitude: center.latitude, longitude: center.longitude } : null,
    excluded_content_ids: excludedIds,
  }
}

export const locationsApi = {
  async candidates(category: Category, transportMode: TransportMode, center: Location | null, excludedIds: string[]) {
    const response = await request<CandidateResponse>('/api/trips/candidates', {
      method: 'POST',
      body: JSON.stringify(tripRequest(category, transportMode, center, excludedIds)),
    })
    return response.locations.map(normalizeLocation)
  },

  async random(category: Category, transportMode: TransportMode, center: Location | null, excludedIds: string[]) {
    const response = await request<RandomResponse>('/api/trips/random-location', {
      method: 'POST',
      body: JSON.stringify(tripRequest(category, transportMode, center, excludedIds)),
    })
    const radius = response.applied_radius_km
    return {
      selected: response.selected_location
        ? { ...normalizeLocation(response.selected_location), appliedRadiusKm: radius }
        : null,
      radius,
      expanded: response.radius_expanded,
      message: response.message,
    }
  },
}
