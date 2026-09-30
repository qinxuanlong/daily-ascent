<template>
  <div class="card">
    <div class="card-title">📊 本周结算</div>

    <!-- 已结算 -->
    <div v-if="settled" class="checked-in-banner">
      <div class="check-icon">📊</div>
      <div class="check-text">本周已结算</div>
      <div style="margin-top: 8px; font-size: 13px; color: var(--text-secondary);">
        下周主线已锚定：{{ settledInfo?.nextLine }} · 下一步：{{ settledInfo?.nextStep || '未填写' }}
      </div>
    </div>

    <template v-else>
      <!-- 成就面板 -->
      <div class="settle-grid">
        <div class="settle-stat">
          <div class="value">{{ weekStats.checkIns }}</div>
          <div class="label">本周打卡次数</div>
        </div>
        <div class="settle-stat">
          <div class="value">{{ weekStats.streak }}</div>
          <div class="label">当前连击</div>
        </div>
        <div class="settle-stat">
          <div class="value">{{ LINE_ICONS[weekStats.line] || '🎯' }} {{ weekStats.line || '无' }}</div>
          <div class="label">本周主线</div>
        </div>
        <div class="settle-stat">
          <div class="value">{{ weekStats.stageProgress }}/6</div>
          <div class="label">关卡进度</div>
        </div>
      </div>

      <!-- 本周新获得徽章 -->
      <div v-if="weekStats.newBadges && weekStats.newBadges.length" style="margin-top: 14px;">
        <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 8px;">🏅 本周新获得徽章</div>
        <div class="badge-grid">
          <div v-for="b in weekStats.newBadges" :key="b" class="badge-item unlocked">
            <span class="badge-icon">{{ getBadgeDef(b)?.icon }}</span>
            <span class="badge-name">{{ getBadgeDef(b)?.name }}</span>
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <!-- 下周主线选择 -->
      <div style="margin-bottom: 12px;">
        <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 8px;">🎯 选择下周主线</div>
        <div class="line-cards">
          <div
            v-for="line in LINE_NAMES"
            :key="line"
            class="line-card"
            :class="{ selected: nextLine === line }"
            @click="nextLine = line"
          >
            <div class="line-icon">{{ LINE_ICONS[line] }}</div>
            <div class="line-name">{{ line }}</div>
          </div>
        </div>
      </div>

      <!-- 下周第一步 -->
      <div class="form-group">
        <label>下周第一步</label>
        <input
          v-model="nextStep"
          class="form-input"
          placeholder="下周一打开要做哪件具体小事？"
        />
      </div>

      <button
        class="btn btn-primary"
        style="width: 100%;"
        @click="confirmSettle"
        :disabled="!nextLine"
      >
        📊 完成结算，获得满满成就感！
      </button>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { LINE_NAMES, LINE_ICONS } from '../data/stages.js'
import { getBadgeDef } from '../utils/badges.js'

defineProps({
  weekStats: {
    type: Object,
    default: () => ({ checkIns: 0, streak: 0, line: '', stageProgress: 0, newBadges: [] })
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
