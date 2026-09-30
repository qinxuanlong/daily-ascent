<template>
  <div class="clean-card" v-if="show">
    <div class="card-header">
      <span class="card-title-text">🎯 选定本周主线</span>
    </div>
    <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 14px;">
      选定后本周锁定，不再分心切换，专注于单点突破。
    </p>
    <div style="display: flex; gap: 8px; margin-bottom: 16px;">
      <div
        v-for="line in LINE_NAMES"
        :key="line"
        style="flex: 1; padding: 14px 6px; text-align: center; border-radius: var(--radius-sm); border: 1px solid var(--border); background: rgba(0,0,0,0.2); cursor: pointer; transition: all 0.2s;"
        :style="selected === line ? 'border-color: #3b82f6; background: rgba(59,130,246,0.1);' : ''"
        @click="selected = line"
      >
        <div style="font-size: 24px;">{{ LINE_ICONS[line] }}</div>
        <div style="font-size: 13px; font-weight: 600; margin-top: 4px; color: #fff;">{{ line }}</div>
      </div>
    </div>
    <button
      class="btn-primary-block"
      :disabled="!selected"
      @click="confirm"
    >
      🔒 锁定本周主线并开启打卡
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { LINE_NAMES, LINE_ICONS } from '../data/stages.js'

defineProps({
  show: { type: Boolean, default: false }
})

const emit = defineEmits(['select'])
const selected = ref(null)

function confirm() {
  if (selected.value) {
    emit('select', selected.value)
  }
}
</script>
