<template>
  <div class="card" v-if="show">
    <div class="card-title">🎯 选择本周主线</div>
    <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 12px;">
      选定后本周不可更换，专注一条线。
    </p>
    <div class="line-cards">
      <div
        v-for="line in LINE_NAMES"
        :key="line"
        class="line-card"
        :class="{ selected: selected === line }"
        @click="selected = line"
      >
        <div class="line-icon">{{ LINE_ICONS[line] }}</div>
        <div class="line-name">{{ line }}</div>
      </div>
    </div>
    <div class="btn-group">
      <button class="btn btn-primary" :disabled="!selected" @click="confirm">
        🔒 锁定本周主线
      </button>
    </div>
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
