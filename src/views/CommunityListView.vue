<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { postsApi } from '@/api/posts'
import { POST_TYPE_LABELS } from '@/constants'
import type { PaginatedPosts, Post } from '@/types'
import StatusPanel from '@/components/common/StatusPanel.vue'

const posts = ref<Post[]>([])
const keyword = ref('')
const activeKeyword = ref('')
const page = ref(1)
const totalPages = ref(1)
const loading = ref(true)
const error = ref('')
function normalize(response: PaginatedPosts | Post[]) {
  if (Array.isArray(response)) return { items: response, pages: 1 }
  return { items: response.items || [], pages: response.total_pages || Math.max(1, Math.ceil(response.total / 10)) }
}
async function load() {
  loading.value = true; error.value = ''
  try { const result = normalize(await postsApi.list(page.value, activeKeyword.value)); posts.value = result.items; totalPages.value = result.pages }
  catch (err) { error.value = err instanceof Error ? err.message : '게시글을 불러오지 못했습니다.'; posts.value = [] }
  finally { loading.value = false }
}
function search() { activeKeyword.value = keyword.value.trim(); page.value = 1; load() }
function go(next: number) { if (next < 1 || next > totalPages.value) return; page.value = next; load() }
onMounted(load)
</script>

<template>
  <div class="page container community-page">
    <div class="page-heading community-heading"><div><span class="eyebrow">TRAVEL STORIES</span><h1>커뮤니티</h1><p>광주의 랜덤 코스와 여행 이야기를 익명으로 나눠보세요.</p></div><RouterLink to="/community/new" class="button primary">새 게시글 작성하기</RouterLink></div>
    <form class="search-bar" @submit.prevent="search"><label class="sr-only" for="post-search">제목과 내용 검색</label><input id="post-search" v-model="keyword" placeholder="제목과 내용으로 검색" /><button class="button primary" type="submit">게시글 검색</button></form>
    <StatusPanel v-if="loading" type="loading" message="게시글을 불러오고 있어요." />
    <StatusPanel v-else-if="error" type="error" :message="error" action-label="게시글 다시 불러오기" @action="load" />
    <template v-else-if="posts.length">
      <div class="post-table" role="table"><div class="post-row header" role="row"><span>번호</span><span>유형</span><span>제목</span><span>작성일</span></div><RouterLink v-for="post in posts" :key="post.id" :to="`/community/${post.id}`" class="post-row" role="row"><span class="post-number">{{ post.id }}</span><span><b :class="['post-badge', post.post_type]">{{ POST_TYPE_LABELS[post.post_type] }}</b></span><strong>{{ post.title }}</strong><time>{{ new Date(post.created_at).toLocaleDateString('ko-KR') }}</time></RouterLink></div>
      <nav class="pagination" aria-label="게시글 페이지"><button type="button" :disabled="page === 1" @click="go(page - 1)">← 이전 페이지</button><span>{{ page }} / {{ totalPages }}</span><button type="button" :disabled="page === totalPages" @click="go(page + 1)">다음 페이지 →</button></nav>
    </template>
    <StatusPanel v-else type="empty" :message="activeKeyword ? '검색 조건에 맞는 게시글이 없습니다.' : '등록된 게시글이 없습니다. 첫 번째 지역 정보를 공유해보세요.'" action-label="새 게시글 작성하기" @action="$router.push('/community/new')" />
  </div>
</template>
