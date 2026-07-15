<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { CATEGORIES, CATEGORY_META } from '@/constants'
import { useTrip } from '@/composables/useTrip'
import type { Category, TransportMode } from '@/types'

const router = useRouter()
const { state, start } = useTrip()
const transport = ref<TransportMode | null>(null)
const selected = ref<Category[]>([])
const error = ref('')
const dragging = ref<number | null>(null)
const hasExisting = computed(() => state.orderedCategories.length > 0)

function toggle(category: Category) {
  error.value = ''
  const index = selected.value.indexOf(category)
  if (index >= 0) selected.value.splice(index, 1)
  else if (selected.value.length >= 5) error.value = '여행 카테고리는 최대 5개까지 선택할 수 있습니다.'
  else selected.value.push(category)
}
function move(index: number, offset: number) {
  const next = index + offset
  if (next < 0 || next >= selected.value.length) return
  const [item] = selected.value.splice(index, 1)
  selected.value.splice(next, 0, item)
}
function drop(index: number) {
  if (dragging.value == null || dragging.value === index) return
  const [item] = selected.value.splice(dragging.value, 1)
  selected.value.splice(index, 0, item)
  dragging.value = null
}
function submit() {
  if (!transport.value) { error.value = '이동 방식을 선택해주세요.'; return }
  if (!selected.value.length) { error.value = '여행 카테고리를 하나 이상 선택해주세요.'; return }
  start(transport.value, selected.value)
  router.push('/trip')
}
function newTrip() {
  if (confirm('저장된 여행을 지우고 새로 시작하시겠습니까?')) { localStorage.removeItem('gwangju-random-trip-v1'); location.reload() }
}
</script>

<template>
  <div class="page container setup-page">
    <div class="page-heading"><span class="eyebrow">MAKE YOUR ROUTE</span><h1>광주 랜덤 여행 만들기</h1><p>이동 방식과 만나고 싶은 광주의 모습을 순서대로 골라주세요.</p></div>
    <div v-if="hasExisting" class="resume-banner"><div><strong>진행 중인 광주 여행이 있습니다.</strong><p>기존 코스를 이어가거나 새로운 여행을 시작할 수 있어요.</p></div><div><RouterLink to="/trip" class="button primary">여행 계속하기</RouterLink><button class="button ghost" type="button" @click="newTrip">새로 시작하기</button></div></div>
    <form class="setup-card" @submit.prevent="submit">
      <section><div class="step-title"><span>1</span><div><h2>어떻게 이동할까요?</h2><p>표시 거리는 두 장소 사이의 직선거리이며 실제 이동 거리와 다를 수 있습니다.</p></div></div><div class="segmented"><button v-for="option in ([['walking','🚶','뚜벅이','최초 5km'],['public_transit','🚌','대중교통','최초 10km']] as const)" :key="option[0]" type="button" :class="{ selected: transport === option[0] }" @click="transport = option[0]"><span>{{ option[1] }}</span><strong>{{ transport === option[0] ? '✓ ' : '' }}{{ option[2] }}</strong><small>{{ option[3] }}</small></button></div></section>
      <section><div class="step-title"><span>2</span><div><h2>여행 카테고리를 선택하세요</h2><p>최소 1개, 최대 5개까지 중복 없이 고를 수 있어요.</p></div></div><div class="category-chips"><button v-for="category in CATEGORIES" :key="category" type="button" :class="['category-chip', { selected: selected.includes(category) }]" :style="selected.includes(category) ? { '--chip': CATEGORY_META[category].color } : {}" @click="toggle(category)"><b v-if="selected.includes(category)">{{ selected.indexOf(category) + 1 }}</b><span>{{ CATEGORY_META[category].icon }}</span>{{ CATEGORY_META[category].label }}</button></div></section>
      <section><div class="step-title"><span>3</span><div><h2>여행 순서를 정하세요</h2><p>끌어서 이동하거나 화살표 버튼을 이용하세요.</p></div></div><div v-if="selected.length" class="order-list"><div v-for="(category, index) in selected" :key="category" class="order-item" draggable="true" @dragstart="dragging = index" @dragover.prevent @drop="drop(index)"><span class="drag-handle">≡</span><b>{{ index + 1 }}</b><span>{{ CATEGORY_META[category].icon }} {{ CATEGORY_META[category].label }}</span><div><button type="button" :disabled="index === 0" :aria-label="`${CATEGORY_META[category].label} 위로`" @click="move(index, -1)">↑</button><button type="button" :disabled="index === selected.length - 1" :aria-label="`${CATEGORY_META[category].label} 아래로`" @click="move(index, 1)">↓</button></div></div></div><div v-else class="order-empty">카테고리를 선택하면 여행 순서가 여기에 표시됩니다.</div></section>
      <p v-if="error" class="form-error" role="alert">{{ error }}</p><button class="button accent large submit-trip" type="submit" :disabled="!transport || !selected.length">광주 여행 시작하기</button><p v-if="!selected.length" class="disabled-help">카테고리를 하나 이상 선택해주세요.</p>
    </form>
  </div>
</template>
