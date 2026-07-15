<script setup lang="ts">
import { ref } from 'vue'
const open = ref(false)
</script>

<template>
  <header class="app-header">
    <div class="container header-inner">
      <RouterLink to="/" class="brand" @click="open = false"><span class="brand-mark">🎯</span><span>광주 다트립</span></RouterLink>
      <button class="menu-button" type="button" aria-label="메뉴 열기" :aria-expanded="open" @click="open = !open">☰</button>
      <nav :class="['main-nav', { open }]" aria-label="주 메뉴">
        <RouterLink to="/trip/setup" @click="open = false">랜덤 여행</RouterLink>
        <RouterLink to="/community" @click="open = false">커뮤니티</RouterLink>
      </nav>
    </div>
  </header>
</template>
