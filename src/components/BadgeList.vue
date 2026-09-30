<template>
  <div class="card">
    <div class="card-title">🏅 徽章墙 ({{ unlockedCount }}/{{ BADGE_DEFS.length }})</div>
    <div class="badge-grid">
      <div
        v-for="b in BADGE_DEFS"
        :key="b.id"
        class="badge-item"
        :class="badges.includes(b.id) ? 'unlocked' : 'locked'"
        :title="b.desc"
      >
        <span class="badge-icon">{{ b.icon }}</span>
        <span class="badge-name">{{ b.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { BADGE_DEFS } from '../utils/badges.js'

const props = defineProps({
  badges: { type: Array, default: () => [] }
})

const unlockedCount = computed(() => {
  return BADGE_DEFS.filter(b => props.badges.includes(b.id)).length
})
</script>
