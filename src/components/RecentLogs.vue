<template>
  <div class="card">
    <div class="card-title">📁 最近记录 ({{ recentLogs.length }})</div>
    <div v-if="recentLogs.length" class="log-list">
      <div v-for="(log, idx) in recentLogs" :key="idx" class="log-item">
        <span class="log-date">{{ shortDate(log.date) }}</span>
        <span class="log-line">[{{ log.line }}]</span>
        <span class="log-output" :title="log.output">{{ log.output }}</span>
        <span class="log-exp">{{ log.overload ? '+1💤' : '+1⭐' }}</span>
      </div>
    </div>
    <div v-else class="empty">还没有打卡记录，开启你的第一次产出吧！</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { shortDate } from '../utils/date.js'

const props = defineProps({
  logs: { type: Array, default: () => [] }
})

// 最近 15 条，倒序
const recentLogs = computed(() => {
  return [...props.logs].reverse().slice(0, 15)
})
</script>
