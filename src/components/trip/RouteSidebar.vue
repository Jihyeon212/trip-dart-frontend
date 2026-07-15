<script setup lang="ts">
import { computed } from 'vue'
import { CATEGORY_META } from '@/constants'
import type { Category, TripState } from '@/types'

const props = defineProps<{ trip: TripState; complete: boolean }>()
const emit = defineEmits<{ visit: [id: string, value: boolean]; reset: [] }>()
const date = new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
const indexedLocations = computed(() => {
  let selectedIndex = 0
  return props.trip.orderedCategories.map((category, index) => {
    const skipped = props.trip.skippedCategories.includes(category)
    const location = skipped ? null : props.trip.selectedLocations[selectedIndex] || null
    if (location) selectedIndex += 1
    return { category, index, skipped, location }
  })
})
</script>

<template>
  <aside class="receipt-card">
    <div class="receipt-head"><span>TODAY'S RANDOM TRIP</span><small>GWANGJU · {{ date }}</small></div>
    <ol class="route-list">
      <li v-for="item in indexedLocations" :key="`${item.category}-${item.index}`" :class="{ current: item.index === trip.currentIndex && !complete, skipped: item.skipped }">
        <span class="route-number">{{ String(item.index + 1).padStart(2, '0') }}</span>
        <div class="route-info">
          <strong>{{ item.location?.title || CATEGORY_META[item.category as Category].label }}</strong>
          <small>{{ item.skipped ? '장소 없음 · 건너뜀' : item.location?.categoryLabel || '선정 예정' }}</small>
        </div>
        <span v-if="item.location && !complete" class="route-state">✓</span>
        <span v-else-if="!item.location && !item.skipped" class="route-state">{{ item.index === trip.currentIndex ? '▶' : '○' }}</span>
        <label v-if="item.location && complete" class="visit-check">
          <input type="checkbox" :checked="trip.visited[item.location.contentid]" @change="emit('visit', item.location!.contentid, ($event.target as HTMLInputElement).checked)" />
          <span>{{ trip.visited[item.location.contentid] ? '방문 완료' : '미방문' }}</span>
        </label>
      </li>
    </ol>
    <div class="receipt-summary"><span>이동 방식</span><strong>{{ trip.transportMode === 'walking' ? '뚜벅이' : '대중교통' }}</strong><span>총 장소</span><strong>{{ trip.selectedLocations.length }}곳</strong></div>
    <div v-if="complete" class="receipt-actions">
      <RouterLink to="/report" class="button accent">여행 리포트 만들기</RouterLink>
      <RouterLink to="/community/new?source=route" class="button secondary">커뮤니티에 코스 공유</RouterLink>
      <button type="button" class="button ghost" @click="emit('reset')">여행 처음부터 시작</button>
    </div>
  </aside>
</template>
