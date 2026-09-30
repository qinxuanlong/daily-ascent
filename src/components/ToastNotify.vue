<template>
  <div class="toast-container">
    <div
      v-for="t in toasts"
      :key="t.id"
      class="toast"
      :class="{ 'toast-out': t.leaving }"
    >
      {{ t.message }}
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const toasts = ref([])
let toastId = 0

// 显示 Toast 通知
function show(message, duration = 2000) {
  const id = ++toastId
  toasts.value.push({ id, message, leaving: false })
  setTimeout(() => {
    const t = toasts.value.find(x => x.id === id)
    if (t) t.leaving = true
    setTimeout(() => {
      toasts.value = toasts.value.filter(x => x.id !== id)
    }, 300)
  }, duration)
}

defineExpose({ show })
</script>
