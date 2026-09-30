<template>
  <div class="card">
    <div class="card-title">📚 技能卡集 ({{ skills.length }})</div>
    <div v-if="skills.length" class="skill-list">
      <div v-for="(s, index) in skills" :key="index" class="skill-item">
        <span class="skill-date">{{ shortDate(s.date) }}</span>
        <span>{{ s.skill }}</span>
      </div>
    </div>
    <div v-else class="empty">还没有技能卡，打卡时填写即可慢慢积累认知资产</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { shortDate } from '../utils/date.js'

const props = defineProps({
  logs: { type: Array, default: () => [] }
})

// 筛选有技能记录的日志，按时间倒序排列
const skills = computed(() => {
  return props.logs
    .filter(l => l && l.skill && l.skill.trim())
    .slice()
    .reverse()
})
</script>
