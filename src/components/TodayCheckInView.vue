<template>
  <div class="today-focus-view">
    <!-- 1. 顶部今日学习与打卡综合进度条 -->
    <div class="progress-section">
      <div class="progress-info-row">
        <div class="progress-title-badge">
          <AppIcon name="target" :size="15" />
          <span>今日打卡进度</span>
        </div>
        <div class="progress-counter">
          <span class="count-done">{{ completedCount }}</span>
          <span class="count-divider">/</span>
          <span class="count-total">{{ totalCount }}</span>
          <span class="count-percent">({{ completionPercent }}%)</span>
        </div>
      </div>

      <!-- 金色星轨流光进度条 -->
      <div class="track-bar">
        <div
          class="fill-bar"
          :style="{ width: `${completionPercent}%` }"
        >
          <span v-if="completionPercent > 0" class="bar-sparkle">✦</span>
        </div>
      </div>
    </div>

    <!-- 2. 居中核心卡片展示区 -->
    <div class="focus-card-wrapper">
      <!-- 场景 A：存在待打卡项时，聚焦展示当前任务 -->
      <transition name="task-slide" mode="out-in">
        <div
          v-if="currentPendingTodo"
          :key="currentPendingTodo.id"
          class="task-card"
        >
          <!-- 卡片顶栏元信息 -->
          <div class="card-meta">
            <span class="task-type-badge" :class="currentPendingTodo.type">
              {{ currentPendingTodo.type === 'habit' ? '每日习惯' : '临时待办' }}
            </span>
            <span v-if="currentPendingTodo.time" class="task-time-badge">
              <AppIcon name="clock" :size="13" />
              <span>{{ currentPendingTodo.time }}</span>
            </span>
            <span v-if="currentPendingTodo.streak && currentPendingTodo.streak > 0" class="task-streak-badge">
              <AppIcon name="flame" :size="13" />
              <span>连击 {{ currentPendingTodo.streak }} 天</span>
            </span>
            <div class="card-nav-dots">
              <span class="dot-text">{{ currentTaskIndex + 1 }} / {{ pendingTodos.length }}</span>
            </div>
          </div>

          <!-- 任务标题与主视觉 -->
          <div class="card-main">
            <h2 class="task-title">{{ currentPendingTodo.title }}</h2>
            <p class="task-hint">
              ✦ 每次专注都是攀升 · 完成即获 +50 经验 ✦
            </p>
          </div>

          <!-- 一键强反馈打卡大按钮 -->
          <div class="action-dock">
            <button
              class="huge-punch-btn"
              :class="{ 'is-stamping': isStamping }"
              :disabled="isStamping"
              @click="handleTriggerPunch"
            >
              <div class="punch-btn-inner">
                <span class="stamp-icon">
                  <AppIcon :name="isStamping ? 'check' : 'sparkles'" :size="24" />
                </span>
                <span class="stamp-label">{{ isStamping ? '打卡完成 ✦' : '立即打卡' }}</span>
              </div>
              <div class="ring-glow"></div>
            </button>

            <!-- 切换上一项/下一项辅助箭头 -->
            <div v-if="pendingTodos.length > 1" class="task-nav-controls">
              <button class="nav-arrow-btn" title="查看上一项" @click="handlePrevTask">
                <AppIcon name="chevron-left" :size="16" />
              </button>
              <span class="nav-hint">左右切换</span>
              <button class="nav-arrow-btn" title="查看下一项" @click="handleNextTask">
                <AppIcon name="chevron-right" :size="16" />
              </button>
            </div>
          </div>

          <!-- 打卡后/打卡前选填心得输入胶囊（非阻塞交互） -->
          <div class="note-capsule-row">
            <div v-if="!showNoteInput" class="note-pill-btn" @click="showNoteInput = true">
              <AppIcon name="edit" :size="13" />
              <span>{{ currentNoteText ? `心得：${currentNoteText}` : '+ 补充打卡心得 (选填)' }}</span>
            </div>
            <div v-else class="note-input-box">
              <input
                v-model="currentNoteText"
                type="text"
                placeholder="记录今日产出或感悟 (回车保存)"
                maxlength="60"
                class="note-field"
                @keyup.enter="handleSaveNote"
                @blur="handleSaveNote"
              />
              <button class="note-save-btn" @click="handleSaveNote">确定</button>
            </div>
          </div>

          <!-- 粒子与印章盖下动效浮层 -->
          <div v-if="isStamping" class="stamp-fx-overlay">
            <div class="stamp-gold-seal">
              <span class="seal-star">✦</span>
              <span class="seal-text">已通关</span>
            </div>
            <div class="particle-cluster">
              <span v-for="n in 12" :key="n" :class="`sparkle-p p-${n}`">✦</span>
            </div>
          </div>
        </div>

        <!-- 场景 B：全通关庆祝状态（All-Clear State） -->
        <div v-else class="all-clear-card">
          <div class="trophy-crest">
            <div class="crest-halo"></div>
            <span class="trophy-symbol">✦</span>
          </div>
          <h2 class="all-clear-title">今日目标已全达成！</h2>
          <p class="all-clear-desc">
            今日待办与习惯已全部完成，精力充盈，连击继续延续！
          </p>

          <div class="clear-stats-pill">
            <div class="stat-cell">
              <span class="cell-num">{{ totalCount }}</span>
              <span class="cell-label">今日完成</span>
            </div>
            <div class="stat-sep"></div>
            <div class="stat-cell">
              <span class="cell-num">{{ streak }}</span>
              <span class="cell-label">连续天数</span>
            </div>
          </div>

          <div class="all-clear-actions">
            <button class="add-extra-btn" @click="$emit('open-add-todo')">
              <AppIcon name="plus" :size="16" />
              <span>再添加一项待办</span>
            </button>
            <button class="view-history-btn" @click="$emit('switch-tab', 'history')">
              <AppIcon name="history" :size="16" />
              <span>回顾历程流水</span>
            </button>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { TodoItem } from '../types'
