export type Category = 'tourist_spot' | 'leisure_sports' | 'cultural_facility' | 'shopping' | 'restaurant'
export type PlaceCategory = Category | 'festival' | 'accommodation' | 'travel_course'
export type TransportMode = 'walking' | 'public_transit'

export interface Location {
  contentid: string
  contenttypeid: string
  title: string
  category: PlaceCategory
  categoryLabel: string
  address: string
  tel: string
  longitude: number
  latitude: number
  image: string
  copyrightType: string
  distanceKm?: number
  appliedRadiusKm?: number | null
}

export interface TripState {
  region: 'gwangju'
  transportMode: TransportMode | null
  orderedCategories: Category[]
  currentIndex: number
  selectedLocations: Location[]
  skippedCategories: Category[]
  visited: Record<string, boolean>
  reportInputs: ReportInputs
  generatedReport: GeneratedReport | null
}

export interface LocationReview { visitTime?: string; rating?: number; review?: string }
export interface ReportInputs {
  locations?: Record<string, LocationReview>
  overallRating?: number
  overallReview?: string
  additionalNotes?: string
}
export interface GeneratedReport {
  title: string
  summary: string
  timeline: Array<{ time?: string; place: string; rating?: number; description?: string }>
  overallReview?: string
  aiInsights: {
    travelStyle: {
      title: string
      description: string
    }
    keywords: string[]
    satisfactionPoints: Array<{
      title: string
      description: string
      evidence: string[]
    }>
    disappointmentPoints: Array<{
      title: string
      description: string
      evidence: string[]
    }>
    nextTripSuggestion: {
      summary: string
      recommendedCategories: Category[]
    }
  } | null
}

export interface SharedReportData {
  data_type: 'generated_report'
  version: 1
  report: GeneratedReport
  locations: Location[]
}

export type PostRouteData = Array<Location | SharedReportData>

export type PostType = 'random_course' | 'travel_review' | 'local_info'
export interface Post {
  id: number
  post_type: PostType
  title: string
  content: string
  nickname: string
  route_data?: PostRouteData | string | null
  created_at: string
  updated_at?: string
}
export interface PostPayload { post_type: PostType; title: string; content: string; nickname: string; password: string; route_data?: PostRouteData | null }
export interface PaginatedPosts { items: Post[]; total: number; page: number; size: number; total_pages: number }

export interface ChatMessage { id: string; role: 'user' | 'assistant'; content: string; locations?: Location[] }
