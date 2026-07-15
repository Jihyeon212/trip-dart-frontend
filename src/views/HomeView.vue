<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { postsApi } from '@/api/posts'
import { CATEGORIES, CATEGORY_META, POST_TYPE_LABELS } from '@/constants'
import type { Post } from '@/types'

const recent = ref<Post[]>([])
onMounted(async () => {
  try {
    const response = await postsApi.list(1)
    recent.value = (Array.isArray(response) ? response : response.items).slice(0, 5)
  } catch { recent.value = [] }
})
</script>

<template>
  <div class="home-view">
    <section class="hero container">
      <div class="hero-copy">
        <span class="eyebrow">GWANGJU RANDOM TRIP</span>
        <h1>오늘 어디로 갈지<br /><em>고민하지 마세요.</em></h1>
        <p>광주의 관광지, 문화시설, 레포츠, 쇼핑, 음식점 중 다트가 뜻밖의 여행지를 골라드립니다.</p>
        <div class="hero-actions"><RouterLink to="/trip/setup" class="button accent large">🎯 광주 랜덤 여행 시작하기</RouterLink><RouterLink to="/community" class="button secondary large">커뮤니티 보기</RouterLink></div>
      </div>
      <div class="hero-visual" aria-label="광주 여행 티켓 미리보기">
        <div class="map-card"><span class="map-road road-one"></span><span class="map-road road-two"></span><span class="visual-pin pin-one">1</span><span class="visual-pin pin-two">2</span><span class="visual-dart">🎯</span></div>
        <div class="mini-receipt"><b>TODAY'S TRIP</b><span>01 어디로 갈까요?</span><span>02 다트가 정해요</span><i>GWANGJU · RANDOM</i></div>
      </div>
    </section>
    <section class="container home-section">
      <div class="section-heading"><span class="eyebrow">FIVE WAYS TO EXPLORE</span><h2>다섯 가지 방식으로 만나는 광주</h2></div>
      <div class="category-grid"><article v-for="category in CATEGORIES" :key="category" class="category-card"><span class="category-icon" :style="{ background: `${CATEGORY_META[category].color}18`, color: CATEGORY_META[category].color }">{{ CATEGORY_META[category].icon }}</span><h3>{{ CATEGORY_META[category].label }}</h3><p>{{ CATEGORY_META[category].description }}</p></article></div>
    </section>
    <section class="recent-section"><div class="container"><div class="section-heading inline"><div><span class="eyebrow">COMMUNITY</span><h2>최근 여행 이야기</h2></div><RouterLink to="/community">모두 보기 →</RouterLink></div><div v-if="recent.length" class="recent-list"><RouterLink v-for="post in recent" :key="post.id" :to="`/community/${post.id}`" class="recent-post"><span :class="['post-badge', post.post_type]">{{ POST_TYPE_LABELS[post.post_type] }}</span><strong>{{ post.title }}</strong><time>{{ new Date(post.created_at).toLocaleDateString('ko-KR') }}</time></RouterLink></div><div v-else class="empty-card"><p>아직 등록된 여행 이야기가 없습니다.</p><RouterLink to="/community/new" class="text-link">첫 번째 지역 정보를 공유해보세요 →</RouterLink></div></div></section>
  </div>
</template>
