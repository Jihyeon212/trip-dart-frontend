import { CATEGORY_META } from '@/constants'
import type { Category, Location, PlaceCategory, TransportMode } from '@/types'

interface RawItem {
  contentid: string; contenttypeid: string; title: string; addr1: string; addr2: string; tel: string
  mapx: string; mapy: string; firstimage: string; firstimage2: string; cpyrhtDivCd: string; areacode: string
}
interface RawDataset { items: RawItem[] }

// JSON 파일은 저장소에 포함하지 않습니다. 로컬에 파일이 있을 때만 API 미연결 개발용 fallback으로 사용합니다.
const localModules = import.meta.glob('/src/assets/data/*.json', { eager: true, import: 'default' }) as Record<string, RawDataset>
const emptyDataset: RawDataset = { items: [] }
function dataset(name: string) {
  return Object.entries(localModules).find(([path]) => path.endsWith(name))?.[1] || emptyDataset
}

const EXTRA_META: Record<Exclude<PlaceCategory, Category>, { label: string }> = {
  festival: { label: '축제·공연·행사' }, accommodation: { label: '숙박' }, travel_course: { label: '여행코스' },
}

function normalize(dataset: RawDataset, category: PlaceCategory): Location[] {
  const categoryLabel = category in CATEGORY_META
    ? CATEGORY_META[category as Category].label
    : EXTRA_META[category as Exclude<PlaceCategory, Category>].label
  return dataset.items
    .filter((item) => item.areacode === '5' && item.contentid && item.title && Number.isFinite(Number(item.mapx)) && Number.isFinite(Number(item.mapy)))
    .map((item) => ({
      contentid: item.contentid,
      contenttypeid: item.contenttypeid,
      title: item.title,
      category,
      categoryLabel,
      address: [item.addr1, item.addr2].filter(Boolean).join(' '),
      tel: item.tel || '',
      longitude: Number(item.mapx),
      latitude: Number(item.mapy),
      image: item.firstimage2 || item.firstimage || '',
      copyrightType: item.cpyrhtDivCd || '',
    }))
}

export const TRIP_LOCATIONS: Record<Category, Location[]> = {
  tourist_spot: normalize(dataset('광주_전라권_관광지.json'), 'tourist_spot'),
  leisure_sports: normalize(dataset('광주_전라권_레포츠.json'), 'leisure_sports'),
  cultural_facility: normalize(dataset('광주_전라권_문화시설.json'), 'cultural_facility'),
  shopping: normalize(dataset('광주_전라권_쇼핑.json'), 'shopping'),
  restaurant: normalize(dataset('광주_전라권_음식점.json'), 'restaurant'),
}

export const ALL_LOCAL_LOCATIONS = [
  ...Object.values(TRIP_LOCATIONS).flat(),
  ...normalize(dataset('광주_전라권_축제공연행사.json'), 'festival'),
  ...normalize(dataset('광주_전라권_숙박.json'), 'accommodation'),
  ...normalize(dataset('광주_전라권_여행코스.json'), 'travel_course'),
]

function radians(value: number) { return value * Math.PI / 180 }
export function distanceKm(a: Pick<Location, 'latitude' | 'longitude'>, b: Pick<Location, 'latitude' | 'longitude'>) {
  const earth = 6371
  const dLat = radians(b.latitude - a.latitude)
  const dLng = radians(b.longitude - a.longitude)
  const value = Math.sin(dLat / 2) ** 2 + Math.cos(radians(a.latitude)) * Math.cos(radians(b.latitude)) * Math.sin(dLng / 2) ** 2
  return earth * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value))
}

export function localCandidates(category: Category, center?: Location | null, radiusKm?: number | null, excluded: string[] = []) {
  return TRIP_LOCATIONS[category]
    .filter((item) => !excluded.includes(item.contentid))
    .map((item) => ({ ...item, distanceKm: center ? distanceKm(center, item) : undefined }))
    .filter((item) => !center || radiusKm == null || (item.distanceKm ?? Infinity) <= radiusKm)
}

export function chooseLocalLocation(category: Category, transportMode: TransportMode, center: Location | null, excluded: string[]) {
  const radii = center ? (transportMode === 'walking' ? [5, 7.5, 10, null] : [10, 15, 20, null]) : [null]
  for (const radius of radii) {
    const candidates = localCandidates(category, center, radius, excluded)
    if (candidates.length) {
      const selected = candidates[Math.floor(Math.random() * candidates.length)]
      return { selected: { ...selected, appliedRadiusKm: radius }, radius, expanded: center ? radius !== radii[0] : false }
    }
  }
  return { selected: null, radius: null, expanded: false }
}

export function searchLocalLocations(query: string): Location[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return []
  const categoryWords: Record<string, PlaceCategory> = {
    관광지: 'tourist_spot', 문화: 'cultural_facility', 문화시설: 'cultural_facility', 레포츠: 'leisure_sports',
    쇼핑: 'shopping', 음식점: 'restaurant', 맛집: 'restaurant', 축제: 'festival', 행사: 'festival',
    숙박: 'accommodation', 호텔: 'accommodation', 여행코스: 'travel_course',
  }
  const matchedCategory = Object.entries(categoryWords).find(([word]) => normalized.includes(word))?.[1]
  const matches = ALL_LOCAL_LOCATIONS.filter((item) => {
    if (matchedCategory) return item.category === matchedCategory
    return `${item.title} ${item.address} ${item.categoryLabel}`.toLowerCase().includes(normalized)
  })
  return [...matches].sort(() => Math.random() - 0.5).slice(0, 3)
}
