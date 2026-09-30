<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="note-modal-card">
      <div class="note-header">
        <span class="star-icon">✦</span>
        <span class="note-title">今日打卡</span>
      </div>

      <div class="note-body">
        <p class="note-desc">记录今晚的一点微产出或心情（选填，留空直接打卡）：</p>
        <input
          v-model="noteText"
          class="note-input"
          placeholder="例如：写完核心组件、阅读半小时..."
          autofocus
          @keyup.enter="handleConfirm"
        />

        <div class="note-actions">
          <button class="btn-cancel" @click="$emit('close')">取消</button>
          <button class="btn-confirm" @click="handleConfirm">
            ✦ 完成打卡 (+50 EXP)
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  show: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'confirm'])
const noteText = ref('')

function handleConfirm() {
  emit('confirm', noteText.value.trim())
  noteText.value = ''
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 16px;
}

.note-modal-card {
  width: 100%;
  max-width: 360px;
  background: #141b2d;
  border: 1px solid rgba(243, 216, 130, 0.4);
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.7);
  overflow: hidden;
  animation: popIn 0.25s ease-out;
}

@keyframes popIn {
  from {
    opacity: 0;
    transform: scale(0.92);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.note-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 16px;
  background: rgba(25, 34, 58, 0.6);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.star-icon {
  color: #f3d882;
  font-size: 14px;
}

.note-title {
  color: #f7f7f8;
  font-size: 14px;
  font-weight: 600;
}

.note-body {
  padding: 16px;
}

.note-desc {
  font-size: 12px;
  color: #9ba8c2;
  margin-bottom: 10px;
}

.note-input {
  width: 100%;
  padding: 10px 12px;
  background: rgba(10, 14, 25, 0.75);
  border: 1px solid rgba(243, 216, 130, 0.3);
  border-radius: 10px;
  color: #f7f7f8;
  font-size: 13px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.note-input:focus {
  border-color: #f3d882;
  box-shadow: 0 0 8px rgba(243, 216, 130, 0.3);
}

.note-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 14px;
}

.btn-cancel {
  padding: 8px 14px;
  font-size: 12px;
  color: #9ba8c2;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
}

.btn-confirm {
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 600;
  color: #3b2203;
  background: linear-gradient(135deg, #ffd778 0%, #e6a836 100%);
  border: 1px solid rgba(255, 245, 210, 0.8);
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(243, 216, 130, 0.4);
  transition: all 0.2s;
}

.btn-confirm:hover {
  transform: translateY(-1px);
  box-shadow: 0 0 14px rgba(243, 216, 130, 0.6);
}
</style>
