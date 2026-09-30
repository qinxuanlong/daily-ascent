<template>
  <div class="character-section">
    <!-- 角色立绘展示区 -->
    <div class="standee-stage" @click="$emit('switch-character')">
      <!-- 柔和风元素环绕光晕 -->
      <div class="anemo-aura" />

      <!-- 水面倒影 -->
      <div class="water-reflection-wrapper">
        <img
          :src="characterSrc"
          alt="倒影"
          class="character-reflection"
        />
      </div>

      <!-- 水面同心圆涟漪 -->
      <div class="water-ripples">
        <span class="ripple r-1" />
        <span class="ripple r-2" />
        <span class="ripple r-3" />
      </div>

      <!-- 立绘主体图片 -->
      <img
        :src="characterSrc"
        :alt="title"
        class="character-standee-img"
        :class="{ 'glow-active': isCheckedIn }"
      />

      <!-- 风晶蝶与漂浮星芒 -->
      <div class="crystalfly-sparkles">
        <span class="sparkle-dot sp-1">✦</span>
        <span class="sparkle-dot sp-2">✦</span>
        <span class="sparkle-dot sp-3">✦</span>
      </div>

      <!-- 角色名与属性标签（位于角色右上方） -->
      <div class="character-info-plate" title="点击切换角色">
        <div class="info-name-row">
          <span class="element-star">✦</span>
          <span class="info-name">{{ title }}</span>
        </div>
        <div class="info-stars">★★★★★</div>
        <div class="info-detail">Lv.{{ level }} · {{ elementText }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  characterType: { type: String, default: 'venti' },
  customImg: { type: String, default: '' },
  title: { type: String, default: '温迪' },
  level: { type: Number, default: 12 },
  isCheckedIn: { type: Boolean, default: false }
})

defineEmits(['switch-character'])

// 角色元素属性文本
const elementText = computed(() => {
  if (props.characterType === 'venti') return '风元素'
  if (props.characterType === 'aether') return '风元素'
  return '神秘元素'
})

// 立绘图片源
const characterSrc = computed(() => {
  if (props.characterType === 'custom' && props.customImg) {
    return props.customImg
  }
  const base = import.meta.env.BASE_URL || './'
  if (props.characterType === 'aether') {
    return `${base}char_aether.png`
  }
  return `${base}char_venti.png`
})
</script>

<style scoped>
.character-section {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: clamp(40px, 7vh, 68px);
  margin-bottom: 10px;
  user-select: none;
}

.standee-stage {
  position: relative;
  width: 100%;
  height: 285px;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  cursor: pointer;
}

/* 环绕背部柔和蓝绿光芒 */
.anemo-aura {
  position: absolute;
  top: 15%;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(94, 234, 212, 0.28) 0%, rgba(56, 189, 248, 0.12) 45%, transparent 70%);
  filter: blur(28px);
  pointer-events: none;
}

/* 立绘主体 */
.character-standee-img {
  position: relative;
  z-index: 3;
  height: 255px;
  max-width: 240px;
  object-fit: contain;
  filter: drop-shadow(0 6px 18px rgba(5, 12, 28, 0.45));
  animation: gentleFloat 4.5s ease-in-out infinite;
  transition: transform 0.3s ease, filter 0.3s ease;
}

.standee-stage:hover .character-standee-img {
  transform: scale(1.03) translateY(-3px);
  filter: drop-shadow(0 10px 24px rgba(94, 234, 212, 0.4));
}

@keyframes gentleFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}

/* 水面水镜倒影 */
.water-reflection-wrapper {
  position: absolute;
  bottom: -22px;
  left: 50%;
  transform: translateX(-50%) scaleY(-0.35);
  height: 180px;
  opacity: 0.32;
  filter: blur(2.5px);
  mask-image: linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, transparent 80%);
  -webkit-mask-image: linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, transparent 80%);
  pointer-events: none;
  z-index: 1;
}

.character-reflection {
  height: 100%;
  object-fit: contain;
}

/* 水面同心圆涟漪 */
.water-ripples {
  position: absolute;
  bottom: 0px;
  left: 50%;
  transform: translateX(-50%) rotateX(72deg);
  width: 240px;
  height: 240px;
  pointer-events: none;
  z-index: 2;
}

.ripple {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.55);
  box-shadow: 0 0 10px rgba(94, 234, 212, 0.35);
  animation: rippleExpand 4s cubic-bezier(0.25, 0.8, 0.25, 1) infinite;
  opacity: 0;
}

.r-2 {
  animation-delay: 1.3s;
}

.r-3 {
  animation-delay: 2.6s;
}

@keyframes rippleExpand {
  0% {
    transform: scale(0.35);
    opacity: 0.85;
  }
  50% {
    opacity: 0.45;
  }
  100% {
    transform: scale(1.15);
    opacity: 0;
  }
}

/* 角色名与属性标签 */
.character-info-plate {
  position: absolute;
  top: 28px;
  right: 18px;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  pointer-events: auto;
  transition: transform 0.2s ease;
}

.standee-stage:hover .character-info-plate {
  transform: translateY(-2px);
}

.info-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.element-star {
  color: #5eead4;
  font-size: 16px;
  filter: drop-shadow(0 0 6px rgba(94, 234, 212, 0.8));
}

.info-name {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 1px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
  font-family: "Source Han Serif CN", Georgia, serif, sans-serif;
}

.info-stars {
  color: #f3d882;
  font-size: 13px;
  letter-spacing: 2px;
  margin-top: 2px;
  filter: drop-shadow(0 0 5px rgba(243, 216, 130, 0.6));
}

.info-detail {
  font-size: 12px;
  color: #cbdcf7;
  margin-top: 3px;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.7);
  letter-spacing: 0.5px;
}

/* 漂浮微粒 */
.crystalfly-sparkles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 4;
}

.sparkle-dot {
  position: absolute;
  color: #5eead4;
  font-size: 11px;
  filter: drop-shadow(0 0 6px #5eead4);
  animation: sparkleTwinkle 3s ease-in-out infinite;
}

.sp-1 {
  top: 25%;
  left: 28%;
  animation-delay: 0.2s;
}

.sp-2 {
  top: 40%;
  right: 32%;
  animation-delay: 1.2s;
}

.sp-3 {
  top: 65%;
  left: 32%;
  animation-delay: 2.2s;
}

@keyframes sparkleTwinkle {
  0%, 100% {
    opacity: 0.2;
    transform: translateY(0) scale(0.8);
  }
  50% {
    opacity: 0.9;
    transform: translateY(-8px) scale(1.15);
  }
}
</style>
