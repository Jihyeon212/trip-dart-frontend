<script setup lang="ts">
import { ref, watch } from 'vue'
const props = defineProps<{ open: boolean; mode: 'edit' | 'delete'; loading?: boolean; error?: string }>()
const emit = defineEmits<{ close: []; submit: [password: string] }>()
const password = ref('')
watch(() => props.open, (value) => { if (value) password.value = '' })
function submit() { if (/^\d{4}$/.test(password.value)) emit('submit', password.value) }
</script>

<template>
  <div v-if="open" class="modal-backdrop" @mousedown.self="emit('close')">
    <section class="modal" role="dialog" aria-modal="true" aria-labelledby="password-title">
      <button class="modal-close" type="button" aria-label="닫기" @click="emit('close')">×</button>
      <span class="modal-icon">{{ mode === 'delete' ? '!' : '🔒' }}</span><h2 id="password-title">{{ mode === 'delete' ? '게시글 삭제' : '비밀번호 확인' }}</h2>
      <p>{{ mode === 'delete' ? '삭제한 게시글은 복구할 수 없습니다.' : '게시글 작성 시 입력한 숫자 4자리를 입력해주세요.' }}</p>
      <form @submit.prevent="submit"><label>수정용 비밀번호<input v-model="password" type="password" inputmode="numeric" maxlength="4" autocomplete="off" placeholder="숫자 4자리" /></label><p v-if="password && !/^\d{4}$/.test(password)" class="form-error">비밀번호는 숫자 4자리로 입력해주세요.</p><p v-if="error" class="form-error">{{ error }}</p><div class="modal-actions"><button class="button secondary" type="button" @click="emit('close')">{{ mode === 'delete' ? '삭제 취소' : '확인 취소' }}</button><button :class="['button', mode === 'delete' ? 'danger' : 'primary']" type="submit" :disabled="loading || !/^\d{4}$/.test(password)">{{ loading ? '확인 중…' : mode === 'delete' ? '게시글 삭제' : '수정 화면으로' }}</button></div></form>
    </section>
  </div>
</template>
