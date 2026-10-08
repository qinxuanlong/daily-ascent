<template>
  <div class="today-focus-view">
    <!-- 1. 顶部今日量化指标与进度条 -->
    <div class="progress-section">
      <div class="progress-info-row">
        <div class="progress-stats-group">
          <div class="stat-tag">
            <AppIcon name="clock" :size="13" />
            <span>今日专注 <strong>{{ todayFocusMinutes }}</strong> 分钟</span>
          </div>
          <div class="stat-tag">
            <AppIcon name="sparkles" :size="13" />
            <span>沉淀 <strong>{{ todayOutcomeCount }}</strong> 条成果</span>
          </div>
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
        <div class="fill-bar" :style="{ width: `${completionPercent}%` }">
          <span v-if="completionPercent > 0" class="bar-sparkle">✦</span>
        </div>
      </div>
    </div>

    <!-- 2. 状态切换容器 -->
    <div class="focus-card-wrapper">
      <!-- 模式 A：正在沉浸专注中 (In-Focus State) -->
      <div v-if="isFocusing" class="in-focus-container">
        <!-- 呼吸光晕脉动圆环 -->
        <div class="breath-halo-ring" :class="{ 'is-paused': isPaused }"></div>

        <div class="focus-inner-content">
          <div class="focus-status-badge">
            <span class="pulse-dot"></span>
            <span>{{ isPaused ? '专注已暂停' : '正在单线程心流专注' }}</span>
          </div>

          <!-- 当前专注目标 -->
          <h2 class="focusing-target-title">{{ activeTargetTitle }}</h2>

          <!-- 大号动态时间显示 -->
          <div class="focus-timer-digits">
            {{ displayTime }}
          </div>

          <div class="focus-mode-label">
            {{ timerMode === 'stopwatch' ? '正向自由心流计时' : `${timerDuration} 分钟倒计时` }}
          </div>

          <!-- 专注控制操作坞 -->
          <div class="focus-controls">
            <!-- 暂停 / 继续 -->
            <button class="ctrl-btn pause-btn" @click="handleTogglePause">
              <AppIcon :name="isPaused ? 'play' : 'pause'" :size="16" />
              <span>{{ isPaused ? '继续' : '暂停' }}</span>
            </button>

            <!-- 提前收工并沉淀成果 (弹性设计，不浪费任何时间) -->
            <button class="ctrl-btn finish-early-btn" @click="handleTriggerFinish">
              <AppIcon name="stop" :size="16" />
              <span>收工并沉淀成果</span>
            </button>

            <!-- 放弃本次 -->
            <button class="ctrl-btn cancel-btn" @click="handleCancelFocus">
              <AppIcon name="x" :size="15" />
              <span>放弃</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 模式 B：专注发射台 (Launcher State) -->
      <div v-else-if="currentPendingTodo" class="launcher-card">
        <!-- 卡片元信息 -->
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
            <span>{{ currentTaskIndex + 1 }} / {{ pendingTodos.length }}</span>
          </div>
        </div>

        <!-- 任务目标与可快速微调输入框 -->
        <div class="target-dock">
          <div class="target-label-row">
            <span class="target-label">本次专注目标</span>
            <span class="target-hint">点击可补充细分目标</span>
          </div>
          <input
            v-model="customTargetInput"
            type="text"
            class="target-input-field"
            placeholder="例如：攻克动态规划背包问题"
            maxlength="50"
          />
        </div>

        <!-- 番茄模式选择胶囊 -->
        <div class="timer-mode-selector">
          <button
            class="mode-chip"
            :class="{ active: timerMode === 'pomodoro25' }"
            @click="timerMode = 'pomodoro25'"
          >
            25m 番茄
          </button>
          <button
            class="mode-chip"
            :class="{ active: timerMode === 'pomodoro45' }"
            @click="timerMode = 'pomodoro45'"
          >
            45m 深度
          </button>
          <button
            class="mode-chip"
            :class="{ active: timerMode === 'stopwatch' }"
            @click="timerMode = 'stopwatch'"
          >
            自由心流
          </button>
        </div>

        <!-- 发光大号开启专注主按钮 -->
        <div class="launch-action-wrap">
          <button
            class="huge-launch-btn"
            title="开启沉浸专注 (快捷键 Space / 回车)"
            @click="handleStartFocus"
          >
            <div class="launch-btn-inner">
              <span class="launch-icon">
                <AppIcon name="play" :size="24" />
              </span>
              <span class="launch-label">开启专注</span>
              <span class="launch-subtext">SPACE</span>
            </div>
            <div class="glow-orbit-ring"></div>
          </button>

          <!-- 切换上一项/下一项辅助箭头 -->
          <div v-if="pendingTodos.length > 1" class="task-nav-controls">
            <button class="nav-arrow-btn" title="查看上一项" @click="handlePrevTask">
              <AppIcon name="chevron-left" :size="16" />
            </button>
            <span class="nav-hint">左右切换待办项</span>
            <button class="nav-arrow-btn" title="查看下一项" @click="handleNextTask">
              <AppIcon name="chevron-right" :size="16" />
            </button>
          </div>
        </div>

        <!-- 轻量直接速记打卡入口 (备用，无需计时时使用) -->
        <div class="direct-punch-row">
          <button class="direct-punch-btn" @click="handleOpenOutcomeModal(0)">
            <span>跳过计时，直接记一条成果 ✦</span>
          </button>
        </div>
      </div>

      <!-- 模式 C：全通关庆祝态 (All-Clear State) -->
      <div v-else class="all-clear-card">
        <div class="trophy-crest">
          <span class="trophy-symbol">✦</span>
        </div>
        <h2 class="all-clear-title">今日目标已全达成！</h2>
        <p class="all-clear-desc">
          所有计划待办已打卡完毕，今日已专注 {{ todayFocusMinutes }} 分钟，沉淀 {{ todayOutcomeCount }} 条成果！
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
          <div class="stat-sep"></div>
          <div class="stat-cell">
            <span class="cell-num">{{ todayFocusMinutes }}m</span>
            <span class="cell-label">总专注时长</span>
          </div>
        </div>

        <div class="all-clear-actions">
          <button class="add-extra-btn" @click="$emit('open-add-todo')">
            <AppIcon name="plus" :size="16" />
            <span>再添加一项待办</span>
          </button>
          <button class="view-history-btn" @click="$emit('switch-tab', 'history')">
            <AppIcon name="history" :size="16" />
            <span>回顾成果时光轴</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 3. 成果沉淀与盖章归档弹窗 (Outcome Capture Dialog) -->
    <transition name="modal-fade">
      <div v-if="showOutcomeModal" class="outcome-modal-backdrop" @click.self="showOutcomeModal = false">
        <div class="outcome-card">
          <div class="outcome-header">
            <div class="outcome-title-box">
              <span class="sparkle-symbol">✦</span>
              <h3>专注完成 · 本次沉淀了什么？</h3>
            </div>
            <span class="duration-badge">
              <AppIcon name="clock" :size="12" />
              <span>专注 {{ recordedDurationMinutes }} 分钟</span>
            </span>
          </div>

          <div class="outcome-body">
            <!-- 关联任务提示 -->
            <div class="active-task-pill">
              <span>目标：{{ recordedTaskTitle }}</span>
            </div>

            <!-- 核心产出一两句话输入框 -->
            <div class="form-group">
              <label class="form-label">本次完成了什么？(一两句话记录产出)</label>
              <textarea
                v-model="outcomeSummary"
                rows="2"
                class="outcome-textarea"
                placeholder="例如：攻克了完全背包的空间优化，写完了2道动态规划"
                maxlength="120"
                @keyup.enter.ctrl="handleConfirmSaveOutcome"
              ></textarea>
            </div>

            <!-- 可选产出计数 -->
            <div class="form-group">
              <label class="form-label">量化产出 (选填)</label>
              <input
                v-model="outcomeQuantity"
                type="text"
                class="quantity-field"
                placeholder="例如：2道题 / 1500字 / 1个模块"
                maxlength="20"
              />
            </div>
          </div>

          <div class="outcome-footer">
            <button class="cancel-outcome-btn" @click="showOutcomeModal = false">稍后补记</button>
            <button
              class="stamp-confirm-btn"
              :class="{ 'is-stamping': isStampingAnim }"
              :disabled="isStampingAnim"
              @click="handleConfirmSaveOutcome"
            >
              <AppIcon name="check" :size="16" />
              <span>{{ isStampingAnim ? '盖章通关中...' : '盖章归档 (+50 EXP)' }}</span>
            </button>
          </div>

          <!-- 盖章动效覆盖层 -->
          <div v-if="isStampingAnim" class="stamp-seal-overlay">
            <div class="gold-seal-drop">
              <span class="seal-star">✦</span>
              <span class="seal-text">成果入库</span>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import type { TodoItem, FocusTimerMode, CheckInLog } from '../types'
