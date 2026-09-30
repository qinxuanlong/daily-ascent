<template>
  <div v-if="show" class="modal-overlay" @click.self="skip">
    <div class="modal">
      <h3>🚀 明天第一步</h3>
      <p>写一句话，明天打开就知道做什么。可以跳过。</p>
      <div class="form-group">
        <input
          v-model="nextStep"
          class="form-input"
          placeholder="改标题关键词 / 写第二段..."
          @keyup.enter="confirm"
          ref="inputRef"
        />
      </div>
      <div class="btn-group">
        <button class="btn btn-ghost" @click="skip">跳过</button>
        <button class="btn btn-primary" @click="confirm">确定</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false }
})

const emit = defineEmits(['confirm', 'skip'])
const nextStep = ref('')
const inputRef = ref(null)

// 模态框打开时自动聚焦输入框
watch(() => props.show, async (val) => {
  if (val) {
    nextStep.value = ''
    await nextTick()
    inputRef.value?.focus()
  }
})

function confirm() {
  emit('confirm', nextStep.value.trim())
  nextStep.value = ''
}

function skip() {
  emit('skip')
  nextStep.value = ''
}
</script>
