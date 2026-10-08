<template>
  <div class="history-view">
    <!-- 1. 顶部成果资产大盘 (The Asset Vault) -->
    <div class="asset-vault-card">
      <div class="vault-top-row">
        <div class="vault-title-group">
          <span class="vault-star">✦</span>
          <div>
            <h3 class="vault-title">成果资产陈列馆</h3>
            <p class="vault-subtitle">真金白银的专注心流 · 每日产出复利积累</p>
          </div>
        </div>

        <!-- 一键复制今日复盘简报按钮 -->
        <button class="copy-report-btn" title="一键复制今日 Markdown 复盘简报" @click="handleCopyReport">
          <AppIcon name="copy" :size="14" />
          <span>复制今日成果简报</span>
        </button>
      </div>

      <!-- 核心资产指标四宫格 (专注时长、真实成果、补记条数、连续心流) -->
      <div class="vault-metrics-grid">
        <div class="metric-box">
          <div class="metric-icon-wrap duration-wrap">
            <AppIcon name="clock" :size="18" />
          </div>
          <div class="metric-text-stack">
            <span class="metric-value">{{ formatDurationText(todayFocusMinutes) }}</span>
            <span class="metric-label">今日专注投入</span>
          </div>
        </div>

        <div class="metric-box">
          <div class="metric-icon-wrap outcome-wrap">
            <AppIcon name="sparkles" :size="18" />
          </div>
          <div class="metric-text-stack">
            <span class="metric-value">{{ todayRealCount }}<small>条</small></span>
            <span class="metric-label">今日真实成果</span>
          </div>
        </div>

        <div class="metric-box">
          <div class="metric-icon-wrap manual-wrap">
            <AppIcon name="edit" :size="18" />
          </div>
          <div class="metric-text-stack">
            <span class="metric-value">{{ todayManualCount }}<small>条</small></span>
            <span class="metric-label">今日补记条数</span>
          </div>
        </div>

        <div class="metric-box">
          <div class="metric-icon-wrap streak-wrap">
            <AppIcon name="flame" :size="18" />
          </div>
          <div class="metric-text-stack">
            <span class="metric-value">{{ streak }}<small>天</small></span>
            <span class="metric-label">连续打卡心流</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. 本周打卡状态星轨矩阵 (仅真实有效专注方可点亮) -->
    <div class="week-matrix-card">
      <div class="matrix-header">
        <span class="matrix-title">本周星芒矩阵</span>
        <span class="matrix-tip">周一至周日 · 仅真实专注点亮</span>
      </div>
      <div class="week-days-row">
        <div
          v-for="day in weekDays"
          :key="day.dateStr"
          class="day-node"
          :class="{
            'is-checked': checkedDates.has(day.dateStr),
            'is-today': day.dateStr === todayStr
          }"
        >
          <div class="node-crest">
            <span class="node-star">✦</span>
          </div>
          <span class="node-label">{{ day.name }}</span>
          <span class="node-date">{{ day.dayNum }}</span>
        </div>
      </div>
    </div>

    <!-- 3. 高质感成果时光轴 (Outcome Timeline) -->
    <div class="logs-timeline-section">
      <div class="timeline-header">
        <div class="timeline-title-group">
          <h3 class="section-title">成果时光轴</h3>
          <span class="section-count">共积累 {{ sortedLogs.length }} 条成果资产</span>
        </div>
      </div>

      <div v-if="sortedLogs.length === 0" class="empty-logs">
        <span class="empty-sparkle">✦</span>
        <p>暂无成果资产，开启一次 25 分钟专注，沉淀你的第一块成果吧！</p>
      </div>

      <div v-else class="timeline-list">
        <div
          v-for="log in sortedLogs"
          :key="log.id"
          class="outcome-card-item"
          :class="{ 'is-manual-card': log.source === 'manual' }"
        >
          <!-- 左侧时间线光柱指示 -->
          <div class="timeline-indicator">
            <div class="indicator-dot" :class="{ 'manual-dot': log.source === 'manual' }"></div>
            <div class="indicator-line"></div>
          </div>

          <!-- 右侧卡片主体 -->
          <div class="outcome-card-body">
            <div class="card-top-bar">
              <div class="time-meta-row">
                <span class="item-date">{{ log.date }}</span>
                <span class="item-time">{{ log.time }}</span>

                <!-- 来源类型标签 -->
                <span
                  class="source-badge"
                  :class="log.source === 'manual' ? 'badge-manual' : 'badge-focus'"
                >
                  {{ log.source === 'manual' ? '补记' : '心流' }}
                </span>

                <!-- 真实专注时长标签 (仅 focus 存在) -->
                <span v-if="log.source === 'focus' && log.durationMinutes" class="duration-chip">
                  <AppIcon name="clock" :size="11" />
                  <span>{{ log.durationMinutes }}m 专注</span>
                </span>

                <!-- 产出量化计数 (若有) -->
                <span v-if="log.quantity" class="quantity-chip">
                  <span>{{ log.quantity }}</span>
                </span>
              </div>

              <div class="card-top-right">
                <span class="exp-badge" :class="{ 'zero-exp': log.source === 'manual' }">
                  +{{ log.exp || 0 }} EXP
                </span>
                <button
                  class="log-delete-btn"
                  title="删除此条成果 (自动重算经验)"
                  @click="handleDelete(log.id)"
                >
                  <AppIcon name="trash" :size="13" />
                </button>
              </div>
            </div>

            <!-- 目标/任务标题 -->
            <div v-if="log.todoTitle" class="item-target-title">
              <AppIcon name="target" :size="13" />
              <span>目标：{{ log.todoTitle }}</span>
            </div>

            <!-- 核心成果沉淀内容 -->
            <div class="outcome-quote-box">
              <p class="outcome-text">
                {{ log.note }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CheckInLog } from '../types'
