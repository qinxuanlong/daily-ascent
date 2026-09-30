<template>
  <div class="app-header">
    <h1>🎮 每日攀升</h1>
    <div class="subtitle">有产出就是升级 · 断更不清零</div>
    <div class="stats-bar">
      <div class="stat-item">
        <span>⭐</span>
        <span class="stat-value" :class="{ bounce: expBounce }" @animationend="expBounce = false">{{ exp }}</span>
      </div>
      <div class="stat-item">
        <span>🔥</span>
        <span class="stat-value" :class="{ bounce: streakBounce }" @animationend="streakBounce = false">{{ streak }}</span>
      </div>
      <div class="stat-item">
        <span>🏅</span>
        <span class="stat-value">{{ badgeCount }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  exp: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  badgeCount: { type: Number, default: 0 }
})

const expBounce = ref(false)
const streakBounce = ref(false)

// 触发数字弹跳动画
function triggerBounce(type) {
  if (type === 'exp') expBounce.value = true
  if (type === 'streak') streakBounce.value = true
}

defineExpose({ triggerBounce })
</script>
