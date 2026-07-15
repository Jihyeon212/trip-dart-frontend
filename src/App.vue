<script setup lang="ts">
import AppHeader from '@/components/common/AppHeader.vue'
import ChatWidget from '@/components/chat/ChatWidget.vue'
</script>

<template>
  <AppHeader />
  <main><RouterView /></main>
  <ChatWidget />
  <footer class="app-footer">
    <div class="container">이 서비스는 한국관광공사 TourAPI 4.0 데이터를 활용합니다. · 공공누리 제3유형</div>
  </footer>
</template>