import { getCurrentWeekDays, getGameDate } from '../utils/date'
import AppIcon from './AppIcon.vue'

const props = defineProps<{
  logs: CheckInLog[]
  streak: number
  maxStreak: number
}>()

const emit = defineEmits<{
  (e: 'delete-log', id: string): void
  (e: 'toast', message: string): void
}>()

const todayStr = computed(() => getGameDate())
const weekDays = computed(() => getCurrentWeekDays())

// 过滤掉已软删除的记录
const activeLogs = computed(() => props.logs.filter((log) => !log.deleted))

// 本周矩阵严格规则：仅有真实有效专注 (source === 'focus' 且时长 >= 5m) 的日期才可点亮
const checkedDates = computed(() => {
  return new Set(
    activeLogs.value
      .filter((log) => log.source === 'focus' && (log.durationMinutes || 0) >= 5)
      .map((log) => log.date)
  )
})

const todayLogs = computed(() => {
  return activeLogs.value.filter((log) => log.date === todayStr.value)
})

// 今日专注投入时长 (仅统计 focus 真实专注)
const todayFocusMinutes = computed(() => {
  return todayLogs.value
    .filter((log) => log.source === 'focus')
    .reduce((acc, cur) => acc + (cur.durationMinutes || 0), 0)
})

// 今日真实成果条数
const todayRealCount = computed(() => {
  return todayLogs.value.filter((log) => log.source === 'focus').length
})

// 今日补记备忘条数
const todayManualCount = computed(() => {
  return todayLogs.value.filter((log) => log.source === 'manual').length
})

function formatDurationText(mins: number): string {
  if (mins < 60) return `${mins}m`
  const h = (mins / 60).toFixed(1)
  return `${h}h`
}

const sortedLogs = computed(() => {
  return [...activeLogs.value].sort((a, b) => {
    const timeA = `${a.date} ${a.time || ''}`
    const timeB = `${b.date} ${b.time || ''}`
    return timeB.localeCompare(timeA)
  })
})

function handleDelete(id: string) {
  if (window.confirm('确定要删除这条成果资产记录吗？删除后对应的经验与统计将自动重新核算。')) {
    emit('delete-log', id)
  }
}

