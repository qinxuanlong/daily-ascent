<template>
  <div class="card">
    <div class="card-title">📋 今日打卡</div>

    <!-- 已打卡状态 -->
    <div v-if="todayLog" class="checked-in-banner">
      <div class="check-icon">✅</div>
      <div class="check-text">今天已打卡</div>
      <div style="margin-top: 8px; font-size: 13px; color: var(--text-secondary);">
        {{ todayLog.overload ? '💤 过载模式' : '📝 正常打卡' }}
        · {{ todayLog.output }}
      </div>
    </div>

    <!-- 打卡表单 -->
    <template v-else>
      <div class="form-group">
        <label>当前主线</label>
        <div style="font-size: 16px; font-weight: 600; color: var(--highlight);">
          {{ LINE_ICONS[weekLine] || '🎯' }} {{ weekLine || '未选定' }}
        </div>
      </div>

      <div class="form-group">
        <label>今晚产出是什么？</label>
        <input
          v-model="output"
          class="form-input"
          placeholder="写完商品详情页 / 写了 200 字..."
        />
      </div>

      <div class="form-group">
        <label>今天练到了什么？（技能卡，可选）</label>
        <input
          v-model="skill"
          class="form-input"
          placeholder="学会了 XX / 发现了 XX..."
        />
      </div>

      <div class="btn-group">
        <button class="btn btn-success" @click="handleCheckIn(false)" :disabled="!output.trim()">
          ✅ 正常打卡
        </button>
        <button class="btn btn-warning" @click="handleCheckIn(true)">
          💤 过载模式
        </button>
      </div>
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

// 提交打卡：支持正常打卡与过载模式
function handleCheckIn(overload) {
  const content = overload ? (output.value.trim() || '过载挂机') : output.value.trim()
  emit('checkin', {
    output: content,
    skill: skill.value.trim(),
    overload
  })
  output.value = ''
  skill.value = ''
}
</script>
