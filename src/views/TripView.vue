<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { CATEGORY_META } from '@/constants'
import { useTrip } from '@/composables/useTrip'
import type { Location } from '@/types'
import TripMap from '@/components/trip/TripMap.vue'
import LocationCard from '@/components/trip/LocationCard.vue'
import RouteSidebar from '@/components/trip/RouteSidebar.vue'

const router = useRouter()
const { state, currentCategory, isComplete, candidates, throwDart, next, setVisited, reset } = useTrip()
const mapCandidates = ref<Location[]>([])
function restoredCurrentLocation() {
  const selectedBefore = state.orderedCategories.slice(0, state.currentIndex).filter((category) => !state.skippedCategories.includes(category)).length
  if (currentCategory.value && !state.skippedCategories.includes(currentCategory.value) && state.selectedLocations.length > selectedBefore) return state.selectedLocations[selectedBefore] || null
  return null
}
const restored = restoredCurrentLocation()
const focused = ref<Location | null>(restored)
const chosen = ref<Location | null>(restored)
const choosing = ref(false)
const message = ref(currentCategory.value && state.skippedCategories.includes(currentCategory.value) ? '현재 데이터에서 조건에 맞는 장소를 찾지 못해 해당 카테고리를 건너뛰었습니다.' : '')
const expandedMessage = ref('')

if (!state.transportMode || !state.orderedCategories.length) router.replace('/trip/setup')

async function dart() {
  if (choosing.value || chosen.value) return
  choosing.value = true; message.value = ''; expandedMessage.value = ''
  await new Promise((resolve) => setTimeout(resolve, 650))
  const result = await throwDart()
  chosen.value = result?.selected || null
  focused.value = chosen.value
  if (!chosen.value) message.value = '현재 데이터에서 조건에 맞는 장소를 찾지 못해 해당 카테고리를 건너뛰었습니다.'
  else if (result?.expanded) expandedMessage.value = result.radius == null ? '기본 반경 안에 장소가 없어 광주 전체로 검색 범위를 넓혔습니다.' : `기본 반경 안에 장소가 없어 검색 범위를 ${result.radius}km로 넓혔습니다.`
  choosing.value = false
}
function advance() { chosen.value = null; focused.value = null; message.value = ''; expandedMessage.value = ''; next() }
function restart() { if (confirm('지금까지 선택한 장소와 방문 기록이 모두 삭제됩니다. 여행을 처음부터 다시 시작하시겠습니까?')) { reset(); router.push('/trip/setup') } }

watch([currentCategory, () => state.currentIndex], async () => {
  mapCandidates.value = chosen.value || message.value || isComplete.value ? [] : await candidates()
}, { immediate: true })
</script>

<template>
  <div class="trip-page">
    <div class="container trip-progress"><div><span class="eyebrow">RANDOM ROUTE</span><h1 v-if="!isComplete && currentCategory">{{ state.currentIndex + 1 }} / {{ state.orderedCategories.length }} {{ CATEGORY_META[currentCategory].label }} 장소를 뽑을 차례예요</h1><h1 v-else>오늘의 광주 여행 코스가 완성됐어요</h1></div><span class="progress-count">{{ Math.min(state.currentIndex + 1, state.orderedCategories.length) }} / {{ state.orderedCategories.length }}</span></div>
    <div class="container trip-layout">
      <section class="map-panel">
        <TripMap :candidates="chosen || message ? [] : mapCandidates" :selected="state.selectedLocations" :current="chosen" @select="focused = $event" />
        <div v-if="focused" class="map-location-card"><button type="button" aria-label="장소 정보 닫기" @click="focused = null">×</button><LocationCard :location="focused" compact /></div>
        <div v-if="!isComplete" class="dart-area">
          <p v-if="expandedMessage" class="range-notice">{{ expandedMessage }}</p><p v-if="message" class="skip-notice">{{ message }}</p>
          <button v-if="!chosen && !message" class="button accent dart-button" type="button" :disabled="choosing" @click="dart">{{ choosing ? '장소를 고르는 중…' : '🎯 다트 던지기' }}</button>
          <button v-else class="button accent dart-button" type="button" @click="advance">{{ state.currentIndex === state.orderedCategories.length - 1 ? '여행 코스 완성' : '다음 장소 뽑기' }}</button>
          <small v-if="!chosen && !message">다트를 던지면 장소가 바로 확정되며 다시 선택할 수 없습니다.</small>
        </div>
      </section>
      <RouteSidebar :trip="state" :complete="isComplete" @visit="setVisited" @reset="restart" />
    </div>
  </div>
</template>
