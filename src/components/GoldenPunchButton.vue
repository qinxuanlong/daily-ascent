<template>
  <div class="punch-button-area">
    <!-- 外层旋转日曜光轮与主体按钮 -->
    <div class="sun-wheel-wrapper">
      <!-- 慢速旋转的原神风太阳符文轮 -->
      <svg class="sun-wheel-svg" :class="{ 'spin-active': !isCheckedIn }" viewBox="0 0 200 200">
        <!-- 外部虚线星轨 -->
        <circle cx="100" cy="100" r="94" class="wheel-track" />
        <!-- 12 芒星形装饰齿 / 符文点 -->
        <g class="wheel-spikes">
          <circle cx="100" cy="8" r="3" />
          <circle cx="100" cy="192" r="3" />
          <circle cx="8" cy="100" r="3" />
          <circle cx="192" cy="100" r="3" />
          <circle cx="35" cy="35" r="2.5" />
          <circle cx="165" cy="165" r="2.5" />
          <circle cx="35" cy="165" r="2.5" />
          <circle cx="165" cy="35" r="2.5" />
        </g>
        <!-- 内层装饰轮圈 -->
        <circle cx="100" cy="100" r="82" class="wheel-inner-ring" />
      </svg>

      <!-- 核心大圆打卡按钮 -->
      <button
        class="core-circle-btn"
        :class="{ 'checked-done': isCheckedIn, 'pressing': isPressing }"
        :disabled="isCheckedIn"
        @mousedown="isPressing = true"
        @mouseup="isPressing = false"
        @mouseleave="isPressing = false"
        @click="handleClick"
      >
        <!-- 按钮内部温润金光 -->
        <div class="btn-inner-glow" />

        <!-- 文本内容 -->
        <div class="btn-text-wrap">
          <span class="btn-main-text">{{ isCheckedIn ? '今日已打卡' : '打卡' }}</span>
          <span class="btn-sub-text">{{ isCheckedIn ? '✦ 已达成 ✦' : 'PUNCH IN' }}</span>
        </div>
      </button>

      <!-- 点击时向上飘起的经验提示 -->
      <transition-group name="float-exp">
        <div
          v-for="item in floatingExps"
          :key="item.id"
          class="floating-exp-tag"
        >
          +50 EXP ✦
        </div>
      </transition-group>
    </div>

    <!-- 粒子爆发展示容器 -->
    <div v-if="showBurst" class="particle-burst">
      <span v-for="n in 12" :key="n" :class="`sparkle s-${n}`">✦</span>
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

  // 触发粒子与飘字动效
  showBurst.value = true
  setTimeout(() => {
    showBurst.value = false
  }, 1000)

  const expId = Date.now()
  floatingExps.value.push({ id: expId })
  setTimeout(() => {
    floatingExps.value = floatingExps.value.filter(item => item.id !== expId)
  }, 1200)

  // 触发打卡事件
  emit('checkin')
}
</script>

<style scoped>
.punch-button-area {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  margin: 18px 0 24px;
}

.sun-wheel-wrapper {
  position: relative;
  width: 170px;
  height: 170px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 旋转外轮 */
.sun-wheel-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  filter: drop-shadow(0 0 10px rgba(243, 216, 130, 0.45));
}

.sun-wheel-svg.spin-active {
  animation: wheelSpin 30s linear infinite;
}

@keyframes wheelSpin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.wheel-track {
  fill: none;
  stroke: rgba(243, 216, 130, 0.6);
  stroke-width: 1.5;
  stroke-dasharray: 6 5;
}

.wheel-inner-ring {
  fill: none;
  stroke: rgba(243, 216, 130, 0.35);
  stroke-width: 1;
}

