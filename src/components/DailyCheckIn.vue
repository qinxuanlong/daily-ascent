<template>
  <div class="clean-card">
    <div class="card-header">
      <span class="card-title-text">📋 今日打卡</span>
      <span v-if="weekLine" class="tag-badge">
        {{ LINE_ICONS[weekLine] || '🎯' }} {{ weekLine }}
      </span>
    </div>

    <!-- 已打卡完成状态 -->
    <div v-if="todayLog" class="done-banner">
      <div class="done-icon">✨</div>
      <div class="done-title">今日打卡已完成</div>
      <div class="done-desc">
        {{ todayLog.overload ? '💤 挂机模式' : '📝 正常产出' }}：{{ todayLog.output }}
      </div>
    </div>

    <!-- 打卡表单 -->
    <template v-else>
      <input
        v-model="output"
        class="input-box"
        placeholder="今晚做了什么微产出？（写完一页、改好标题等）"
        @keyup.enter="handleCheckIn(false)"
      />

      <input
        v-model="skill"
        class="input-box"
        placeholder="学到了什么（技能卡，可选）"
        style="margin-bottom: 16px;"
      />

      <button
        class="btn-primary-block"
        :disabled="!output.trim()"
        @click="handleCheckIn(false)"
      >
        完成打卡 (+1⭐ 经验)
      </button>

      <button
        class="btn-subtle-link"
        @click="handleCheckIn(true)"
      >
        💤 今天状态欠佳？一键过载挂机通关 (+1💤)
      </button>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { LINE_ICONS } from '../data/stages.js'

defineProps({
  weekLine: { type: String, default: '' },
  todayLog: { type: Object, default: null }
})

const emit = defineEmits(['checkin'])
const output = ref('')
const skill = ref('')

function handleCheckIn(overload) {
  const content = overload ? (output.value.trim() || '过载挂机') : output.value.trim()
  if (!overload && !content) return

  emit('checkin', {
    output: content,
    skill: skill.value.trim(),
    overload
  })
  output.value = ''
  skill.value = ''
}
</script>
