import type { GeneratedReport, ReportInputs, TripState } from '@/types'
import { request } from './http'

export const reportsApi = {
  generate: (trip: TripState, inputs: ReportInputs) => request<GeneratedReport>('/api/reports/generate', {
    method: 'POST',
    body: JSON.stringify({ region: 'gwangju', transport_mode: trip.transportMode, visited_locations: trip.selectedLocations.filter((item) => trip.visited[item.contentid]), inputs }),
  }),
}
