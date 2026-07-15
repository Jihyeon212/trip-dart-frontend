import { request } from './http'
import { CATEGORY_META } from '@/constants'
import type { Category, Location, TransportMode } from '@/types'

interface ApiLocation {
  contentid?: string | number
  content_id?: string | number
  contenttypeid?: string | number
  title?: string
  category?: string
  category_label?: string
  addr1?: string
  addr2?: string
  address?: string
  tel?: string
  mapx?: string | number
  mapy?: string | number
  longitude?: string | number
  latitude?: string | number
  firstimage?: string
  firstimage2?: string
  image?: string
  cpyrhtDivCd?: string
  distance_km?: number
  applied_radius_km?: number | null
}

interface CandidateResponse { locations?: ApiLocation[] }
interface RandomResponse {
  status?: 'selected' | 'skipped'
  selected_location?: ApiLocation | null
  location?: ApiLocation | null
  applied_radius?: number | null
  applied_radius_km?: number | null
  radius_expanded?: boolean
  expanded?: boolean
  message?: string
}

function normalize(raw: ApiLocation, category: Category): Location {
  return {
    contentid: String(raw.contentid ?? raw.content_id ?? ''),
    contenttypeid: String(raw.contenttypeid ?? CATEGORY_META[category].contentTypeId),
    title: raw.title || '',
    category,
    categoryLabel: raw.category_label || CATEGORY_META[category].label,
    address: raw.address || [raw.addr1, raw.addr2].filter(Boolean).join(' '),
    tel: raw.tel || '',
    longitude: Number(raw.longitude ?? raw.mapx),
    latitude: Number(raw.latitude ?? raw.mapy),
    image: raw.image || raw.firstimage2 || raw.firstimage || '',
    copyrightType: raw.cpyrhtDivCd || '',
    distanceKm: raw.distance_km,
    appliedRadiusKm: raw.applied_radius_km,
  }
}

function centerQuery(center: Location | null) {
  return center ? `&center_latitude=${center.latitude}&center_longitude=${center.longitude}` : ''
}

export const locationsApi = {
  async candidates(category: Category, transportMode: TransportMode, center: Location | null, excludedIds: string[]) {
    const query = `/api/locations?category=${category}&transport_mode=${transportMode}${centerQuery(center)}&excluded_content_ids=${encodeURIComponent(excludedIds.join(','))}`
    const response = await request<CandidateResponse | ApiLocation[]>(query)
    const items = Array.isArray(response) ? response : response.locations || []
    return items.map((item) => normalize(item, category)).filter((item) => item.contentid && item.title && Number.isFinite(item.latitude) && Number.isFinite(item.longitude))
  },
  async random(category: Category, transportMode: TransportMode, center: Location | null, excludedIds: string[]) {
    const response = await request<RandomResponse>('/api/trips/random-location', {
      method: 'POST',
      body: JSON.stringify({
        category,
        transport_mode: transportMode,
        center_latitude: center?.latitude ?? null,
        center_longitude: center?.longitude ?? null,
        excluded_content_ids: excludedIds,
      }),
    })
    const raw = response.selected_location ?? response.location ?? null
    const radius = response.applied_radius_km ?? response.applied_radius ?? null
    return {
      selected: raw ? { ...normalize(raw, category), appliedRadiusKm: radius } : null,
      radius,
      expanded: response.radius_expanded ?? response.expanded ?? false,
      message: response.message,
    }
  },
}
