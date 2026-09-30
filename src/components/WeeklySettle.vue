<template>
  <div class="clean-card">
    <div class="card-header">
      <span class="card-title-text">📊 周日成就结算</span>
    </div>

    <!-- 已结算 -->
    <div v-if="settled" class="done-banner">
      <div class="done-icon">📊</div>
      <div class="done-title">本周已圆满结算</div>
      <div class="done-desc">
        下周主线：{{ settledInfo?.nextLine }} · 下一步：{{ settledInfo?.nextStep || '开动！' }}
      </div>
    </div>

    <template v-else>
      <!-- 极简 4 格成就指标 -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px;">
        <div style="padding: 12px; background: rgba(0,0,0,0.2); border-radius: var(--radius-sm); text-align: center;">
          <div style="font-size: 20px; font-weight: 700; color: #fff;">{{ weekStats.checkIns }}</div>
          <div style="font-size: 11px; color: var(--text-dim); margin-top: 2px;">打卡次数</div>
        </div>
        <div style="padding: 12px; background: rgba(0,0,0,0.2); border-radius: var(--radius-sm); text-align: center;">
          <div style="font-size: 20px; font-weight: 700; color: #fff;">{{ weekStats.streak }} 天</div>
          <div style="font-size: 11px; color: var(--text-dim); margin-top: 2px;">当前连击</div>
        </div>
        <div style="padding: 12px; background: rgba(0,0,0,0.2); border-radius: var(--radius-sm); text-align: center;">
          <div style="font-size: 14px; font-weight: 600; color: #fff; line-height: 28px;">{{ LINE_ICONS[weekStats.line] }} {{ weekStats.line || '无' }}</div>
          <div style="font-size: 11px; color: var(--text-dim); margin-top: 2px;">本周主线</div>
        </div>
        <div style="padding: 12px; background: rgba(0,0,0,0.2); border-radius: var(--radius-sm); text-align: center;">
          <div style="font-size: 20px; font-weight: 700; color: #fff;">{{ weekStats.stageProgress }}/6</div>
          <div style="font-size: 11px; color: var(--text-dim); margin-top: 2px;">关卡进度</div>
        </div>
      </div>

      <!-- 选择下周主线 -->
      <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">锁定下周主线</div>
      <div style="display: flex; gap: 8px; margin-bottom: 14px;">
        <div
          v-for="line in LINE_NAMES"
          :key="line"
          style="flex: 1; padding: 10px 4px; text-align: center; border-radius: var(--radius-sm); border: 1px solid var(--border); background: rgba(0,0,0,0.2); cursor: pointer;"
          :style="nextLine === line ? 'border-color: #3b82f6; background: rgba(59,130,246,0.1);' : ''"
          @click="nextLine = line"
        >
          <div style="font-size: 18px;">{{ LINE_ICONS[line] }}</div>
          <div style="font-size: 12px; color: #fff; margin-top: 2px;">{{ line }}</div>
        </div>
      </div>

      <!-- 下周启动第一步 -->
      <input
        v-model="nextStep"
        class="input-box"
        placeholder="下周一打开做哪件微小动作？"
      />

      <button
        class="btn-primary-block"
        :disabled="!nextLine"
        @click="confirmSettle"
      >
        📊 完成本周结算，沉淀成就感
      </button>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { LINE_NAMES, LINE_ICONS } from '../data/stages.js'

defineProps({
  weekStats: {
    type: Object,
    default: () => ({ checkIns: 0, streak: 0, line: '', stageProgress: 0 })
  },
  settled: { type: Boolean, default: false },
  settledInfo: { type: Object, default: null }
})

const emit = defineEmits(['settle'])
const nextLine = ref('')
const nextStep = ref('')

function confirmSettle() {
  if (!nextLine.value) return
  emit('settle', {
    nextLine: nextLine.value,
    nextStep: nextStep.value.trim()
  })
}
</script>
