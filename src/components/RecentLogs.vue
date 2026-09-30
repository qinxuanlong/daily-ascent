<template>
  <div class="clean-card">
    <div class="card-header">
      <span class="card-title-text">📁 打卡日志</span>
      <span class="tag-badge">{{ recentLogs.length }} 篇</span>
    </div>

    <div v-if="recentLogs.length">
      <div
        v-for="(log, idx) in recentLogs"
        :key="idx"
        class="log-clean-item"
      >
        <div style="display: flex; align-items: center; min-width: 0; flex: 1;">
          <span class="log-clean-date">{{ shortDate(log.date) }}</span>
          <span class="log-clean-text" :title="log.output">{{ log.output }}</span>
        </div>
        <span class="log-clean-tag">{{ log.overload ? '+1💤' : '+1⭐' }}</span>
      </div>
    </div>
    <div v-else style="text-align: center; color: var(--text-dim); font-size: 12px; padding: 12px 0;">
      还没有打卡记录
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { shortDate } from '../utils/date.js'

const props = defineProps({
  logs: { type: Array, default: () => [] }
})

const recentLogs = computed(() => {
  return [...props.logs].reverse().slice(0, 10)
})
</script>
