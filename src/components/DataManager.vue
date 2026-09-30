<template>
  <div class="clean-card">
    <div class="card-header">
      <span class="card-title-text">⚙️ 本地备份与管理</span>
    </div>

    <div class="btn-row">
      <button class="clean-btn" @click="$emit('export')">⬇️ 导出 JSON</button>
      <button class="clean-btn" @click="triggerImport">⬆️ 导入恢复</button>
      <button class="clean-btn danger" @click="confirmClear">🗑️ 清空</button>
    </div>
    <input type="file" ref="fileInput" accept=".json" @change="handleImport" />

    <!-- 清空确认弹窗 -->
    <div v-if="showConfirm" class="modal-overlay" @click.self="showConfirm = false">
      <div class="clean-modal">
        <h3 style="color: #ef4444;">⚠️ 确认清空所有数据？</h3>
        <p>此操作将删除浏览器内的所有打卡历史，不可恢复！</p>
        <div class="btn-row">
          <button class="clean-btn" @click="showConfirm = false">取消</button>
          <button class="clean-btn danger" @click="doClear">确认清空</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['export', 'import', 'clear'])
const fileInput = ref(null)
const showConfirm = ref(false)

function triggerImport() {
  fileInput.value?.click()
}

function handleImport(e) {
  const file = e.target.files[0]
  if (file) {
    emit('import', file)
    e.target.value = ''
  }
}

function confirmClear() {
  showConfirm.value = true
}

function doClear() {
  showConfirm.value = false
  emit('clear')
}
</script>
