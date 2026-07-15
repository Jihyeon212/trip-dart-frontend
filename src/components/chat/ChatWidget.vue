<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { chatApi } from '@/api/chat'
import { searchLocalLocations } from '@/data/localData'
import { useTrip } from '@/composables/useTrip'
import type { ChatMessage } from '@/types'
import LocationCard from '@/components/trip/LocationCard.vue'

const { state } = useTrip()
const open = ref(false)
const input = ref('')
const sending = ref(false)
const log = ref<HTMLElement | null>(null)
const messages = ref<ChatMessage[]>([{ id: 'hello', role: 'assistant', content: '안녕하세요. 광주의 장소와 현재 여행 코스를 안내해드릴게요.' }])

async function send() {
  const content = input.value.trim()
  if (!content || sending.value) return
  messages.value.push({ id: crypto.randomUUID(), role: 'user', content })
  input.value = ''
  sending.value = true
  try {
    const response = await chatApi.send(content, messages.value, state.selectedLocations)
    messages.value.push({ id: crypto.randomUUID(), role: 'assistant', content: response.message || response.answer || '응답을 확인해주세요.', locations: response.locations?.slice(0, 3) })
  } catch {
    const routeQuestion = /내 여행|코스|정해진 장소/.test(content)
    const locations = routeQuestion ? state.selectedLocations.slice(0, 3) : searchLocalLocations(content)
    const fallbackContent = routeQuestion
      ? (state.selectedLocations.length ? `현재 코스는 ${state.selectedLocations.map((item, index) => `${index + 1}. ${item.title}`).join(', ')} 순서입니다.` : '현재 저장된 여행 코스가 없습니다.')
      : (locations.length ? `제공된 광주 지역 데이터에서 ${locations.length}곳을 찾았습니다.` : '현재 제공된 광주 지역 데이터에서는 해당 정보를 찾지 못했습니다.')
    messages.value.push({ id: crypto.randomUUID(), role: 'assistant', content: fallbackContent, locations })
  } finally {
    sending.value = false
    await nextTick()
    log.value?.scrollTo({ top: log.value.scrollHeight, behavior: 'smooth' })
  }
}
</script>

<template>
  <button class="chat-fab" type="button" :aria-label="open ? '챗봇 닫기' : '광주 여행 도우미 열기'" @click="open = !open">{{ open ? '×' : '💬' }}</button>
  <section v-if="open" class="chat-window" aria-label="광주 여행 도우미">
    <header><div><strong>광주 여행 도우미</strong><small>한국관광공사 제공 데이터 기반</small></div><button type="button" aria-label="닫기" @click="open = false">×</button></header>
    <div ref="log" class="chat-log" aria-live="polite">
      <article v-for="message in messages" :key="message.id" :class="['chat-message', message.role]">
        <p>{{ message.content }}</p>
        <div v-if="message.locations?.length" class="chat-locations"><LocationCard v-for="location in message.locations" :key="location.contentid" :location="location" compact /></div>
      </article>
      <p v-if="sending" class="chat-thinking">답변을 찾고 있어요…</p>
    </div>
    <form class="chat-form" @submit.prevent="send"><input v-model="input" aria-label="메시지" placeholder="예: 문화시설 추천해줘" maxlength="300" /><button type="submit" :disabled="sending || !input.trim()">전송</button></form>
  </section>
</template>
