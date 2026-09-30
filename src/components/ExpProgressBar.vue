<template>
  <div class="exp-bar-container">
    <!-- 顶部状态信息 -->
    <div class="exp-header">
      <div class="exp-left">
        <span class="icon-star">✦</span>
        <span class="exp-text">{{ currentExp }} / {{ maxExp }} EXP</span>
      </div>
      <div class="exp-right">
        <span class="rank-label">冒险等阶</span>
        <span class="rank-val">Lv.{{ level }}</span>
      </div>
    </div>

    <!-- 纤细金色经验槽 -->
    <div class="bar-track">
      <div class="bar-fill" :style="{ width: `${progressPercent}%` }">
        <!-- 进度条头部流光微粒 -->
        <span class="bar-head" />
      </div>
    </div>

    <!-- 底部副标题 -->
    <div class="exp-sub">Daily Adventurer Rank</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  exp: { type: Number, default: 0 }
})

// 等级与经验计算：每 100 经验升一级
const level = computed(() => Math.floor(props.exp / 100) + 1)
const currentExp = computed(() => props.exp % 100)
const maxExp = 100
const progressPercent = computed(() => Math.min(100, Math.max(0, (currentExp.value / maxExp) * 100)))
</script>

<style scoped>
.exp-bar-container {
  width: 100%;
  max-width: 360px;
  margin: 12px auto 16px;
  padding: 0 10px;
  user-select: none;
}

.exp-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  margin-bottom: 6px;
  color: #f7f7f8;
}

.exp-left {
  display: flex;
  align-items: center;
  gap: 5px;
}

.icon-star {
  color: #f3d882;
  font-size: 13px;
  filter: drop-shadow(0 0 4px rgba(243, 216, 130, 0.6));
}

.exp-text {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  color: #eed588;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.exp-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.rank-label {
  font-size: 12px;
  color: #9ba8c2;
}

.rank-val {
  color: #f3d882;
  font-weight: 700;
  font-size: 14px;
}

/* 经典原神风金色极细边框经验条 */
.bar-track {
  position: relative;
  width: 100%;
  height: 6px;
  background: rgba(18, 25, 45, 0.7);
  border: 1px solid rgba(243, 216, 130, 0.45);
  border-radius: 6px;
  overflow: visible;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.6);
}

/* 进度填充 */
.bar-fill {
  position: relative;
  height: 100%;
  background: linear-gradient(90deg, #d4a340 0%, #f3d882 100%);
  border-radius: 4px;
  transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 0 8px rgba(243, 216, 130, 0.7);
}

/* 头部发光小圆点 */
.bar-head {
  position: absolute;
  right: -3px;
  top: -2px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 0 6px #f3d882, 0 0 10px #f3d882;
}

.exp-sub {
  text-align: center;
  font-size: 11px;
  color: rgba(166, 178, 200, 0.5);
  letter-spacing: 1px;
  margin-top: 6px;
}
</style>