import { playChimeSound } from '../utils/audio'
import AppIcon from './AppIcon.vue'

const props = defineProps<{
  todos: TodoItem[]
  logs: CheckInLog[]
  exp: number
  streak: number
}>()

const emit = defineEmits<{
  (e: 'checkin', payload: {
    todoId: string
    note: string
    durationMinutes: number
    quantity?: string
  }): void
  (e: 'open-add-todo'): void
  (e: 'switch-tab', tab: 'checkin' | 'todos' | 'history'): void
}>()

// 进度与成果统计
const totalCount = computed(() => props.todos.length)
const completedCount = computed(() => props.todos.filter((t) => t.completed).length)
const completionPercent = computed(() => {
  if (totalCount.value === 0) return 0
  return Math.round((completedCount.value / totalCount.value) * 100)
})

// 今日专注总分钟数与成果数
const todayFocusMinutes = computed(() => {
  return props.logs.reduce((acc, cur) => acc + (cur.durationMinutes || 0), 0)
})
const todayOutcomeCount = computed(() => props.logs.length)

// 待办筛选与聚焦索引
const pendingTodos = computed(() => props.todos.filter((t) => !t.completed))
const currentTaskIndex = ref(0)

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

// 发射台输入与配置
const customTargetInput = ref('')
const timerMode = ref<FocusTimerMode>('pomodoro25')

