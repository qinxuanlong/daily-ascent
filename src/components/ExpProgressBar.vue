<template>
  <div class="exp-bar-section">
    <!-- 经验与等阶信息行 -->
    <div class="exp-info-row">
      <div class="exp-val-group">
        <span class="star-mark">✦</span>
        <span class="exp-numbers">{{ currentExp }} / {{ maxExp }} EXP</span>
      </div>
      <div class="rank-group">
        <span class="rank-title">冒险等阶</span>
        <span class="rank-badge">Lv.{{ level }}</span>
      </div>
    </div>

    <!-- 极细金色光轨经验条 -->
    <div class="progress-track">
      <div class="progress-fill" :style="{ width: `${progressPercent}%` }">
        <!-- 进度条末端发光圆珠手柄 -->
        <span class="progress-bead" />
      </div>
    </div>

    <!-- 底部装饰标语 -->
    <div class="ornament-sub">
      <span class="ornament-line" />
      <span class="ornament-text">Daily Adventurer Rank</span>
      <span class="ornament-line" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  exp: { type: Number, default: 70 }
})

// 等级与经验计算：每 100 经验升一级
const level = computed(() => Math.floor(props.exp / 100) + 1)
const currentExp = computed(() => props.exp % 100)
const maxExp = 100
const progressPercent = computed(() => Math.min(100, Math.max(0, (currentExp.value / maxExp) * 100)))
</script>

<style scoped>
.exp-bar-section {
  width: 100%;
  max-width: 380px;
  margin: 16px auto 18px;
  padding: 0 4px;
  user-select: none;
}

.exp-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.exp-val-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.star-mark {
  color: #f3d882;
  font-size: 14px;
  filter: drop-shadow(0 0 6px rgba(243, 216, 130, 0.9));
}

.exp-numbers {
  font-size: 13px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.5px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
}

.rank-group {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.rank-title {
  font-size: 12px;
  color: #a4bede;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
}

.rank-badge {
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.5px;
  text-shadow: 0 0 8px rgba(243, 216, 130, 0.5), 0 2px 4px rgba(0, 0, 0, 0.7);
}

/* 纤细金色光轨槽 */
.progress-track {
  position: relative;
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.22);
  border: 1px solid rgba(243, 216, 130, 0.35);
  border-radius: 4px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.4);
}

/* 渐变流光填充 */
.progress-fill {
  position: relative;
  height: 100%;
  background: linear-gradient(90deg, #c79736 0%, #f5d47a 100%);
  border-radius: 3px;
  box-shadow: 0 0 10px rgba(243, 216, 130, 0.75);
  transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 进度头部的发光金色珠球 */
.progress-bead {
  position: absolute;
  right: -4px;
  top: -3px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ffffff;
  border: 1.5px solid #f3d882;
  box-shadow: 0 0 8px #f3d882, 0 0 14px rgba(243, 216, 130, 0.8);
}

/* 底部极细装饰条 */
.ornament-sub {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 6px;
}

.ornament-line {
  height: 1px;
  width: 32px;
  background: linear-gradient(90deg, transparent, rgba(243, 216, 130, 0.5), transparent);
}

.ornament-text {
  font-size: 10px;
  color: #8fa7ca;
  letter-spacing: 1.5px;
  text-transform: capitalize;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
}
</style>
