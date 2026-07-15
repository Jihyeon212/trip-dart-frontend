import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

export const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    { path: '/', component: HomeView },
    { path: '/trip/setup', component: () => import('@/views/TripSetupView.vue') },
    { path: '/trip', component: () => import('@/views/TripView.vue') },
    { path: '/community', component: () => import('@/views/CommunityListView.vue') },
    { path: '/community/new', component: () => import('@/views/CommunityFormView.vue') },
    { path: '/community/:id', component: () => import('@/views/CommunityDetailView.vue') },
    { path: '/community/:id/edit', component: () => import('@/views/CommunityFormView.vue') },
    { path: '/report', component: () => import('@/views/ReportView.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})