.wheel-spikes circle {
  fill: #f3d882;
  filter: drop-shadow(0 0 4px #f3d882);
}

/* 核心金色大圆按钮 */
.core-circle-btn {
  width: 124px;
  height: 124px;
  border-radius: 50%;
  border: 2px solid rgba(255, 245, 210, 0.85);
  background: radial-gradient(circle at 35% 30%, #fff1b8 0%, #e5b94f 45%, #b67d1d 90%, #875709 100%);
  box-shadow:
    0 0 22px rgba(243, 216, 130, 0.5),
    inset 0 2px 6px rgba(255, 255, 255, 0.7),
    inset 0 -4px 8px rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  outline: none;
  user-select: none;
  animation: btnBreathe 3.5s ease-in-out infinite;
}

@keyframes btnBreathe {
  0%, 100% {
    box-shadow: 0 0 18px rgba(243, 216, 130, 0.45);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 28px rgba(243, 216, 130, 0.75);
    transform: scale(1.025);
  }
}

.core-circle-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 0 35px rgba(243, 216, 130, 0.9);
}

.core-circle-btn.pressing:not(:disabled) {
  transform: scale(0.96);
  box-shadow: 0 0 15px rgba(243, 216, 130, 0.4);
}

/* 已打卡状态 */
.core-circle-btn.checked-done {
  background: radial-gradient(circle at 40% 30%, #516283 0%, #2f3b54 60%, #1e2638 100%);
  border-color: rgba(243, 216, 130, 0.4);
  box-shadow: 0 0 12px rgba(243, 216, 130, 0.2);
  animation: none;
  cursor: default;
}

.core-circle-btn.checked-done .btn-main-text {
  font-size: 17px;
  color: #eed588;
}

.core-circle-btn.checked-done .btn-sub-text {
  color: rgba(243, 216, 130, 0.7);
}

.btn-inner-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.35) 0%, transparent 60%);
  pointer-events: none;
}

.btn-text-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
}

.btn-main-text {
  font-size: 26px;
  font-weight: 800;
  letter-spacing: 2px;
  color: #452402;
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.6);
  transition: all 0.2s ease;
}

.btn-sub-text {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1.5px;
  color: #6d400e;
  margin-top: 2px;
}

/* 飘浮经验值动画 */
.floating-exp-tag {
  position: absolute;
  top: 15px;
  color: #ffd778;
  font-size: 18px;
  font-weight: 800;
  text-shadow: 0 0 8px #f3d882, 0 2px 4px rgba(0, 0, 0, 0.8);
  pointer-events: none;
  z-index: 10;
  animation: floatUp 1.2s forwards cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes floatUp {
  0% {
    opacity: 0;
    transform: translateY(10px) scale(0.8);
  }
  20% {
    opacity: 1;
    transform: translateY(-20px) scale(1.15);
  }
  100% {
    opacity: 0;
    transform: translateY(-65px) scale(1);
  }
}

/* 粒子爆发展示 */
.particle-burst {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  pointer-events: none;
  z-index: 9;
}

.sparkle {
  position: absolute;
  color: #ffd778;
  font-size: 14px;
  filter: drop-shadow(0 0 6px #f3d882);
  animation: burstParticle 0.9s forwards ease-out;
}

@keyframes burstParticle {
  0% {
    transform: translate(0, 0) scale(0.5);
    opacity: 1;
  }
  100% {
    transform: translate(var(--tx), var(--ty)) scale(1.3);
    opacity: 0;
  }
}

.s-1 { --tx: 70px; --ty: 0px; }
.s-2 { --tx: 50px; --ty: 50px; }
.s-3 { --tx: 0px; --ty: 70px; }
.s-4 { --tx: -50px; --ty: 50px; }
.s-5 { --tx: -70px; --ty: 0px; }
.s-6 { --tx: -50px; --ty: -50px; }
.s-7 { --tx: 0px; --ty: -70px; }
.s-8 { --tx: 50px; --ty: -50px; }
.s-9 { --tx: 85px; --ty: 30px; }
.s-10 { --tx: -85px; --ty: 30px; }
.s-11 { --tx: 30px; --ty: -85px; }
.s-12 { --tx: -30px; --ty: -85px; }
</style>
