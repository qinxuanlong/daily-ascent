<template>
  <div class="logs-card">
    <div class="logs-header">
      <div class="title-wrap">
        <span class="star-accent">✦</span>
        <span class="title-text">最近打卡记录</span>
      </div>
      <span class="logs-count">共 {{ logs.length }} 条</span>
    </div>

    <!-- 记录列表 -->
    <div v-if="logs.length > 0" class="logs-list">
      <div
        v-for="log in displayedLogs"
        :key="log.id"
        class="log-item"
      >
        <div class="log-left">
          <div class="log-dot" />
          <div class="log-info">
            <div class="log-time">{{ log.date }} {{ log.time }}</div>
            <div class="log-note">{{ log.note || '每日打卡达成 ✦ 获得原石与经验' }}</div>
          </div>
        </div>

        <div class="log-right">
          <span class="exp-badge">+{{ log.exp || 50 }} EXP</span>
          <button
            class="del-btn"
            title="删除此记录"
            @click="$emit('delete-log', log.id)"
          >
            ×
          </button>
        </div>
      </div>
    </div>

    <!-- 空记录占位 -->
    <div v-else class="logs-empty">
      <span class="empty-icon">📜</span>
      <p class="empty-text">旅程刚刚启程，点击上方日曜光轮开启首次打卡吧！</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  logs: { type: Array, default: () => [] }
})

defineEmits(['delete-log'])

// 最多展示最近 15 条
const displayedLogs = computed(() => {
  return [...props.logs].slice(0, 15)
})
</script>

<style scoped>
.logs-card {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  padding: 14px 16px;
  background: rgba(18, 24, 42, 0.65);
  border: 1px solid rgba(243, 216, 130, 0.2);
  border-radius: 16px;
  backdrop-filter: blur(16px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
}

.logs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.title-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
}

.star-accent {
  color: #f3d882;
  font-size: 13px;
}

.title-text {
  font-size: 14px;
  font-weight: 600;
  color: #f7f7f8;
  letter-spacing: 0.5px;
}

.logs-count {
  font-size: 12px;
  color: #8392af;
}

.logs-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 280px;
  overflow-y: auto;
  padding-right: 4px;
}

/* 自定义轻量滚动条 */
.logs-list::-webkit-scrollbar {
  width: 4px;
}

.logs-list::-webkit-scrollbar-thumb {
  background: rgba(243, 216, 130, 0.3);
  border-radius: 4px;
}

.log-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  background: rgba(25, 34, 58, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  transition: all 0.2s ease;
}

.log-item:hover {
  background: rgba(35, 46, 75, 0.6);
  border-color: rgba(243, 216, 130, 0.25);
}

.log-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
}

.log-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #f3d882;
  box-shadow: 0 0 4px #f3d882;
  flex-shrink: 0;
}

.log-info {
  min-width: 0;
}

.log-time {
  font-size: 11px;
  color: #8392af;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}

.log-note {
  font-size: 13px;
  color: #e2e8f0;
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.log-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  margin-left: 8px;
}

.exp-badge {
  font-size: 12px;
  font-weight: 600;
  color: #f3d882;
  background: rgba(243, 216, 130, 0.12);
  padding: 2px 7px;
  border-radius: 8px;
  border: 1px solid rgba(243, 216, 130, 0.25);
}

.del-btn {
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 16px;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
  transition: color 0.2s ease;
}

.del-btn:hover {
  color: #ef4444;
}

.logs-empty {
  text-align: center;
  padding: 24px 12px;
  color: #8392af;
}

.empty-icon {
  font-size: 28px;
  display: block;
  margin-bottom: 8px;
  opacity: 0.8;
}

.empty-text {
  font-size: 12px;
  line-height: 1.6;
}
</style>
