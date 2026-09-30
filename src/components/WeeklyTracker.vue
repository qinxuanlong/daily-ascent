<template>
  <div class="weekly-card">
    <div class="weekly-header">
      <span class="streak-text">
        <span class="fire-icon">🔥</span>
        已连续签到 <span class="streak-number">{{ streak }}</span> 天
      </span>
      <span class="today-tag">今日 ✦ {{ todayShort }}</span>
    </div>

    <!-- 7 天打卡圆环列表 -->
    <div class="days-row">
      <div
        v-for="day in weekDays"
        :key="day.dateStr"
        class="day-col"
        :class="{
          'is-today': day.dateStr === todayDate,
          'is-checked': checkedDates.includes(day.dateStr)
        }"
      >
        <span class="day-name">{{ day.name }}</span>

        <div class="day-circle">
          <!-- 已签到：金色星芒勾 -->
          <span v-if="checkedDates.includes(day.dateStr)" class="check-icon">✦</span>
          <!-- 当天未签到：柔和脉动圆点 -->
          <span v-else-if="day.dateStr === todayDate" class="today-dot" />
          <!-- 其他未签到日期 -->
          <span v-else class="empty-dash">·</span>
        </div>

        <span class="day-num">{{ day.dayNum }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getCurrentWeekDays, getGameDate } from '../utils/date.js'

const props = defineProps({
  streak: { type: Number, default: 0 },
  checkedDates: { type: Array, default: () => [] }
})

const todayDate = computed(() => getGameDate())
const weekDays = computed(() => getCurrentWeekDays())

const todayShort = computed(() => {
  const parts = todayDate.value.split('-')
  return `${parts[1]}月${parts[2]}日`
})
</script>

<style scoped>
.weekly-card {
  width: 100%;
  max-width: 400px;
  margin: 0 auto 16px;
  padding: 14px 16px;
  background: rgba(18, 24, 42, 0.65);
  border: 1px solid rgba(243, 216, 130, 0.25);
  border-radius: 16px;
  backdrop-filter: blur(16px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
  user-select: none;
}

.weekly-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 13px;
}

.streak-text {
  color: #f7f7f8;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.fire-icon {
  font-size: 14px;
}

.streak-number {
  color: #f3d882;
  font-weight: 700;
  font-size: 16px;
  margin: 0 2px;
}

.today-tag {
  font-size: 12px;
  color: #9ba8c2;
  background: rgba(255, 255, 255, 0.05);
  padding: 2px 8px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.days-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
  text-align: center;
}

.day-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.day-name {
  font-size: 11px;
  color: #8392af;
  font-weight: 500;
}

.day-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(25, 34, 58, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
}

/* 已打卡圆球：金色发光 */
.day-col.is-checked .day-circle {
  background: radial-gradient(circle, #f3d882 0%, #c9932d 100%);
  border-color: #ffe699;
  box-shadow: 0 0 10px rgba(243, 216, 130, 0.6);
}

.check-icon {
  color: #3b2203;
  font-size: 13px;
  font-weight: 800;
}

/* 今日（未打卡）：高亮金边脉冲 */
.day-col.is-today:not(.is-checked) .day-circle {
  border-color: #f3d882;
  box-shadow: 0 0 8px rgba(243, 216, 130, 0.45);
  background: rgba(45, 56, 88, 0.7);
}

.today-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #f3d882;
  box-shadow: 0 0 6px #f3d882;
}

.empty-dash {
  color: rgba(131, 146, 175, 0.4);
  font-size: 14px;
}

.day-num {
  font-size: 11px;
  color: #9ba8c2;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}

.day-col.is-today .day-num {
  color: #f3d882;
  font-weight: 600;
}
</style>
