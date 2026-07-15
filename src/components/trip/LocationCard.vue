<script setup lang="ts">
import type { Location } from '@/types'
defineProps<{ location: Location; compact?: boolean }>()
</script>

<template>
  <article :class="['location-card', { compact }]">
    <div v-if="location.image" class="location-image-wrap">
      <img :src="location.image" :alt="`${location.title} 대표 이미지`" class="location-image" referrerpolicy="no-referrer" />
      <span class="image-source">한국관광공사</span>
    </div>
    <div v-else class="location-image placeholder" aria-label="이미지 없음">GWANGJU</div>
    <div class="location-body">
      <span class="category-label">{{ location.categoryLabel }}</span>
      <h3>{{ location.title }}</h3>
      <p v-if="location.address" class="muted truncate">{{ location.address }}</p>
      <p v-if="location.distanceKm != null" class="distance">이전 장소에서 {{ location.distanceKm.toFixed(1) }}km</p>
      <p v-if="location.tel" class="muted">{{ location.tel }}</p>
    </div>
  </article>
</template>
