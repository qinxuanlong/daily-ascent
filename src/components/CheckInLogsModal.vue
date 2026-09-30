<template>
  <div v-if="show" class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-card">
      <!-- 模态框顶部 -->
      <div class="modal-header">
        <div class="header-title-group">
          <span class="header-star">✦</span>
          <div>
            <h2 class="header-title">冒险打卡历程</h2>
            <div class="header-subtitle">共 {{ logs.length }} 条记录 · 累计获得 {{ totalExpEarned }} EXP</div>
          </div>
        </div>
        <button class="modal-close-btn" title="关闭" @click="$emit('close')">×</button>
      </div>

      <!-- 快速统计行 -->
      <div class="stats-bar">
        <div class="stat-item">
          <span class="stat-val">{{ streak }}</span>
          <span class="stat-lbl">当前连击(天)</span>
        </div>
        <div class="stat-divider" />
        <div class="stat-item">
          <span class="stat-val">{{ maxStreak }}</span>
          <span class="stat-lbl">最高连击(天)</span>
        </div>
        <div class="stat-divider" />
        <div class="stat-item">
          <span class="stat-val">{{ logs.length }}</span>
          <span class="stat-lbl">总打卡次数</span>
        </div>
      </div>

      <!-- 打卡记录列表 -->
      <div class="modal-body">
        <div v-if="logs.length > 0" class="logs-scroll-area">
          <div
            v-for="log in logs"
            :key="log.id"
            class="log-row"
          >
            <div class="log-left">
              <span class="log-star">✦</span>
              <div class="log-details">
                <div class="log-time-text">{{ log.date }} {{ log.time }}</div>
                <div class="log-note-text">{{ log.note || '每日打卡达成 ✦ 获得原石与经验' }}</div>
              </div>
            </div>

            <div class="log-right">
              <span class="exp-pill">+{{ log.exp || 50 }} EXP</span>
              <button
                class="log-delete-btn"
                title="删除记录"
                @click="$emit('delete-log', log.id)"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        <!-- 空数据占位 -->
        <div v-else class="empty-state">
          <span class="empty-icon">📜</span>
          <div class="empty-main">暂无打卡记录</div>
          <div class="empty-hint">点击首页日曜神环，开启属于你的冒险之旅吧！</div>
        </div>
      </div>

      <!-- 底部关闭按钮 -->
      <div class="modal-footer">
        <button class="footer-btn" @click="$emit('close')">返回主页</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  logs: { type: Array, default: () => [] },
  streak: { type: Number, default: 0 },
  maxStreak: { type: Number, default: 0 }
})

defineEmits(['close', 'delete-log'])

// 累计获得的经验
const totalExpEarned = computed(() => {
  return props.logs.reduce((sum, item) => sum + (item.exp || 50), 0)
})
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(4, 9, 22, 0.75);
  backdrop-filter: blur(12px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  animation: fadeIn 0.25s ease-out;
}

.modal-card {
  width: 100%;
  max-width: 440px;
  max-height: 85vh;
  background: linear-gradient(180deg, rgba(20, 32, 60, 0.95) 0%, rgba(12, 20, 42, 0.98) 100%);
  border: 1px solid rgba(243, 216, 130, 0.35);
  border-radius: 18px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(243, 216, 130, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px 14px;
  border-bottom: 1px solid rgba(243, 216, 130, 0.2);
}

.header-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-star {
  color: #f3d882;
  font-size: 20px;
  filter: drop-shadow(0 0 8px rgba(243, 216, 130, 0.8));
}

.header-title {
  font-size: 17px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 0.5px;
}

.header-subtitle {
  font-size: 11px;
  color: #9cb0d0;
  margin-top: 2px;
}

.modal-close-btn {
  background: transparent;
  border: none;
  color: #9cb0d0;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  padding: 4px;
  transition: color 0.2s;
}

.modal-close-btn:hover {
  color: #ffffff;
}

/* 统计条 */
.stats-bar {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 12px 16px;
  background: rgba(10, 16, 35, 0.55);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-val {
  font-size: 18px;
  font-weight: 800;
  color: #f3d882;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}

.stat-lbl {
  font-size: 10px;
  color: #8da2c0;
  margin-top: 2px;
}

.stat-divider {
  width: 1px;
  height: 24px;
  background: rgba(255, 255, 255, 0.1);
}

/* 模态框主体滚动区 */
.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 14px 18px;
  min-height: 200px;
  max-height: 48vh;
}

.modal-body::-webkit-scrollbar {
  width: 5px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: rgba(243, 216, 130, 0.3);
  border-radius: 4px;
}

.logs-scroll-area {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.log-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: rgba(24, 38, 70, 0.45);
  border: 1px solid rgba(243, 216, 130, 0.16);
  border-radius: 12px;
  transition: all 0.2s;
}

.log-row:hover {
  background: rgba(32, 50, 92, 0.65);
  border-color: rgba(243, 216, 130, 0.4);
}

.log-left {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.log-star {
  color: #f3d882;
  font-size: 12px;
  margin-top: 2px;
  flex-shrink: 0;
}

.log-details {
  min-width: 0;
}

.log-time-text {
  font-size: 11px;
  color: #8da2c0;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}

.log-note-text {
  font-size: 13px;
  color: #edf2f9;
  margin-top: 3px;
  word-break: break-all;
}

.log-right {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 10px;
  flex-shrink: 0;
}

.exp-pill {
  font-size: 11px;
  font-weight: 700;
  color: #f3d882;
  background: rgba(243, 216, 130, 0.14);
  border: 1px solid rgba(243, 216, 130, 0.35);
  padding: 2px 8px;
  border-radius: 10px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}

.log-delete-btn {
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 18px;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
  transition: color 0.2s;
}

.log-delete-btn:hover {
  color: #ef4444;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 36px 12px;
  color: #8da2c0;
}

.empty-icon {
  font-size: 38px;
  margin-bottom: 8px;
  display: block;
  opacity: 0.85;
}

.empty-main {
  font-size: 14px;
  font-weight: 600;
  color: #e2e8f0;
}

.empty-hint {
  font-size: 12px;
  color: #7b8ea8;
  margin-top: 6px;
  line-height: 1.5;
}

/* 底部操作 */
.modal-footer {
  padding: 12px 20px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  justify-content: flex-end;
}

.footer-btn {
  padding: 8px 22px;
  border-radius: 20px;
  background: rgba(243, 216, 130, 0.15);
  border: 1px solid rgba(243, 216, 130, 0.4);
  color: #f3d882;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.footer-btn:hover {
  background: rgba(243, 216, 130, 0.28);
  border-color: rgba(243, 216, 130, 0.7);
  transform: translateY(-1px);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleUp {
  from {
    opacity: 0;
    transform: scale(0.94);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