// 一键复制今日 Markdown 复盘简报 (明确标注 [专注 Xm] 与 [补记])
function handleCopyReport() {
  if (todayLogs.value.length === 0) {
    emit('toast', '今日尚未沉淀成果，先开启一次专注吧 ✦')
    return
  }

  const lines = [
    `# 📅 Daily Ascent 成果简报 · ${todayStr.value}`,
    `- **今日总专注时长**：${todayFocusMinutes.value} 分钟 (${formatDurationText(todayFocusMinutes.value)})`,
    `- **真实沉淀成果**：${todayRealCount.value} 条${todayManualCount.value > 0 ? ` (另有 ${todayManualCount.value} 条补记)` : ''}`,
    `- **连续打卡心流**：${props.streak} 天`,
    '',
    '## ✦ 今日成果清单'
  ]

  todayLogs.value.forEach((item, idx) => {
    const tag = item.source === 'manual' ? '[补记]' : `[专注 ${item.durationMinutes || 0}m]`
    const qty = item.quantity ? `(${item.quantity}) ` : ''
    lines.push(`${idx + 1}. ${tag} **${item.todoTitle || '专注任务'}** ${qty}`)
    lines.push(`   > ${item.note}`)
  })

  lines.push('', '---', '*Daily Ascent · 有产出就是升级*')

  const reportText = lines.join('\n')

  if (navigator?.clipboard?.writeText) {
    navigator.clipboard.writeText(reportText).then(() => {
      emit('toast', '已复制今日成果复盘简报 ✦ 可直接粘贴至Obsidian/周报')
    }).catch(() => {
      emit('toast', '复制失败，请重试')
    })
  } else {
    emit('toast', '当前浏览器不支持自动复制')
  }
}
</script>

<style scoped>
.history-view {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* 顶部成果资产大盘 */
.asset-vault-card {
  background: linear-gradient(165deg, rgba(16, 29, 60, 0.85) 0%, rgba(9, 17, 38, 0.95) 100%);
  border: 1px solid rgba(243, 216, 130, 0.35);
  border-radius: 20px;
  padding: 18px 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(14px);
}

.vault-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.vault-title-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.vault-star {
  font-size: 18px;
  color: #f3d882;
  filter: drop-shadow(0 0 6px rgba(243, 216, 130, 0.8));
}

.vault-title {
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
}

.vault-subtitle {
  font-size: 11px;
  color: #9ab2d5;
}

.copy-report-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(243, 216, 130, 0.15);
  border: 1px solid rgba(243, 216, 130, 0.4);
  color: #fff0bd;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.copy-report-btn:hover {
  background: rgba(243, 216, 130, 0.28);
  border-color: #f3d882;
  transform: translateY(-1px);
}

