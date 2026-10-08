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

<script setup lang="ts">
import { ref } from 'vue'

interface ToastItem {
  id: number
  message: string
  leaving: boolean
}

const toasts = ref<ToastItem[]>([])
let toastId = 0

// 显示 Toast 通知
function show(message: string, duration: number = 2000): void {
  const id = ++toastId
  toasts.value.push({ id, message, leaving: false })
  setTimeout(() => {
    const t = toasts.value.find((x) => x.id === id)
    if (t) t.leaving = true
    setTimeout(() => {
      toasts.value = toasts.value.filter((x) => x.id !== id)
    }, 300)
  }, duration)
}

defineExpose({ show })
</script>
