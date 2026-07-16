<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { postsApi } from '@/api/posts'
import { POST_TYPE_LABELS } from '@/constants'
import { useTrip } from '@/composables/useTrip'
import type { PostPayload, PostType } from '@/types'

const route = useRoute(); const router = useRouter(); const { state } = useTrip()
const id = computed(() => Number(route.params.id || 0)); const editing = computed(() => Boolean(id.value))
const form = reactive<PostPayload>({ post_type: 'local_info', title: '', content: '', nickname: '', password: '', route_data: null })
const errors = reactive<Record<string, string>>({}); const loading = ref(false); const pageError = ref('')
const postTypes = Object.keys(POST_TYPE_LABELS) as PostType[]

function fillRoute() {
  if (route.query.source === 'route' && state.selectedLocations.length) {
    form.post_type = 'random_course'; form.title = '광주에서 다트로 정한 오늘의 여행'
    form.content = state.selectedLocations.map((item, index) => `${index + 1}. ${item.title}`).join('\n'); form.route_data = state.selectedLocations
  } else if (route.query.source === 'report' && state.generatedReport) {
    const report = state.generatedReport; form.post_type = 'travel_review'; form.title = report.title
    form.content = [report.summary, ...report.timeline.map((item) => `${item.time ? `${item.time} ` : ''}${item.place}${item.description ? ` — ${item.description}` : ''}`), report.overallReview].filter(Boolean).join('\n\n')
    form.route_data = [{ data_type: 'generated_report', version: 1, report, locations: state.selectedLocations.filter((item) => state.visited[item.contentid]) }]
  }
}
function validate() {
  Object.keys(errors).forEach((key) => delete errors[key])
  if (!postTypes.includes(form.post_type)) errors.post_type = '게시글 유형을 선택해주세요.'
  if (!form.nickname.trim() || form.nickname.trim().length > 20) errors.nickname = '닉네임은 1~20자로 입력해주세요.'
  if (!form.title.trim() || form.title.trim().length > 100) errors.title = '제목은 1~100자로 입력해주세요.'
  if (!form.content.trim() || form.content.trim().length > 3000) errors.content = '내용은 1~3,000자로 입력해주세요.'
  if (!/^\d{4}$/.test(form.password)) errors.password = '비밀번호는 숫자 4자리로 입력해주세요.'
  return !Object.keys(errors).length
}
async function submit() {
  if (!validate()) return
  loading.value = true; pageError.value = ''
  try { const payload = { ...form, nickname: form.nickname.trim(), title: form.title.trim(), content: form.content.trim() }; const saved = editing.value ? await postsApi.update(id.value, payload) : await postsApi.create(payload); sessionStorage.removeItem(`post-edit-password:${id.value}`); router.push(`/community/${saved.id}`) }
  catch (err) { pageError.value = err instanceof Error ? err.message : '게시글을 저장하지 못했습니다.' }
  finally { loading.value = false }
}
onMounted(async () => {
  if (!editing.value) { fillRoute(); return }
  const password = sessionStorage.getItem(`post-edit-password:${id.value}`)
  if (!password) { router.replace(`/community/${id.value}`); return }
  try { const post = await postsApi.detail(id.value); Object.assign(form, { post_type: post.post_type, title: post.title, content: post.content, nickname: post.nickname, password, route_data: post.route_data }) }
  catch (err) { pageError.value = err instanceof Error ? err.message : '게시글을 불러오지 못했습니다.' }
})
</script>

<template>
  <div class="page container form-page"><div class="page-heading"><span class="eyebrow">WRITE A STORY</span><h1>{{ editing ? '게시글 수정' : '새 게시글 작성' }}</h1><p>로그인 없이 작성할 수 있으며, 숫자 4자리 비밀번호로 수정·삭제합니다.</p></div>
    <form class="post-form" @submit.prevent="submit"><fieldset><legend>게시글 유형</legend><div class="type-options"><label v-for="type in postTypes" :key="type" :class="{ selected: form.post_type === type }"><input v-model="form.post_type" type="radio" :value="type" />{{ POST_TYPE_LABELS[type] }}</label></div><p v-if="errors.post_type" class="form-error">{{ errors.post_type }}</p></fieldset>
      <label>닉네임 <span>필수 · 최대 20자</span><input v-model="form.nickname" maxlength="20" :aria-invalid="Boolean(errors.nickname)" placeholder="커뮤니티에 표시될 이름" /><small>{{ form.nickname.length }} / 20</small><i v-if="errors.nickname" class="form-error">{{ errors.nickname }}</i></label>
      <label>제목 <span>필수 · 최대 100자</span><input v-model="form.title" maxlength="100" :aria-invalid="Boolean(errors.title)" placeholder="여행 이야기의 제목" /><small>{{ form.title.length }} / 100</small><i v-if="errors.title" class="form-error">{{ errors.title }}</i></label>
      <label>내용 <span>필수 · 최대 3,000자</span><textarea v-model="form.content" maxlength="3000" rows="12" :aria-invalid="Boolean(errors.content)" placeholder="광주에서 발견한 장소와 경험을 들려주세요."></textarea><small>{{ form.content.length }} / 3,000</small><i v-if="errors.content" class="form-error">{{ errors.content }}</i></label>
      <label>수정용 비밀번호 <span>{{ editing ? '변경할 수 없음' : '필수 · 숫자 4자리' }}</span><input v-model="form.password" type="password" inputmode="numeric" maxlength="4" :readonly="editing" autocomplete="new-password" :aria-invalid="Boolean(errors.password)" placeholder="● ● ● ●" /><i v-if="errors.password" class="form-error">{{ errors.password }}</i><em>교육 목적의 익명 게시판입니다. 실제 서비스에서는 평문 비밀번호 저장 방식을 사용하지 않아야 합니다.</em></label>
      <p v-if="pageError" class="form-error callout">{{ pageError }}</p><div class="form-actions"><button class="button secondary" type="button" @click="router.back()">작성 취소</button><button class="button primary" type="submit" :disabled="loading">{{ loading ? '게시글 저장 중…' : editing ? '게시글 수정 완료' : '게시글 등록하기' }}</button></div>
    </form>
  </div>
</template>
