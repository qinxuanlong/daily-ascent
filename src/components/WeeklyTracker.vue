<template>
  <div class="weekly-card">
    <!-- 卡片顶部信息行 -->
    <div class="weekly-header">
      <div class="streak-title">
        <span class="header-star">✦</span>
        <span>已连续签到 <strong class="streak-num">{{ streak }}</strong> 天</span>
      </div>

      <div class="header-right">
        <!-- 今日日期标签 -->
        <span class="today-badge">
          <span class="cal-icon">📅</span>
          今日 {{ todayShort }}
        </span>
        <!-- 查看历史记录快捷按钮（响应用户首页轻量化需求） -->
        <button
          class="history-quick-btn"
          title="查看完整打卡历史记录"
          @click="$emit('open-history')"
        >
          <span>记录</span>
          <span class="arrow">&gt;</span>
        </button>
      </div>
    </div>

    <!-- 7 天打卡状态行 -->
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
        <!-- 星期几简称 -->
        <span class="day-name">{{ day.name }}</span>

        <!-- 签到徽章 -->
        <div class="day-badge-wrap">
          <!-- 已签到：温润金色原石星芒徽章 -->
          <div v-if="checkedDates.includes(day.dateStr)" class="badge-checked">
            <span class="primogem-star">✦</span>
          </div>

          <!-- 今天且尚未打卡：金圈微光高亮 -->
          <div v-else-if="day.dateStr === todayDate" class="badge-today-pending">
            <span class="primogem-star pending-star">✦</span>
          </div>

          <!-- 普通未打卡日期：深邃淡蓝星芒 -->
          <div v-else class="badge-normal">
            <span class="primogem-star dim-star">✦</span>
          </div>
        </div>

        <!-- 日期号数 -->
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

defineEmits(['open-history'])

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
  margin: 6px auto 24px;
  padding: 14px 16px 16px;
  background: rgba(14, 25, 52, 0.72);
  border: 1px solid rgba(160, 200, 255, 0.22);
  border-radius: 16px;
  backdrop-filter: blur(16px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
  user-select: none;
}

.weekly-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.streak-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  letter-spacing: 0.5px;
}

.header-star {
  color: #f3d882;
  font-size: 15px;
  filter: drop-shadow(0 0 6px rgba(243, 216, 130, 0.8));
}

.streak-num {
  color: #f3d882;
  font-size: 16px;
  font-weight: 800;
  margin: 0 2px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.today-badge {
  font-size: 11px;
  color: #a4bede;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 3px 9px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.cal-icon {
  font-size: 11px;
}

.history-quick-btn {
  background: rgba(243, 216, 130, 0.12);
  border: 1px solid rgba(243, 216, 130, 0.3);
  border-radius: 12px;
  color: #f3d882;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 2px;
  transition: all 0.2s ease;
}

.history-quick-btn:hover {
  background: rgba(243, 216, 130, 0.24);
  border-color: rgba(243, 216, 130, 0.6);
  transform: translateY(-1px);
}

.history-quick-btn .arrow {
  font-size: 10px;
}

/* 7天展示网格 */
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
  gap: 6px;
}

.day-name {
  font-size: 11px;
  color: #8da2c0;
  font-weight: 500;
}

/* 徽章容器 */
.day-badge-wrap {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 已打卡金色星芒徽章 */
.badge-checked {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: radial-gradient(circle, #f5d47a 0%, #d4a340 70%, #996e1a 100%);
  border: 1.5px solid #fff5cc;
  box-shadow: 0 0 12px rgba(245, 212, 122, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
}

.badge-checked .primogem-star {
  color: #ffffff;
  font-size: 15px;
  font-weight: 900;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
}

/* 当天未签到 */
.badge-today-pending {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(26, 42, 75, 0.65);
  border: 1.5px solid #f3d882;
  box-shadow: 0 0 10px rgba(243, 216, 130, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
}

.pending-star {
  color: #f3d882;
  font-size: 13px;
}

/* 普通未签到 */
.badge-normal {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(20, 32, 60, 0.5);
  border: 1px solid rgba(160, 200, 255, 0.16);
  display: flex;
  align-items: center;
  justify-content: center;
}

.dim-star {
  color: #b0d4f1;
  font-size: 13px;
  opacity: 0.75;
}

.day-num {
  font-size: 11px;
  color: #8da2c0;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}

.day-col.is-today .day-num {
  color: #f3d882;
  font-weight: 700;
}
</style>
