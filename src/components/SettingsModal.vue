<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card">
      <div class="modal-header">
        <div class="title-box">
          <span class="star-icon">✦</span>
          <span class="modal-title">设置与角色管理</span>
        </div>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>

      <div class="modal-body">
        <!-- 1. 角色立绘切换 -->
        <div class="section-title">✨ 选择角色立绘</div>
        <div class="char-options">
          <div
            class="char-item"
            :class="{ active: currentType === 'aether' }"
            @click="selectChar('aether', '旅行者')"
          >
            <div class="char-avatar-box">
              <img :src="aetherAvatar" alt="旅行者" class="char-thumb" />
            </div>
            <span class="char-name">旅行者 (空)</span>
          </div>

          <div
            class="char-item"
            :class="{ active: currentType === 'venti' }"
            @click="selectChar('venti', '温迪')"
          >
            <div class="char-avatar-box">
              <img :src="ventiAvatar" alt="温迪" class="char-thumb" />
            </div>
            <span class="char-name">风色诗人 (温迪)</span>
          </div>

          <!-- 自定义上传 -->
          <label class="char-item upload-box" :class="{ active: currentType === 'custom' }">
            <input type="file" accept="image/*" class="file-input" @change="handleFileUpload" />
            <div class="char-avatar-box upload-avatar">
              <span v-if="!customImg" class="upload-icon">📁</span>
              <img v-else :src="customImg" alt="自定义" class="char-thumb" />
            </div>
            <span class="char-name">自定义立绘</span>
          </label>
        </div>

        <!-- 2. 本地数据备份与恢复 -->
        <div class="section-title" style="margin-top: 18px;">💾 数据备份与恢复</div>
        <div class="btn-group">
          <button class="action-btn" @click="$emit('export')">
            📤 导出备份 (JSON)
          </button>
          <label class="action-btn upload-btn">
            📥 导入备份 (JSON)
            <input type="file" accept=".json" class="file-input" @change="handleImportFile" />
          </label>
        </div>

        <!-- 3. 清空数据 -->
        <div class="section-title danger-title" style="margin-top: 18px;">⚠️ 危险区域</div>
        <button class="action-btn danger-btn" @click="handleClearClick">
          🗑️ 清空所有打卡数据
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: { type: Boolean, default: false },
  currentType: { type: String, default: 'aether' },
  customImg: { type: String, default: '' },
  currentTitle: { type: String, default: '旅行者' }
})

const emit = defineEmits(['close', 'select-char', 'upload-char', 'export', 'import', 'clear'])

const baseUrl = import.meta.env.BASE_URL || './'
const aetherAvatar = `${baseUrl}avatar_aether.png`
const ventiAvatar = `${baseUrl}avatar_venti.png`

function selectChar(type, title) {
  emit('select-char', { type, title })
}

function handleFileUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (event) => {
    emit('upload-char', event.target.result)
  }
  reader.readAsDataURL(file)
}

function handleImportFile(e) {
  const file = e.target.files?.[0]
  if (file) {
    emit('import', file)
  }
}

function handleClearClick() {
  if (confirm('确认清空所有打卡记录与经验吗？此操作不可撤销！')) {
    emit('clear')
  }
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

.modal-card {
  width: 100%;
  max-width: 380px;
  background: #141b2d;
  border: 1px solid rgba(243, 216, 130, 0.35);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.7);
  overflow: hidden;
  animation: modalEnter 0.25s ease-out;
}

@keyframes modalEnter {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  background: rgba(25, 34, 58, 0.6);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.title-box {
  display: flex;
  align-items: center;
  gap: 6px;
}

.star-icon {
  color: #f3d882;
  font-size: 14px;
}

.modal-title {
  color: #f7f7f8;
  font-size: 15px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: #8392af;
  font-size: 22px;
  cursor: pointer;
  line-height: 1;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #ffffff;
}

.modal-body {
  padding: 16px 18px 20px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: #eed588;
  margin-bottom: 10px;
}

.char-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.char-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 4px;
  background: rgba(25, 34, 58, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.char-item:hover {
  background: rgba(35, 46, 75, 0.6);
  border-color: rgba(243, 216, 130, 0.3);
}

.char-item.active {
  border-color: #f3d882;
  background: rgba(243, 216, 130, 0.12);
  box-shadow: 0 0 10px rgba(243, 216, 130, 0.3);
}

.char-avatar-box {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  background: #0d1222;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6px;
  border: 1px solid rgba(243, 216, 130, 0.3);
}

.char-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-icon {
  font-size: 20px;
}

.char-name {
  font-size: 11px;
  color: #e2e8f0;
  text-align: center;
}

.file-input {
  display: none;
}

.btn-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 9px 12px;
  font-size: 12px;
  font-weight: 500;
  color: #f7f7f8;
  background: rgba(25, 34, 58, 0.8);
  border: 1px solid rgba(243, 216, 130, 0.3);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.action-btn:hover {
  background: rgba(40, 52, 85, 0.9);
  border-color: rgba(243, 216, 130, 0.6);
}

.danger-title {
  color: #f87171;
}

.danger-btn {
  width: 100%;
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.4);
  color: #fca5a5;
}

.danger-btn:hover {
  background: rgba(239, 68, 68, 0.25);
  border-color: rgba(239, 68, 68, 0.7);
}
</style>