watch(
  currentPendingTodo,
  (todo) => {
    if (todo) customTargetInput.value = todo.title
  },
  { immediate: true }
)

// 计时核心状态
const isFocusing = ref(false)
const isPaused = ref(false)
const elapsedSeconds = ref(0)
const totalTargetSeconds = ref(25 * 60)
let timerInterval: ReturnType<typeof setInterval> | null = null

const activeTargetTitle = computed(() => customTargetInput.value.trim() || currentPendingTodo.value?.title || '专注心流')

const timerDuration = computed(() => {
  if (timerMode.value === 'pomodoro25') return 25
  if (timerMode.value === 'pomodoro45') return 45
  return 0
})

const remainingSeconds = computed(() => {
  if (timerMode.value === 'stopwatch') return elapsedSeconds.value
  return Math.max(0, totalTargetSeconds.value - elapsedSeconds.value)
})

const displayTime = computed(() => {
  const secs = remainingSeconds.value
  const m = Math.floor(secs / 60)
  const s = secs % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  return `${mm}:${ss}`
})

// 成果微卡片弹窗状态
const showOutcomeModal = ref(false)
const outcomeSummary = ref('')
const outcomeQuantity = ref('')
const recordedDurationMinutes = ref(25)
const recordedTaskTitle = ref('')
const isStampingAnim = ref(false)

function handlePrevTask() {
  if (pendingTodos.value.length <= 1) return
  currentTaskIndex.value = (currentTaskIndex.value - 1 + pendingTodos.value.length) % pendingTodos.value.length
}

function handleNextTask() {
  if (pendingTodos.value.length <= 1) return
  currentTaskIndex.value = (currentTaskIndex.value + 1) % pendingTodos.value.length
}

