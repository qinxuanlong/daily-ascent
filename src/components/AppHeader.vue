<template>
  <div class="header-wrap">
    <div class="header-title">
      <span>🎮 每日攀升</span>
    </div>
    <div class="header-sub">有产出就是升级 · 断更不清零</div>
    <div class="stats-capsule">
      <div class="stat-pill">
        <span>⭐</span>
        <span class="stat-num" :class="{ bounce: expBounce }" @animationend="expBounce = false">{{ exp }}</span>
      </div>
      <div class="stat-pill">
        <span>🔥</span>
        <span class="stat-num" :class="{ bounce: streakBounce }" @animationend="streakBounce = false">{{ streak }}</span>
      </div>
      <div class="stat-pill">
        <span>🏅</span>
        <span class="stat-num">{{ badgeCount }}</span>
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

function triggerBounce(type) {
  if (type === 'exp') expBounce.value = true
  if (type === 'streak') streakBounce.value = true
}

defineExpose({ triggerBounce })
</script>
