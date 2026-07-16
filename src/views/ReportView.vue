<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { reportsApi } from '@/api/reports'
import { useTrip } from '@/composables/useTrip'
import type { GeneratedReport, LocationReview, ReportInputs } from '@/types'
import ReportReceipt from '@/components/report/ReportReceipt.vue'

const router = useRouter(); const { state, saveReport } = useTrip()
const visited = computed(() => state.selectedLocations.filter((item) => state.visited[item.contentid]))
const inputs = reactive<ReportInputs>({ locations: {}, ...state.reportInputs })
const loading = ref(false); const error = ref('')
function review(id: string): LocationReview { if (!inputs.locations) inputs.locations = {}; if (!inputs.locations[id]) inputs.locations[id] = {}; return inputs.locations[id] }
function setRating(target: LocationReview, rating: number) { target.rating === rating ? delete target.rating : target.rating = rating; persist() }
function setOverall(rating: number) { inputs.overallRating = inputs.overallRating === rating ? undefined : rating; persist() }
function persist() { state.reportInputs = JSON.parse(JSON.stringify(inputs)) as ReportInputs; saveReport() }
function localReport(): GeneratedReport {
  const timeline = visited.value.map((place) => { const item = review(place.contentid); return { time: item.visitTime || undefined, place: place.title, rating: item.rating, description: item.review?.trim() || undefined } })
  return {
    title: '다트가 정해준 광주의 하루',
    summary: `${visited.value.map((item) => item.title).join(', ')}을(를) 방문한 광주 여행 기록입니다.`,
    timeline,
    overallReview: inputs.overallReview?.trim() || inputs.additionalNotes?.trim() || undefined,
    aiInsights: {
      travelStyle: {
        title: 'AI 분석 결과 없음',
        description: 'AI 리포트 결과가 없어 입력한 여행 기록으로 기본 리포트를 생성했습니다.',
      },
      keywords: [],
      satisfactionPoints: [],
      disappointmentPoints: [],
      nextTripSuggestion: {
        summary: 'AI 리포트 결과가 없어 다음 여행 추천을 제공할 수 없습니다.',
        recommendedCategories: [],
      },
    },
  }
}
async function generate() {
  if (!visited.value.length) { error.value = '방문한 장소를 하나 이상 체크한 후 여행 리포트를 만들어주세요.'; return }
  persist(); loading.value = true; error.value = ''
  try { state.generatedReport = await reportsApi.generate(state, inputs) }
  catch { state.generatedReport = localReport() }
  finally { saveReport(); loading.value = false }
}
</script>

<template>
  <div class="page container report-page">
    <div class="page-heading"><span class="eyebrow">TRAVEL RECORD</span><h1>광주 여행 리포트</h1><p>실제로 방문한 장소의 기억만 담아 나만의 여행 기록을 완성하세요.</p></div>
    <div v-if="!visited.length" class="report-empty"><span>✓</span><h2>방문한 장소를 먼저 체크해주세요</h2><p>코스 화면에서 실제로 방문한 장소를 한 곳 이상 체크하면 리포트를 만들 수 있어요.</p><RouterLink to="/trip" class="button primary">여행 코스로 돌아가기</RouterLink></div>
    <template v-else-if="!state.generatedReport">
      <form class="report-form" @submit.prevent="generate"><section><div class="report-section-head"><span>01</span><div><h2>장소별 여행 기록</h2><p>입력하지 않은 정보는 리포트에 포함되지 않습니다.</p></div></div><article v-for="(location, index) in visited" :key="location.contentid" class="review-card"><header><span>{{ String(index + 1).padStart(2, '0') }}</span><div><h3>{{ location.title }}</h3><p>{{ location.categoryLabel }}</p></div></header><div class="review-fields"><label>방문 시간<input v-model="review(location.contentid).visitTime" type="time" @change="persist" /></label><fieldset><legend>만족도</legend><div class="rating"><button v-for="star in 5" :key="star" type="button" :aria-label="`${star}점`" :class="{ active: (review(location.contentid).rating || 0) >= star }" @click="setRating(review(location.contentid), star)">★</button></div></fieldset><label class="wide">한 줄 후기<input v-model="review(location.contentid).review" maxlength="200" placeholder="이 장소에서 기억에 남은 점" @change="persist" /></label></div></article></section>
        <section><div class="report-section-head"><span>02</span><div><h2>오늘 여행의 전체 기록</h2><p>모든 항목은 선택 입력입니다.</p></div></div><div class="overall-card"><fieldset><legend>전체 여행 만족도</legend><div class="rating large"><button v-for="star in 5" :key="star" type="button" :class="{ active: (inputs.overallRating || 0) >= star }" :aria-label="`전체 여행 ${star}점`" @click="setOverall(star)">★</button></div></fieldset><label>전체 소감<textarea v-model="inputs.overallReview" rows="4" maxlength="1000" placeholder="오늘 여행을 한 문장으로 돌아본다면?" @change="persist"></textarea></label><label>추가로 기록할 내용<textarea v-model="inputs.additionalNotes" rows="4" maxlength="1000" placeholder="계획에 없던 장소나 사건을 기록해보세요." @change="persist"></textarea></label></div></section>
        <p v-if="error" class="form-error callout">{{ error }}</p><button class="button accent large report-submit" type="submit" :disabled="loading">{{ loading ? '여행 리포트 생성 중…' : '여행 리포트 만들기' }}</button>
      </form>
    </template>
    <ReportReceipt v-else :report="state.generatedReport">
      <template #actions><div class="report-actions"><button class="button secondary" type="button" @click="state.generatedReport = null; saveReport()">리포트 입력 수정하기</button><RouterLink to="/community/new?source=report" class="button primary">커뮤니티에 공유하기</RouterLink><button class="button ghost" type="button" @click="router.push('/trip')">여행 코스로 돌아가기</button></div></template>
    </ReportReceipt>
  </div>
</template>
