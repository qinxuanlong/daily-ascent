<template>
  <div class="clean-card">
    <div class="card-header">
      <span class="card-title-text">📚 技能卡集</span>
      <span class="tag-badge">{{ skills.length }} 条积累</span>
    </div>

    <div v-if="skills.length" style="display: flex; flex-direction: column; gap: 8px;">
      <div
        v-for="(s, idx) in skills"
        :key="idx"
        style="padding: 8px 12px; background: rgba(0,0,0,0.2); border-radius: var(--radius-sm); font-size: 13px; display: flex; gap: 8px;"
      >
        <span style="color: var(--text-dim); white-space: nowrap;">{{ shortDate(s.date) }}</span>
        <span style="color: var(--text-main);">{{ s.skill }}</span>
      </div>
    </div>
    <div v-else style="text-align: center; color: var(--text-dim); font-size: 12px; padding: 12px 0;">
      打卡时记录领悟，逐步建立认知资产
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { shortDate } from '../utils/date.js'

const props = defineProps({
  logs: { type: Array, default: () => [] }
})

const skills = computed(() => {
  return props.logs
    .filter(l => l && l.skill && l.skill.trim())
    .slice()
    .reverse()
})
</script>
