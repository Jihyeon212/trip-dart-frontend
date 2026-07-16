<script setup lang="ts">
import { CATEGORY_META } from '@/constants'
import type { GeneratedReport } from '@/types'

defineProps<{ report: GeneratedReport }>()
</script>

<template>
  <section class="generated-report">
    <div class="report-ticket-head"><span>GWANGJU TRIP REPORT</span><small>BY DART · BY CHANCE</small></div>
    <h1>{{ report.title }}</h1>
    <p class="report-summary">{{ report.summary }}</p>
    <ol class="timeline">
      <li v-for="(item, index) in report.timeline" :key="`${item.place}-${index}`">
        <div class="timeline-marker">{{ String(index + 1).padStart(2, '0') }}</div>
        <div><time v-if="item.time">{{ item.time }}</time><h2>{{ item.place }}</h2><p v-if="item.rating" class="report-rating">{{ '★'.repeat(item.rating) }}{{ '☆'.repeat(5 - item.rating) }}</p><p v-if="item.description">{{ item.description }}</p></div>
      </li>
    </ol>
    <blockquote v-if="report.overallReview">{{ report.overallReview }}</blockquote>
    <section v-if="report.aiInsights" class="ai-insights">
      <span class="ai-insights-label">AI TRAVEL INSIGHTS</span>
      <h2>{{ report.aiInsights.travelStyle.title }}</h2>
      <p>{{ report.aiInsights.travelStyle.description }}</p>
      <ul class="insight-keywords"><li v-for="keyword in report.aiInsights.keywords" :key="keyword">#{{ keyword }}</li></ul>
      <div v-if="report.aiInsights.satisfactionPoints.length" class="insight-group">
        <h3>만족했던 점</h3>
        <article v-for="point in report.aiInsights.satisfactionPoints" :key="point.title"><strong>{{ point.title }}</strong><p>{{ point.description }}</p><small v-for="evidence in point.evidence" :key="evidence">“{{ evidence }}”</small></article>
      </div>
      <div v-if="report.aiInsights.disappointmentPoints.length" class="insight-group">
        <h3>아쉬웠던 점</h3>
        <article v-for="point in report.aiInsights.disappointmentPoints" :key="point.title"><strong>{{ point.title }}</strong><p>{{ point.description }}</p><small v-for="evidence in point.evidence" :key="evidence">“{{ evidence }}”</small></article>
      </div>
      <div class="next-trip-suggestion">
        <h3>다음 여행 추천</h3><p>{{ report.aiInsights.nextTripSuggestion.summary }}</p>
        <div><span v-for="category in report.aiInsights.nextTripSuggestion.recommendedCategories" :key="category">{{ CATEGORY_META[category]?.label || category }}</span></div>
      </div>
    </section>
    <slot name="actions" />
  </section>
</template>