// 开启专注
function handleStartFocus() {
  if (!currentPendingTodo.value) return

  isFocusing.value = true
  isPaused.value = false
  elapsedSeconds.value = 0

  if (timerMode.value === 'pomodoro25') {
    totalTargetSeconds.value = 25 * 60
  } else if (timerMode.value === 'pomodoro45') {
    totalTargetSeconds.value = 45 * 60
  } else {
    totalTargetSeconds.value = 0
  }

  startTimer()
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval)
  timerInterval = setInterval(() => {
    if (!isPaused.value) {
      elapsedSeconds.value++

      // 倒计时结束检测
      if (timerMode.value !== 'stopwatch' && elapsedSeconds.value >= totalTargetSeconds.value) {
        handleTimerFinish()
      }
    }
  }, 1000)
}

function handleTogglePause() {
  isPaused.value = !isPaused.value
}

// 倒计时自然到点
function handleTimerFinish() {
  stopTimer()
  playChimeSound()
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try { navigator.vibrate([100, 50, 100]) } catch { /* ignore */ }
  }
  const mins = Math.max(1, Math.round(elapsedSeconds.value / 60))
  handleOpenOutcomeModal(mins)
}

// 提前收工完成
function handleTriggerFinish() {
  stopTimer()
  playChimeSound()
  const mins = Math.max(1, Math.round(elapsedSeconds.value / 60))
  handleOpenOutcomeModal(mins)
}

