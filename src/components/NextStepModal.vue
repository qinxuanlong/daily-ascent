<template>
  <div v-if="show" class="modal-overlay" @click.self="skip">
    <div class="clean-modal">
      <h3>🚀 锁定明天第一步</h3>
      <p>写一句极简动作，明天打开就知道干什么（可跳过）。</p>
      <input
        v-model="nextStep"
        class="input-box"
        placeholder="例如：改好商品标题前5个词"
        @keyup.enter="confirm"
        ref="inputRef"
      />
      <div class="btn-row">
        <button class="clean-btn" @click="skip">跳过</button>
        <button class="clean-btn" style="background: var(--primary); color: #fff; border-color: var(--primary);" @click="confirm">确定</button>
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