import AppIcon from './AppIcon.vue'

const props = defineProps<{
  todos: TodoItem[]
  exp: number
  streak: number
}>()

const emit = defineEmits<{
  (e: 'checkin', payload: { todoId: string; note: string }): void
  (e: 'open-add-todo'): void
  (e: 'switch-tab', tab: 'checkin' | 'todos' | 'history'): void
  (e: 'save-todo-note', payload: { todoId: string; note: string }): void
}>()

// 进度统计
const totalCount = computed(() => props.todos.length)
const completedCount = computed(() => props.todos.filter((t) => t.completed).length)
const completionPercent = computed(() => {
  if (totalCount.value === 0) return 0
  return Math.round((completedCount.value / totalCount.value) * 100)
})

// 未完成的待办列表（按顺序）
const pendingTodos = computed(() => props.todos.filter((t) => !t.completed))

// 当前聚焦展示的任务索引
const currentTaskIndex = ref(0)
const isStamping = ref(false)
const showNoteInput = ref(false)
const currentNoteText = ref('')

// 确保索引合法
watch(
  () => pendingTodos.value.length,
  (len) => {
    if (currentTaskIndex.value >= len) {
      currentTaskIndex.value = Math.max(0, len - 1)
    }
  }
)

const currentPendingTodo = computed<TodoItem | null>(() => {
  if (pendingTodos.value.length === 0) return null
  return pendingTodos.value[currentTaskIndex.value] || pendingTodos.value[0]
})

// 监听当前任务切换，同步已有备注
watch(
  currentPendingTodo,
  (todo) => {
    currentNoteText.value = todo?.note || ''
    showNoteInput.value = false
  },
  { immediate: true }
)

function handlePrevTask() {
  if (pendingTodos.value.length <= 1) return
  currentTaskIndex.value =
    (currentTaskIndex.value - 1 + pendingTodos.value.length) % pendingTodos.value.length
}

function handleNextTask() {
  if (pendingTodos.value.length <= 1) return
  currentTaskIndex.value = (currentTaskIndex.value + 1) % pendingTodos.value.length
}

function handleSaveNote() {
  showNoteInput.value = false
  if (currentPendingTodo.value) {
    emit('save-todo-note', {
      todoId: currentPendingTodo.value.id,
      note: currentNoteText.value.trim()
    })
  }
}

// 核心打卡交互触发
function handleTriggerPunch() {
  if (!currentPendingTodo.value || isStamping.value) return

  // 1. 触发轻微震动反馈（移动端）
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([35, 30, 45])
    } catch {
      // 忽略不支持异常
    }
  }

  isStamping.value = true
  const activeTodoId = currentPendingTodo.value.id
  const activeNote = currentNoteText.value.trim()

  // 2. 动效持续约 900ms 后派发打卡事件并切换
  setTimeout(() => {
    emit('checkin', {
      todoId: activeTodoId,
      note: activeNote
    })
    isStamping.value = false
  }, 950)
}
</script>

<style scoped>
.today-focus-view {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
}

/* 顶部进度条模块 */
.progress-section {
  width: 100%;
  background: rgba(14, 25, 52, 0.7);
  border: 1px solid rgba(243, 216, 130, 0.25);
  border-radius: 16px;
  padding: 14px 18px;
  backdrop-filter: blur(14px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
}

.progress-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.progress-title-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #fff0bd;
  font-size: 13px;
  font-weight: 600;
}

