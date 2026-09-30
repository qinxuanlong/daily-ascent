<template>
  <div class="character-container">
    <!-- 角色立绘主体 -->
    <div class="standee-wrapper" @click="$emit('switch-character')">
      <!-- 柔和星光背景辉光 -->
      <div class="character-ambient-glow" />

      <!-- 立绘图片 -->
      <img
        :src="characterSrc"
        alt="角色立绘"
        class="character-img"
        :class="{ 'pulse-anim': isCheckedIn }"
      />

      <!-- 脚下旋转魔法召唤阵 -->
      <div class="summon-circle">
        <svg class="summon-svg" viewBox="0 0 200 200">
          <!-- 外层符文轨道 -->
          <circle cx="100" cy="100" r="92" class="circle-outer" />
          <circle cx="100" cy="100" r="82" class="circle-inner" />
          <!-- 旋转星芒几何阵 -->
          <polygon points="100,18 171,141 29,141" class="star-poly" />
          <polygon points="100,182 171,59 29,59" class="star-poly" />
          <!-- 中心核心光核 -->
          <circle cx="100" cy="100" r="14" class="core-dot" />
        </svg>
      </div>
    </div>

    <!-- 角色名与头衔 -->
    <div class="character-badge" @click="$emit('switch-character')">
      <span class="badge-star">✦</span>
      <span class="badge-title">{{ title }}</span>
      <span class="badge-hint">（点击切换）</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  characterType: { type: String, default: 'aether' },
  customImg: { type: String, default: '' },
  title: { type: String, default: '旅行者' },
  isCheckedIn: { type: Boolean, default: false }
})

defineEmits(['switch-character'])

const characterSrc = computed(() => {
  if (props.characterType === 'custom' && props.customImg) {
    return props.customImg
  }
  if (props.characterType === 'venti') {
    return '/char_venti.png'
  }
  return '/char_aether.png'
})
</script>

<style scoped>
.character-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  margin-top: 6px;
  margin-bottom: 8px;
}

.standee-wrapper {
  position: relative;
  width: 280px;
  height: 290px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  cursor: pointer;
}

/* 柔和的环境光晕 */
.character-ambient-glow {
  position: absolute;
  top: 15%;
  left: 50%;
  transform: translateX(-50%);
  width: 220px;
  height: 220px;
  background: radial-gradient(circle, rgba(230, 190, 90, 0.22) 0%, rgba(56, 189, 248, 0.08) 50%, transparent 70%);
  pointer-events: none;
  filter: blur(24px);
}

/* 角色立绘轻微浮动 */
.character-img {
  position: relative;
  z-index: 2;
  max-width: 230px;
  max-height: 250px;
  object-fit: contain;
  filter: drop-shadow(0 8px 24px rgba(0, 0, 0, 0.5));
  animation: charFloat 4s ease-in-out infinite;
  transition: transform 0.3s ease, filter 0.3s ease;
}

.character-img:hover {
  transform: scale(1.03);
  filter: drop-shadow(0 12px 28px rgba(243, 216, 130, 0.4));
}

@keyframes charFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

/* 魔法召唤法阵 */
.summon-circle {
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%) rotateX(65deg);
  width: 240px;
  height: 240px;
  z-index: 1;
  pointer-events: none;
}

.summon-svg {
  width: 100%;
  height: 100%;
  animation: magicRotate 24s linear infinite;
  filter: drop-shadow(0 0 10px rgba(243, 216, 130, 0.4));
}

@keyframes magicRotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.circle-outer {
  fill: none;
  stroke: rgba(243, 216, 130, 0.55);
  stroke-width: 1.5;
  stroke-dasharray: 8 4;
}

.circle-inner {
  fill: none;
  stroke: rgba(110, 231, 183, 0.4);
  stroke-width: 1.2;
}

.star-poly {
  fill: rgba(243, 216, 130, 0.05);
  stroke: rgba(243, 216, 130, 0.45);
  stroke-width: 1.2;
}

.core-dot {
  fill: rgba(243, 216, 130, 0.8);
  filter: drop-shadow(0 0 6px #f3d882);
}

/* 角色标签 */
.character-badge {
  margin-top: 6px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 14px;
  background: rgba(25, 34, 58, 0.65);
  border: 1px solid rgba(243, 216, 130, 0.3);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  color: #f7f7f8;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.25s ease;
  user-select: none;
}

.character-badge:hover {
  background: rgba(40, 52, 85, 0.8);
  border-color: rgba(243, 216, 130, 0.6);
  transform: translateY(-1px);
}

.badge-star {
  color: #f3d882;
  font-size: 11px;
}

.badge-title {
  font-weight: 500;
  letter-spacing: 0.5px;
}

.badge-hint {
  font-size: 11px;
  color: #9ba8c2;
}
</style>
