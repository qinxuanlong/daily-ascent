<template>
  <div class="clean-card">
    <div class="card-header">
      <span class="card-title-text">🏅 成就徽章</span>
      <span class="tag-badge">{{ unlockedCount }}/{{ BADGE_DEFS.length }}</span>
    </div>

    <div class="badge-clean-grid">
      <div
        v-for="b in BADGE_DEFS"
        :key="b.id"
        class="badge-clean-box"
        :class="badges.includes(b.id) ? 'unlocked' : 'locked'"
        :title="b.desc"
      >
        <div class="badge-clean-icon">{{ b.icon }}</div>
        <div class="badge-clean-name">{{ b.name }}</div>
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
