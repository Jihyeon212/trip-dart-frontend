import { computed, reactive } from 'vue'
import { STORAGE_KEY } from '@/constants'
import { chooseLocalLocation, localCandidates } from '@/data/localData'
import { locationsApi } from '@/api/locations'
import type { Category, TripState } from '@/types'

const emptyState = (): TripState => ({
  region: 'gwangju', transportMode: null, orderedCategories: [], currentIndex: 0,
  selectedLocations: [], skippedCategories: [], visited: {}, reportInputs: {}, generatedReport: null,
})

function load(): TripState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? { ...emptyState(), ...JSON.parse(saved) as TripState } : emptyState()
  } catch { return emptyState() }
}

const state = reactive<TripState>(load())
const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state))

export function useTrip() {
  const currentCategory = computed<Category | null>(() => state.orderedCategories[state.currentIndex] || null)
  const isComplete = computed(() => state.orderedCategories.length > 0 && state.currentIndex >= state.orderedCategories.length)
  const lastSelected = computed(() => state.selectedLocations[state.selectedLocations.length - 1] || null)

  function start(transportMode: TripState['transportMode'], orderedCategories: Category[]) {
    Object.assign(state, emptyState(), { transportMode, orderedCategories: [...orderedCategories] })
    save()
  }
  async function candidates() {
    if (!currentCategory.value) return []
    const excluded = state.selectedLocations.map((item) => item.contentid)
    if (state.transportMode) {
      try { return await locationsApi.candidates(currentCategory.value, state.transportMode, lastSelected.value, excluded) }
      catch { /* 백엔드 연결 전에는 로컬의 Git 제외 데이터가 있을 때만 fallback을 사용합니다. */ }
    }
    const baseRadius = lastSelected.value ? (state.transportMode === 'walking' ? 5 : 10) : null
    return localCandidates(currentCategory.value, lastSelected.value, baseRadius, excluded)
  }
  async function throwDart() {
    if (!currentCategory.value || !state.transportMode) return null
    const category = currentCategory.value
    const excluded = state.selectedLocations.map((item) => item.contentid)
    let result
    try { result = await locationsApi.random(category, state.transportMode, lastSelected.value, excluded) }
    catch { result = chooseLocalLocation(category, state.transportMode, lastSelected.value, excluded) }
    if (result.selected) state.selectedLocations.push(result.selected)
    else state.skippedCategories.push(category)
    save()
    return result
  }
  function next() { state.currentIndex += 1; save() }
  function setVisited(id: string, value: boolean) { state.visited[id] = value; save() }
  function reset() { Object.assign(state, emptyState()); localStorage.removeItem(STORAGE_KEY) }
  function saveReport() { save() }

  return { state, currentCategory, isComplete, lastSelected, start, candidates, throwDart, next, setVisited, reset, saveReport }
}