function handleCancelFocus() {
  if (window.confirm('确定放弃本次专注吗？')) {
    stopTimer()
    isFocusing.value = false
  }
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

// 打开成果沉淀录入弹窗
function handleOpenOutcomeModal(durationMins: number) {
  isFocusing.value = false
  recordedDurationMinutes.value = durationMins || (timerMode.value === 'pomodoro45' ? 45 : 25)
  recordedTaskTitle.value = activeTargetTitle.value
  outcomeSummary.value = ''
  outcomeQuantity.value = ''
  showOutcomeModal.value = true
}

// 确认保存成果并盖章
function handleConfirmSaveOutcome() {
  if (isStampingAnim.value) return
  isStampingAnim.value = true

  const activeTodoId = currentPendingTodo.value?.id || ''
  const finalSummary = outcomeSummary.value.trim() || `${recordedTaskTitle.value} 专注完成 ✦`
  const finalQuantity = outcomeQuantity.value.trim() || undefined

  setTimeout(() => {
    emit('checkin', {
      todoId: activeTodoId,
      note: finalSummary,
      durationMinutes: recordedDurationMinutes.value,
      quantity: finalQuantity
    })
    isStampingAnim.value = false
    showOutcomeModal.value = false
  }, 900)
}

// 快捷键支持
function handleKeyDown(e: KeyboardEvent) {
  const tag = (e.target as HTMLElement)?.tagName?.toLowerCase()
  if (tag === 'input' || tag === 'textarea') return

  if (e.code === 'Space') {
    e.preventDefault()
    if (!isFocusing.value && currentPendingTodo.value) {
      handleStartFocus()
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  stopTimer()
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.today-focus-view {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 18px;
  align-items: center;
}

/* 顶部量化统计与进度条 */
.progress-section {
  width: 100%;
  background: rgba(14, 25, 52, 0.75);
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

.progress-stats-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-tag {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #9ab2d5;
}

.stat-tag strong {
  color: #fff0bd;
  font-weight: 700;
}

.progress-counter {
  display: flex;
  align-items: baseline;
  gap: 3px;
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
}

/* 核心卡片容器 */
.focus-card-wrapper {
  width: 100%;
  min-height: 420px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* 发射台卡片 (Launcher Card) */
.launcher-card {
  width: 100%;
  background: linear-gradient(165deg, rgba(16, 29, 60, 0.85) 0%, rgba(9, 17, 38, 0.95) 100%);
  border: 1px solid rgba(243, 216, 130, 0.35);
  border-radius: 24px;
  padding: 24px 20px 20px;
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.5), 0 0 24px rgba(243, 216, 130, 0.12);
  backdrop-filter: blur(18px);
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.card-meta {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.task-type-badge {
  font-size: 11px;
  padding: 3px 9px;
  border-radius: 12px;
  font-weight: 600;
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

/* 目标输入区域 */
.target-dock {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}

.target-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.target-label {
  font-size: 12px;
  font-weight: 600;
  color: #fff0bd;
}

.target-hint {
  font-size: 11px;
  color: #657b9e;
}

.target-input-field {
  width: 100%;
  background: rgba(8, 16, 36, 0.8);
  border: 1px solid rgba(243, 216, 130, 0.35);
  border-radius: 14px;
  color: #ffffff;
  padding: 10px 14px;
  font-size: 15px;
  font-weight: 600;
  outline: none;
  transition: all 0.2s ease;
}

.target-input-field:focus {
  border-color: #f3d882;
  box-shadow: 0 0 12px rgba(243, 216, 130, 0.35);
}

/* 模式选择胶囊 */
.timer-mode-selector {
  display: flex;
  gap: 8px;
  margin-bottom: 22px;
}

.mode-chip {
  padding: 6px 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #9ab2d5;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mode-chip.active {
  background: rgba(243, 216, 130, 0.18);
  border-color: #f3d882;
  color: #fff0bd;
  font-weight: 700;
}

/* 巨大发射按钮 */
.launch-action-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  margin-bottom: 14px;
}

.huge-launch-btn {
  width: 160px;
  height: 160px;
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

.huge-launch-btn::before {
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

.huge-launch-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 16px 45px rgba(0, 0, 0, 0.7), inset 0 0 24px rgba(243, 216, 130, 0.55);
}

.huge-launch-btn:active {
  transform: scale(0.95);
}

.launch-btn-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #fff0bd;
  z-index: 2;
}

.launch-icon {
  color: #f3d882;
  filter: drop-shadow(0 0 8px rgba(243, 216, 130, 0.8));
}

.launch-label {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 1px;
}

.launch-subtext {
  font-size: 10px;
  color: #657b9e;
  letter-spacing: 1.5px;
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

.direct-punch-row {
  margin-top: 6px;
}

.direct-punch-btn {
  background: transparent;
  border: none;
  color: #657b9e;
  font-size: 12px;
  cursor: pointer;
  transition: color 0.2s ease;
}

.direct-punch-btn:hover {
  color: #fff0bd;
}

/* 沉浸专注模式 (In-Focus State) */
.in-focus-container {
  width: 100%;
  height: 100%;
  min-height: 400px;
  background: radial-gradient(circle at center, #101c38 0%, #080f22 70%, #040814 100%);
  border: 1px solid rgba(94, 234, 212, 0.35);
  border-radius: 28px;
  padding: 36px 20px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8), inset 0 0 30px rgba(94, 234, 212, 0.15);
}

.breath-halo-ring {
  position: absolute;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(94, 234, 212, 0.15) 0%, rgba(243, 216, 130, 0.08) 50%, transparent 75%);
  pointer-events: none;
  animation: pulseBreath 4s ease-in-out infinite;
}

.breath-halo-ring.is-paused {
  animation-play-state: paused;
  opacity: 0.4;
}

@keyframes pulseBreath {
  0%, 100% { transform: scale(0.9); opacity: 0.5; }
  50% { transform: scale(1.15); opacity: 0.85; }
}

.focus-inner-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.focus-status-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #5eead4;
  background: rgba(94, 234, 212, 0.12);
  border: 1px solid rgba(94, 234, 212, 0.3);
  padding: 4px 12px;
  border-radius: 14px;
  margin-bottom: 12px;
}

.pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #5eead4;
  box-shadow: 0 0 8px #5eead4;
  animation: blink 1.2s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}

.focusing-target-title {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 18px;
  max-width: 300px;
  word-break: break-word;
}

.focus-timer-digits {
  font-size: 64px;
  font-weight: 800;
  color: #fff0bd;
  letter-spacing: 2px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  text-shadow: 0 0 24px rgba(243, 216, 130, 0.6);
  line-height: 1;
  margin-bottom: 8px;
}

.focus-mode-label {
  font-size: 12px;
  color: #9ab2d5;
  margin-bottom: 30px;
}

.focus-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ctrl-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pause-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

.finish-early-btn {
  background: linear-gradient(135deg, #b88628, #f3d882);
  border: none;
  color: #0b152d;
  box-shadow: 0 4px 16px rgba(243, 216, 130, 0.4);
}

.cancel-btn {
  background: transparent;
  border: none;
  color: #657b9e;
}

.pause-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.finish-early-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 22px rgba(243, 216, 130, 0.6);
}

.cancel-btn:hover {
  color: #f87171;
}

/* 全通关卡片 */
.all-clear-card {
  width: 100%;
  background: linear-gradient(165deg, rgba(16, 29, 60, 0.85) 0%, rgba(9, 17, 38, 0.95) 100%);
  border: 1px solid rgba(94, 234, 212, 0.4);
  border-radius: 24px;
  padding: 36px 20px 28px;
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
  max-width: 320px;
  line-height: 1.5;
  margin-bottom: 24px;
}

.clear-stats-pill {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 10px 20px;
  margin-bottom: 24px;
  gap: 16px;
}

.stat-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.cell-num {
  font-size: 17px;
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

/* 成果沉淀弹窗 */
.outcome-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(4, 9, 22, 0.78);
  backdrop-filter: blur(10px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.outcome-card {
  width: 100%;
  max-width: 420px;
  background: linear-gradient(165deg, #132448 0%, #0c1630 100%);
  border: 1px solid rgba(243, 216, 130, 0.45);
  border-radius: 24px;
  padding: 24px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7);
  position: relative;
  overflow: hidden;
}

.outcome-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.outcome-title-box {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sparkle-symbol {
  color: #f3d882;
  font-size: 16px;
}

.outcome-title-box h3 {
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
}

.duration-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #5eead4;
  background: rgba(94, 234, 212, 0.15);
  border: 1px solid rgba(94, 234, 212, 0.3);
  padding: 3px 8px;
  border-radius: 10px;
  font-weight: 600;
}

.active-task-pill {
  font-size: 12px;
  color: #fff0bd;
  background: rgba(243, 216, 130, 0.12);
  border: 1px solid rgba(243, 216, 130, 0.25);
  padding: 6px 12px;
  border-radius: 10px;
  margin-bottom: 14px;
}

.outcome-textarea {
  width: 100%;
  background: rgba(8, 16, 36, 0.85);
  border: 1px solid rgba(243, 216, 130, 0.35);
  border-radius: 12px;
  color: #ffffff;
  padding: 10px 12px;
  font-size: 13px;
  outline: none;
  resize: none;
  line-height: 1.4;
}

.outcome-textarea:focus {
  border-color: #f3d882;
  box-shadow: 0 0 10px rgba(243, 216, 130, 0.3);
}

.quantity-field {
  width: 100%;
  background: rgba(8, 16, 36, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  color: #ffffff;
  padding: 8px 12px;
  font-size: 12px;
  outline: none;
}

.quantity-field:focus {
  border-color: #f3d882;
}

.outcome-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  margin-top: 18px;
}

.cancel-outcome-btn {
  background: transparent;
  border: none;
  color: #657b9e;
  font-size: 12px;
  cursor: pointer;
}

.cancel-outcome-btn:hover {
  color: #9ab2d5;
}

.stamp-confirm-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #b88628, #f3d882);
  border: none;
  border-radius: 14px;
  color: #0b152d;
  font-size: 13px;
  font-weight: 700;
  padding: 10px 18px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 16px rgba(243, 216, 130, 0.4);
}

.stamp-confirm-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 22px rgba(243, 216, 130, 0.6);
}

/* 盖印归档动效层 */
.stamp-seal-overlay {
  position: absolute;
  inset: 0;
  background: rgba(11, 21, 45, 0.8);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
}

.gold-seal-drop {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  border: 3px double #f3d882;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(184, 134, 40, 0.35);
  box-shadow: 0 0 35px rgba(243, 216, 130, 0.9);
  animation: dropSeal 0.45s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards;
}

.seal-star {
  font-size: 26px;
  color: #fff0bd;
}

.seal-text {
  font-size: 16px;
  font-weight: 900;
  color: #ffffff;
  letter-spacing: 2px;
}

@keyframes dropSeal {
  0% { transform: scale(2.2); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
</style>
