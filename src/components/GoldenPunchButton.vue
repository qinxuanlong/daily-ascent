<template>
  <div class="astrolabe-punch-container">
    <!-- 祈愿星轨大仪盘主体 -->
    <div class="dial-wrapper">
      <!-- 外部同心圆星轨与四角星芒饰件 -->
      <svg class="dial-celestial-svg" viewBox="0 0 240 240">
        <!-- 最外层极细金色轮圈 -->
        <circle cx="120" cy="120" r="108" class="ring-outer" />
        <!-- 虚线星轨轮 -->
        <circle cx="120" cy="120" r="98" class="ring-orbit" />
        <!-- 内层强化金环 -->
        <circle cx="120" cy="120" r="88" class="ring-inner" />

        <!-- 顶部主星芒饰点 -->
        <g class="ornament top-crest">
          <polygon points="120,4 123,14 133,17 123,20 120,30 117,20 107,17 117,14" class="crest-star" />
          <circle cx="120" cy="17" r="2.5" class="crest-dot" />
        </g>

        <!-- 底部下坠星芒饰点 -->
        <g class="ornament bottom-crest">
          <polygon points="120,236 122.5,228 130,225 122.5,222 120,214 117.5,222 110,225 117.5,228" class="crest-star" />
          <circle cx="120" cy="225" r="2" class="crest-dot" />
        </g>

        <!-- 左侧翼星 -->
        <g class="ornament left-wing">
          <polygon points="12,120 20,122.5 23,130 26,122.5 34,120 26,117.5 23,110 20,117.5" class="crest-star" />
        </g>

        <!-- 右侧翼星 -->
        <g class="ornament right-wing">
          <polygon points="228,120 220,122.5 217,130 214,122.5 206,120 214,117.5 217,110 220,117.5" class="crest-star" />
        </g>

        <!-- 星轨刻度点 -->
        <g class="orbit-dots">
          <circle cx="58" cy="58" r="1.5" />
          <circle cx="182" cy="58" r="1.5" />
          <circle cx="58" cy="182" r="1.5" />
          <circle cx="182" cy="182" r="1.5" />
        </g>
      </svg>

      <!-- 核心深邃星空玻璃打卡圆盘 -->
      <button
        class="core-dial-btn"
        :class="{ 'is-checked': isCheckedIn, 'pressing': isPressing }"
        :disabled="isCheckedIn"
        @mousedown="isPressing = true"
        @mouseup="isPressing = false"
        @mouseleave="isPressing = false"
        @click="handleClick"
      >
        <!-- 内部星芒与文字 -->
        <div class="btn-content">
          <span class="btn-top-star">✦</span>
          <span class="btn-title">{{ isCheckedIn ? '今日已打卡' : '立即打卡' }}</span>
          <span class="btn-subtitle">
            <span class="sub-dot">✦</span>
            {{ isCheckedIn ? '已连续' : '开启今日' }}
            <span class="sub-dot">✦</span>
          </span>
        </div>
      </button>

      <!-- 点击打卡飘升经验动画 -->
      <transition-group name="float-exp">
        <div
          v-for="item in floatingExps"
          :key="item.id"
          class="floating-exp-text"
        >
          +50 EXP ✦
        </div>
      </transition-group>
    </div>

    <!-- 粒子爆发展示 -->
    <div v-if="showBurst" class="burst-layer">
      <span v-for="n in 14" :key="n" :class="`sparkle-particle p-${n}`">✦</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  isCheckedIn: { type: Boolean, default: false }
})

const emit = defineEmits(['checkin'])

const isPressing = ref(false)
const showBurst = ref(false)
const floatingExps = ref([])

function handleClick() {
  if (props.isCheckedIn) return

  // 激发粒子与经验飘字
  showBurst.value = true
  setTimeout(() => {
    showBurst.value = false
  }, 1000)

  const expId = Date.now()
  floatingExps.value.push({ id: expId })
  setTimeout(() => {
    floatingExps.value = floatingExps.value.filter(item => item.id !== expId)
  }, 1300)

  emit('checkin')
}
</script>

<style scoped>
.astrolabe-punch-container {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  margin: 18px 0 28px;
}

