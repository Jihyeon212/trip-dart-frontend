<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { postsApi } from '@/api/posts'
import { POST_TYPE_LABELS } from '@/constants'
import type { Location, Post, PostRouteData, SharedReportData } from '@/types'
import StatusPanel from '@/components/common/StatusPanel.vue'
import PasswordModal from '@/components/community/PasswordModal.vue'
import ReportReceipt from '@/components/report/ReportReceipt.vue'

const route = useRoute(); const router = useRouter(); const post = ref<Post | null>(null); const loading = ref(true); const error = ref('')
const modal = ref<'edit' | 'delete' | null>(null); const modalLoading = ref(false); const modalError = ref('')
async function load() { loading.value = true; error.value = ''; try { post.value = await postsApi.detail(Number(route.params.id)) } catch (err) { error.value = err instanceof Error ? err.message : '게시글을 불러오지 못했습니다.' } finally { loading.value = false } }
function parsedRouteData(): PostRouteData {
  if (!post.value?.route_data) return []
  if (Array.isArray(post.value.route_data)) return post.value.route_data
  try { return JSON.parse(post.value.route_data) as PostRouteData } catch { return [] }
}
function isSharedReport(item: Location | SharedReportData): item is SharedReportData { return 'data_type' in item && item.data_type === 'generated_report' }
const sharedReport = computed(() => parsedRouteData().find(isSharedReport) || null)
const routeData = computed(() => parsedRouteData().filter((item): item is Location => !isSharedReport(item)))
async function passwordSubmit(password: string) {
  if (!post.value || !modal.value) return
  modalLoading.value = true; modalError.value = ''
  try {
    if (modal.value === 'edit') { const result = await postsApi.verify(post.value.id, password); if (!result.valid) throw new Error('비밀번호가 일치하지 않습니다.'); sessionStorage.setItem(`post-edit-password:${post.value.id}`, password); router.push(`/community/${post.value.id}/edit`) }
    else { await postsApi.remove(post.value.id, password); router.push('/community') }
  } catch (err) { modalError.value = err instanceof Error ? err.message : '비밀번호가 일치하지 않습니다.' }
  finally { modalLoading.value = false }
}
onMounted(load)
</script>

<template>
  <div class="page container detail-page"><StatusPanel v-if="loading" type="loading" message="게시글을 불러오고 있어요." /><StatusPanel v-else-if="error" type="error" :message="error" action-label="게시글 다시 불러오기" @action="load" />
    <article v-else-if="post" class="post-detail"><header><span :class="['post-badge', post.post_type]">{{ POST_TYPE_LABELS[post.post_type] }}</span><h1>{{ post.title }}</h1><div><span>{{ post.nickname }}</span><time>{{ new Date(post.created_at).toLocaleString('ko-KR') }}</time></div></header><div v-if="sharedReport" class="shared-report"><ReportReceipt :report="sharedReport.report" /></div><div v-else class="post-content">{{ post.content }}</div><section v-if="routeData.length" class="shared-route"><h2>함께 공유된 여행 코스</h2><ol><li v-for="location in routeData" :key="location.contentid"><span>{{ location.categoryLabel }}</span><strong>{{ location.title }}</strong><small>{{ location.address }}</small></li></ol></section><footer><RouterLink to="/community" class="button secondary">커뮤니티 목록으로</RouterLink><div><button class="button ghost" type="button" @click="modal = 'edit'; modalError = ''">게시글 수정</button><button class="button danger-outline" type="button" @click="modal = 'delete'; modalError = ''">게시글 삭제</button></div></footer></article>
    <PasswordModal :open="Boolean(modal)" :mode="modal || 'edit'" :loading="modalLoading" :error="modalError" @close="modal = null" @submit="passwordSubmit" />
  </div>
</template>