.progress-counter {
  display: flex;
  align-items: baseline;
  gap: 3px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.count-done {
  color: var(--gold-primary, #f3d882);
  font-size: 16px;
  font-weight: 800;
}

.count-divider,
.count-total {
  color: #9ab2d5;
  font-size: 13px;
}

.count-percent {
  color: #5eead4;
  font-size: 11px;
  margin-left: 4px;
}

.track-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  overflow: visible;
  position: relative;
}

.fill-bar {
  height: 100%;
  background: linear-gradient(90deg, #b88628 0%, #f3d882 70%, #5eead4 100%);
  border-radius: 6px;
  position: relative;
  transition: width 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 0 10px rgba(243, 216, 130, 0.6);
}

.bar-sparkle {
  position: absolute;
  right: -5px;
  top: -8px;
  font-size: 10px;
  color: #ffffff;
  filter: drop-shadow(0 0 6px #f3d882);
  animation: pulseStar 1.4s ease-in-out infinite;
}

@keyframes pulseStar {
  0%, 100% { transform: scale(0.9); opacity: 0.8; }
  50% { transform: scale(1.3); opacity: 1; }
}

/* 核心卡片容器 */
.focus-card-wrapper {
  width: 100%;
  min-height: 380px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.task-card {
  width: 100%;
  background: linear-gradient(165deg, rgba(16, 29, 60, 0.85) 0%, rgba(9, 17, 38, 0.92) 100%);
  border: 1px solid rgba(243, 216, 130, 0.35);
  border-radius: 24px;
  padding: 24px 20px 20px;
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.5), 0 0 24px rgba(243, 216, 130, 0.12);
  backdrop-filter: blur(18px);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.card-meta {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
}

.task-type-badge {
  font-size: 11px;
  padding: 3px 9px;
  border-radius: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.task-type-badge.habit {
  background: rgba(94, 234, 212, 0.15);
  color: #5eead4;
  border: 1px solid rgba(94, 234, 212, 0.35);
}

.task-type-badge.once {
  background: rgba(243, 216, 130, 0.15);
  color: #f3d882;
  border: 1px solid rgba(243, 216, 130, 0.35);
}

.task-time-badge,
.task-streak-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #9ab2d5;
  background: rgba(255, 255, 255, 0.05);
  padding: 3px 8px;
  border-radius: 10px;
}

.task-streak-badge {
  color: #fca5a5;
}

.card-nav-dots {
  margin-left: auto;
  font-size: 11px;
  color: #657b9e;
  font-weight: 600;
}

.card-main {
  text-align: center;
  margin-bottom: 24px;
  width: 100%;
}

.task-title {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.4;
  margin-bottom: 8px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  word-break: break-word;
}

.task-hint {
  font-size: 12px;
  color: #9ab2d5;
  opacity: 0.85;
}

/* 打卡大按钮 */
.action-dock {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}

.huge-punch-btn {
  width: 170px;
  height: 170px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  background: radial-gradient(circle at 40% 30%, #203565 0%, #0d1a38 70%, #081024 100%);
  position: relative;
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.6), inset 0 0 16px rgba(243, 216, 130, 0.35);
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease;
}

.huge-punch-btn::before {
  content: "";
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 1.5px dashed rgba(243, 216, 130, 0.5);
  animation: rotateBorder 16s linear infinite;
}

@keyframes rotateBorder {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.huge-punch-btn:hover:not(:disabled) {
  transform: scale(1.04);
  box-shadow: 0 16px 45px rgba(0, 0, 0, 0.7), inset 0 0 24px rgba(243, 216, 130, 0.55);
}

.huge-punch-btn:active:not(:disabled) {
  transform: scale(0.96);
}

.huge-punch-btn.is-stamping {
  animation: stampImpact 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards;
}

@keyframes stampImpact {
  0% { transform: scale(1); }
  40% { transform: scale(0.85); }
  75% { transform: scale(1.08); }
  100% { transform: scale(1); }
}

.punch-btn-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #fff0bd;
  z-index: 2;
}

.stamp-icon {
  color: #f3d882;
  filter: drop-shadow(0 0 8px rgba(243, 216, 130, 0.8));
}

.stamp-label {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 1px;
}

.task-nav-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-arrow-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #9ab2d5;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-arrow-btn:hover {
  background: rgba(243, 216, 130, 0.2);
  color: #fff0bd;
  border-color: rgba(243, 216, 130, 0.4);
}

.nav-hint {
  font-size: 11px;
  color: #657b9e;
}

/* 心得胶囊输入 */
.note-capsule-row {
  width: 100%;
  display: flex;
  justify-content: center;
}

.note-pill-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #9ab2d5;
  background: rgba(255, 255, 255, 0.05);
  border: 1px dashed rgba(243, 216, 130, 0.3);
  padding: 6px 14px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  max-width: 90%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.note-pill-btn:hover {
  background: rgba(243, 216, 130, 0.12);
  color: #fff0bd;
}

.note-input-box {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
}

.note-field {
  flex: 1;
  background: rgba(9, 17, 36, 0.85);
  border: 1px solid rgba(243, 216, 130, 0.45);
  border-radius: 12px;
  color: #ffffff;
  padding: 6px 12px;
  font-size: 12px;
  outline: none;
}

.note-field:focus {
  border-color: #f3d882;
  box-shadow: 0 0 10px rgba(243, 216, 130, 0.35);
}

.note-save-btn {
  background: linear-gradient(135deg, #b88628, #f3d882);
  border: none;
  border-radius: 10px;
  color: #0b152d;
  font-size: 11px;
  font-weight: 700;
  padding: 6px 12px;
  cursor: pointer;
}

/* 盖印粒子遮罩 */
.stamp-fx-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(11, 21, 45, 0.65);
  backdrop-filter: blur(4px);
  z-index: 10;
  animation: fadeIn 0.2s ease;
}

.stamp-gold-seal {
  width: 130px;
  height: 130px;
  border-radius: 50%;
  border: 3px double #f3d882;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(184, 134, 40, 0.25);
  box-shadow: 0 0 30px rgba(243, 216, 130, 0.8);
  animation: sealDrop 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards;
}

.seal-star {
  font-size: 24px;
  color: #fff0bd;
}

.seal-text {
  font-size: 16px;
  font-weight: 900;
  color: #ffffff;
  letter-spacing: 2px;
}

@keyframes sealDrop {
  0% { transform: scale(2.2); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.particle-cluster {
  position: absolute;
  pointer-events: none;
}

.sparkle-p {
  position: absolute;
  color: #f3d882;
  font-size: 14px;
  animation: explodeParticle 0.8s ease-out forwards;
}

.p-1 { --tx: -50px; --ty: -60px; }
.p-2 { --tx: 50px; --ty: -60px; }
.p-3 { --tx: -70px; --ty: 10px; }
.p-4 { --tx: 70px; --ty: 10px; }
.p-5 { --tx: -40px; --ty: 60px; }
.p-6 { --tx: 40px; --ty: 60px; }
.p-7 { --tx: 0px; --ty: -80px; }
.p-8 { --tx: 0px; --ty: 80px; }
.p-9 { --tx: -80px; --ty: -20px; }
.p-10 { --tx: 80px; --ty: -20px; }
.p-11 { --tx: -30px; --ty: -90px; }
.p-12 { --tx: 30px; --ty: 90px; }

@keyframes explodeParticle {
  0% { transform: translate(0, 0) scale(1); opacity: 1; }
  100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
}

/* 全通关卡片样式 */
.all-clear-card {
  width: 100%;
  background: linear-gradient(165deg, rgba(16, 29, 60, 0.85) 0%, rgba(9, 17, 38, 0.95) 100%);
  border: 1px solid rgba(94, 234, 212, 0.4);
  border-radius: 24px;
  padding: 36px 20px 28px;
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.5), 0 0 24px rgba(94, 234, 212, 0.15);
  backdrop-filter: blur(18px);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.trophy-crest {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(94, 234, 212, 0.3) 0%, rgba(20, 36, 75, 0.8) 100%);
  border: 2px solid #5eead4;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  box-shadow: 0 0 25px rgba(94, 234, 212, 0.45);
}

.trophy-symbol {
  font-size: 32px;
  color: #fff0bd;
  filter: drop-shadow(0 0 8px #5eead4);
}

.all-clear-title {
  font-size: 21px;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 8px;
}

.all-clear-desc {
  font-size: 13px;
  color: #9ab2d5;
  max-width: 280px;
  line-height: 1.5;
  margin-bottom: 24px;
}

.clear-stats-pill {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 10px 24px;
  margin-bottom: 24px;
  gap: 20px;
}

.stat-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.cell-num {
  font-size: 18px;
  font-weight: 800;
  color: #f3d882;
}

.cell-label {
  font-size: 11px;
  color: #657b9e;
}

.stat-sep {
  width: 1px;
  height: 24px;
  background: rgba(255, 255, 255, 0.1);
}

.all-clear-actions {
  display: flex;
  gap: 12px;
  width: 100%;
}

.add-extra-btn,
.view-history-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 11px 14px;
  border-radius: 14px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-extra-btn {
  background: linear-gradient(135deg, #b88628, #f3d882);
  border: none;
  color: #0b152d;
}

.view-history-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #ffffff;
}

.add-extra-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 14px rgba(243, 216, 130, 0.4);
}

.view-history-btn:hover {
  background: rgba(255, 255, 255, 0.14);
}

/* 卡片切项动效 */
.task-slide-enter-active,
.task-slide-leave-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.task-slide-enter-from {
  opacity: 0;
  transform: translateY(24px) scale(0.96);
}

.task-slide-leave-to {
  opacity: 0;
  transform: translateY(-24px) scale(0.96);
}
</style>
