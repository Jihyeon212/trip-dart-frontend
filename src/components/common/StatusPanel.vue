<script setup lang="ts">
defineProps<{ type?: 'loading' | 'error' | 'empty'; message: string; actionLabel?: string }>()
defineEmits<{ action: [] }>()
</script>

<template>
  <div :class="['status-panel', `status-${type || 'empty'}`]" role="status">
    <span class="status-icon">{{ type === 'loading' ? '◌' : type === 'error' ? '!' : '○' }}</span>
    <p>{{ message }}</p>
    <button v-if="actionLabel" class="button secondary" type="button" @click="$emit('action')">{{ actionLabel }}</button>
  </div>
</template>