.dial-wrapper {
  position: relative;
  width: 190px;
  height: 190px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 外部金色天球仪星轨 SVG */
.dial-celestial-svg {
  position: absolute;
  inset: -15px;
  width: 220px;
  height: 220px;
  pointer-events: none;
  filter: drop-shadow(0 0 10px rgba(243, 216, 130, 0.5));
}

.ring-outer {
  fill: none;
  stroke: rgba(243, 216, 130, 0.45);
  stroke-width: 1.2;
}

.ring-orbit {
  fill: none;
  stroke: rgba(243, 216, 130, 0.65);
  stroke-width: 1.5;
  stroke-dasharray: 6 5;
  animation: orbitRotate 45s linear infinite;
  transform-origin: 120px 120px;
}

.ring-inner {
  fill: none;
  stroke: rgba(243, 216, 130, 0.75);
  stroke-width: 1.5;
}

@keyframes orbitRotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.crest-star {
  fill: #f5d47a;
  filter: drop-shadow(0 0 5px #f3d882);
}

.crest-dot {
  fill: #ffffff;
  filter: drop-shadow(0 0 4px #ffffff);
}

.orbit-dots circle {
  fill: #f3d882;
  filter: drop-shadow(0 0 3px #f3d882);
}

/* 核心深邃蓝金打卡按钮 */
.core-dial-btn {
  width: 128px;
  height: 128px;
  border-radius: 50%;
  background: radial-gradient(circle at 45% 35%, #254070 0%, #142446 65%, #0a1329 100%);
  border: 1.5px solid rgba(243, 216, 130, 0.85);
  box-shadow:
    0 0 24px rgba(243, 216, 130, 0.4),
    inset 0 0 18px rgba(243, 216, 130, 0.22),
    inset 0 2px 4px rgba(255, 255, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  outline: none;
  user-select: none;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  animation: dialGlow 3.5s ease-in-out infinite;
}

@keyframes dialGlow {
  0%, 100% {
    box-shadow:
      0 0 18px rgba(243, 216, 130, 0.35),
      inset 0 0 14px rgba(243, 216, 130, 0.2);
    transform: scale(1);
  }
  50% {
    box-shadow:
      0 0 30px rgba(243, 216, 130, 0.65),
      inset 0 0 20px rgba(243, 216, 130, 0.35);
    transform: scale(1.02);
  }
}

.core-dial-btn:hover:not(:disabled) {
  transform: scale(1.04);
  box-shadow:
    0 0 36px rgba(243, 216, 130, 0.85),
    inset 0 0 22px rgba(243, 216, 130, 0.4);
  border-color: #fff0bd;
}

.core-dial-btn.pressing:not(:disabled) {
  transform: scale(0.96);
}

/* 已打卡状态 */
.core-dial-btn.is-checked {
  cursor: default;
  animation: none;
  background: radial-gradient(circle at 45% 35%, #1a2f55 0%, #101c38 65%, #070e1f 100%);
  border-color: rgba(243, 216, 130, 0.6);
  box-shadow:
    0 0 16px rgba(243, 216, 130, 0.25),
    inset 0 0 12px rgba(243, 216, 130, 0.15);
}

.btn-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.btn-top-star {
  color: #f3d882;
  font-size: 13px;
  line-height: 1;
  filter: drop-shadow(0 0 5px rgba(243, 216, 130, 0.9));
  margin-bottom: 2px;
}

.btn-title {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 1px;
  text-shadow: 0 0 10px rgba(243, 216, 130, 0.6), 0 2px 4px rgba(0, 0, 0, 0.8);
  font-family: "Source Han Serif CN", Georgia, serif, sans-serif;
}

.btn-subtitle {
  font-size: 10px;
  color: #f3d882;
  margin-top: 3px;
  letter-spacing: 1.5px;
  display: flex;
  align-items: center;
  gap: 3px;
  opacity: 0.9;
}

.sub-dot {
  font-size: 8px;
}

/* 飘升经验数值动画 */
.floating-exp-text {
  position: absolute;
  top: 10px;
  color: #fff0bd;
  font-size: 18px;
  font-weight: 800;
  text-shadow: 0 0 10px #f3d882, 0 2px 6px rgba(0, 0, 0, 0.9);
  pointer-events: none;
  z-index: 20;
  animation: floatUp 1.25s forwards cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes floatUp {
  0% {
    opacity: 0;
    transform: translateY(12px) scale(0.85);
  }
  20% {
    opacity: 1;
    transform: translateY(-22px) scale(1.15);
  }
  100% {
    opacity: 0;
    transform: translateY(-70px) scale(1);
  }
}

/* 粒子爆发展示 */
.burst-layer {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  pointer-events: none;
  z-index: 15;
}

.sparkle-particle {
  position: absolute;
  color: #fff0bd;
  font-size: 13px;
  filter: drop-shadow(0 0 6px #f3d882);
  animation: burstParticle 0.9s forwards ease-out;
}

@keyframes burstParticle {
  0% {
    transform: translate(0, 0) scale(0.6);
    opacity: 1;
  }
  100% {
    transform: translate(var(--tx), var(--ty)) scale(1.3);
    opacity: 0;
  }
}

.p-1 { --tx: 75px; --ty: 0px; }
.p-2 { --tx: 55px; --ty: 55px; }
.p-3 { --tx: 0px; --ty: 75px; }
.p-4 { --tx: -55px; --ty: 55px; }
.p-5 { --tx: -75px; --ty: 0px; }
.p-6 { --tx: -55px; --ty: -55px; }
.p-7 { --tx: 0px; --ty: -75px; }
.p-8 { --tx: 55px; --ty: -55px; }
.p-9 { --tx: 90px; --ty: 35px; }
.p-10 { --tx: -90px; --ty: 35px; }
.p-11 { --tx: 35px; --ty: -90px; }
.p-12 { --tx: -35px; --ty: -90px; }
.p-13 { --tx: 90px; --ty: -35px; }
.p-14 { --tx: -90px; --ty: -35px; }
</style>
