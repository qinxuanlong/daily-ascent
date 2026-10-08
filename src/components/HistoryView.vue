<template>
  <div class="history-view">
    <!-- 1. 顶部统计大盘 -->
    <div class="stats-overview-grid">
      <div class="stat-box">
        <div class="stat-icon-wrap streak-wrap">
          <AppIcon name="flame" :size="20" />
        </div>
        <div class="stat-text-stack">
          <span class="stat-num">{{ streak }}<small>天</small></span>
          <span class="stat-name">当前连续打卡</span>
        </div>
      </div>

      <div class="stat-box">
        <div class="stat-icon-wrap max-wrap">
          <AppIcon name="sparkles" :size="20" />
        </div>
        <div class="stat-text-stack">
          <span class="stat-num">{{ maxStreak }}<small>天</small></span>
          <span class="stat-name">历史最高连击</span>
        </div>
      </div>

      <div class="stat-box">
        <div class="stat-icon-wrap total-wrap">
          <AppIcon name="history" :size="20" />
        </div>
        <div class="stat-text-stack">
          <span class="stat-num">{{ logs.length }}<small>次</small></span>
          <span class="stat-name">累计打卡次数</span>
        </div>
      </div>
    </div>

    <!-- 2. 本周打卡状态星轨矩阵 -->
    <div class="week-matrix-card">
      <div class="matrix-header">
        <span class="matrix-title">本周星芒打卡矩阵</span>
        <span class="matrix-tip">周一至周日 · 持续点亮</span>
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

    <!-- 3. 打卡流水时间轴列表 -->
    <div class="logs-timeline-section">
      <div class="timeline-header">
        <h3 class="section-title">历程流水记录</h3>
        <span class="section-count">共 {{ logs.length }} 条记录</span>
      </div>

      <div v-if="logs.length === 0" class="empty-logs">
        <span class="empty-sparkle">✦</span>
        <p>暂无打卡流水记录，今天就开始你的第一次攀升吧！</p>
      </div>

      <div v-else class="timeline-list">
        <div v-for="log in sortedLogs" :key="log.id" class="timeline-card">
          <div class="timeline-indicator">
            <div class="indicator-dot"></div>
            <div class="indicator-line"></div>
          </div>

          <div class="timeline-content">
            <div class="content-top">
              <span class="log-date">{{ log.date }}</span>
              <span class="log-time">{{ log.time }}</span>
              <span class="exp-badge">+{{ log.exp || 50 }} EXP</span>
              <button
                class="log-delete-btn"
                title="删除此条记录"
                @click="handleDelete(log.id)"
              >
                <AppIcon name="trash" :size="13" />
              </button>
            </div>

            <div v-if="log.todoTitle" class="log-todo-title">
              <AppIcon name="check" :size="13" />
              <span>{{ log.todoTitle }}</span>
            </div>

            <p v-if="log.note" class="log-note">
              {{ log.note }}
            </p>
            <p v-else class="log-note is-empty">
              (无心得备注)
            </p>
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
}>()

const todayStr = computed(() => getGameDate())
const weekDays = computed(() => getCurrentWeekDays())

const checkedDates = computed(() => {
  return new Set(props.logs.map((log) => log.date))
})

const sortedLogs = computed(() => {
  return [...props.logs].sort((a, b) => {
    const timeA = `${a.date} ${a.time || ''}`
    const timeB = `${b.date} ${b.time || ''}`
    return timeB.localeCompare(timeA)
  })
})

function handleDelete(id: string) {
  if (window.confirm('确定要删除这条打卡记录吗？删除后连击数可能会重新核算。')) {
    emit('delete-log', id)
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

/* 顶部统计卡 */
.stats-overview-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.stat-box {
  background: rgba(14, 25, 52, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 12px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
  backdrop-filter: blur(12px);
}

.stat-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.streak-wrap {
  background: rgba(252, 165, 165, 0.15);
  color: #fca5a5;
  border: 1px solid rgba(252, 165, 165, 0.3);
}

.max-wrap {
  background: rgba(243, 216, 130, 0.15);
  color: #f3d882;
  border: 1px solid rgba(243, 216, 130, 0.3);
}

.total-wrap {
  background: rgba(94, 234, 212, 0.15);
  color: #5eead4;
  border: 1px solid rgba(94, 234, 212, 0.3);
}

.stat-text-stack {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-num {
  font-size: 18px;
  font-weight: 800;
  color: #ffffff;
}

.stat-num small {
  font-size: 11px;
  font-weight: normal;
  color: #9ab2d5;
  margin-left: 2px;
}

.stat-name {
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

/* 时间轴 */
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
  gap: 10px;
}

.timeline-card {
  display: flex;
  gap: 12px;
  background: rgba(14, 25, 52, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 12px 14px;
  backdrop-filter: blur(12px);
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

.timeline-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.content-top {
  display: flex;
  align-items: center;
  gap: 8px;
}

.log-date {
  font-size: 13px;
  font-weight: 700;
  color: #ffffff;
}

.log-time {
  font-size: 11px;
  color: #9ab2d5;
}

.exp-badge {
  font-size: 10px;
  font-weight: 700;
  background: rgba(243, 216, 130, 0.15);
  color: #f3d882;
  padding: 2px 6px;
  border-radius: 8px;
  margin-left: auto;
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

.log-todo-title {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #5eead4;
  font-weight: 600;
}

.log-note {
  font-size: 12px;
  color: #9ab2d5;
  background: rgba(0, 0, 0, 0.2);
  padding: 6px 10px;
  border-radius: 8px;
  margin-top: 2px;
  line-height: 1.4;
}

.log-note.is-empty {
  font-style: italic;
  color: #657b9e;
  background: transparent;
  padding: 0;
}
</style>