.vault-metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.metric-box {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.metric-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.duration-wrap {
  background: rgba(94, 234, 212, 0.15);
  color: #5eead4;
  border: 1px solid rgba(94, 234, 212, 0.3);
}

.outcome-wrap {
  background: rgba(243, 216, 130, 0.15);
  color: #f3d882;
  border: 1px solid rgba(243, 216, 130, 0.3);
}

.streak-wrap {
  background: rgba(252, 165, 165, 0.15);
  color: #fca5a5;
  border: 1px solid rgba(252, 165, 165, 0.3);
}

.metric-text-stack {
  display: flex;
  flex-direction: column;
}

.metric-value {
  font-size: 16px;
  font-weight: 800;
  color: #ffffff;
}

.metric-value small {
  font-size: 11px;
  font-weight: normal;
  color: #9ab2d5;
  margin-left: 2px;
}

.metric-label {
  font-size: 10px;
  color: #657b9e;
}

/* 周矩阵卡片 */
.week-matrix-card {
  background: rgba(14, 25, 52, 0.7);
  border: 1px solid rgba(243, 216, 130, 0.25);
  border-radius: 16px;
  padding: 14px 16px;
  backdrop-filter: blur(12px);
}

.matrix-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.matrix-title {
  font-size: 13px;
  font-weight: 700;
  color: #fff0bd;
}

.matrix-tip {
  font-size: 11px;
  color: #657b9e;
}

.week-days-row {
  display: flex;
  justify-content: space-between;
  gap: 4px;
}

.day-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.node-crest {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.node-star {
  font-size: 11px;
  color: #657b9e;
}

.day-node.is-checked .node-crest {
  background: rgba(243, 216, 130, 0.2);
  border-color: #f3d882;
  box-shadow: 0 0 10px rgba(243, 216, 130, 0.45);
}

.day-node.is-checked .node-star {
  color: #f3d882;
  filter: drop-shadow(0 0 4px #f3d882);
}

.day-node.is-today .node-crest {
  border-color: #5eead4;
}

.node-label {
  font-size: 10px;
  color: #9ab2d5;
}

.node-date {
  font-size: 11px;
  font-weight: 600;
  color: #ffffff;
}

/* 时光轴 */
.logs-timeline-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-size: 15px;
  font-weight: 700;
  color: #ffffff;
}

.section-count {
  font-size: 12px;
  color: #657b9e;
}

.empty-logs {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #657b9e;
  gap: 8px;
}

.empty-sparkle {
  font-size: 24px;
  color: #f3d882;
  opacity: 0.5;
}

.timeline-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.outcome-card-item {
  display: flex;
  gap: 12px;
  background: rgba(14, 25, 52, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 14px 16px;
  backdrop-filter: blur(12px);
  transition: all 0.2s ease;
}

.outcome-card-item:hover {
  border-color: rgba(243, 216, 130, 0.35);
  background: rgba(16, 29, 60, 0.85);
}

.timeline-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 4px;
}

.indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f3d882;
  box-shadow: 0 0 8px #f3d882;
}

.indicator-line {
  flex: 1;
  width: 1px;
  background: rgba(243, 216, 130, 0.2);
  margin-top: 4px;
}

.outcome-card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.time-meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.item-date {
  font-size: 13px;
  font-weight: 700;
  color: #ffffff;
}

.item-time {
  font-size: 11px;
  color: #9ab2d5;
}

.duration-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  color: #5eead4;
  background: rgba(94, 234, 212, 0.15);
  border: 1px solid rgba(94, 234, 212, 0.3);
  padding: 2px 7px;
  border-radius: 8px;
}

.quantity-chip {
  font-size: 11px;
  color: #fff0bd;
  background: rgba(243, 216, 130, 0.15);
  padding: 2px 7px;
  border-radius: 8px;
  font-weight: 600;
}

.card-top-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.exp-badge {
  font-size: 10px;
  font-weight: 700;
  background: rgba(243, 216, 130, 0.15);
  color: #f3d882;
  padding: 2px 6px;
  border-radius: 8px;
}

.log-delete-btn {
  background: transparent;
  border: none;
  color: #657b9e;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.log-delete-btn:hover {
  color: #f87171;
  background: rgba(239, 68, 68, 0.15);
}

.item-target-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #5eead4;
  font-weight: 600;
}

.outcome-quote-box {
  background: rgba(0, 0, 0, 0.25);
  border-left: 3px solid #f3d882;
  padding: 8px 12px;
  border-radius: 0 8px 8px 0;
}

.source-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 6px;
  letter-spacing: 0.5px;
}

.badge-focus {
  background: rgba(94, 234, 212, 0.2);
  color: #5eead4;
  border: 1px solid rgba(94, 234, 212, 0.35);
}

.badge-manual {
  background: rgba(100, 116, 139, 0.25);
  color: #94a3b8;
  border: 1px solid rgba(100, 116, 139, 0.35);
}

.zero-exp {
  opacity: 0.5;
  background: rgba(100, 116, 139, 0.15) !important;
  color: #94a3b8 !important;
}

.manual-wrap {
  background: rgba(148, 163, 184, 0.15) !important;
  color: #94a3b8 !important;
}

.is-manual-card {
  opacity: 0.85;
  border-color: rgba(100, 116, 139, 0.2) !important;
}

.manual-dot {
  background: #64748b !important;
  box-shadow: 0 0 6px rgba(100, 116, 139, 0.5) !important;
}
</style>
