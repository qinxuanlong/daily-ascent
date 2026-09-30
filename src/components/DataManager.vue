<template>
  <div class="card">
    <div class="card-title">⚙️ 本地备份与数据管理</div>
    <div class="data-actions">
      <button class="btn btn-ghost" @click="$emit('export')">⬇️ 导出 JSON</button>
      <button class="btn btn-ghost" @click="triggerImport">⬆️ 导入 JSON</button>
      <button class="btn btn-danger" @click="confirmClear">🗑️ 清空数据</button>
    </div>
    <input type="file" ref="fileInput" accept=".json" @change="handleImport" />

    <!-- 清空确认弹窗 -->
    <div v-if="showConfirm" class="modal-overlay" @click.self="showConfirm = false">
      <div class="modal">
        <h3>⚠️ 确认清空</h3>
        <p>确定清空所有本地数据？此操作不可撤销！</p>
        <div class="btn-group">
          <button class="btn btn-ghost" @click="showConfirm = false">取消</button>
          <button class="btn btn-danger" @click="doClear">确定清空</button>
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
