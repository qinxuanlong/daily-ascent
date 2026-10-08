<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card">
      <div class="modal-header">
        <div class="title-box">
          <AppIcon name="settings" :size="16" />
          <span class="modal-title">系统设置与偏好</span>
        </div>
        <button class="close-btn" @click="$emit('close')">
          <AppIcon name="x" :size="18" />
        </button>
      </div>

      <div class="modal-body">
        <!-- 1. 角色立绘切换 -->
        <div class="section-title">
          <AppIcon name="user" :size="14" />
          <span>角色立绘与主题</span>
        </div>
        <div class="char-options">
          <div
            class="char-item"
            :class="{ active: currentType === 'aether' }"
            @click="selectChar('aether', '旅行者')"
          >
            <div class="char-avatar-box">
              <img :src="aetherAvatar" alt="旅行者" class="char-thumb" draggable="false" />
            </div>
            <span class="char-name">旅行者 (空)</span>
          </div>

          <div
            class="char-item"
            :class="{ active: currentType === 'venti' }"
            @click="selectChar('venti', '温迪')"
          >
            <div class="char-avatar-box">
              <img :src="ventiAvatar" alt="温迪" class="char-thumb" draggable="false" />
            </div>
            <span class="char-name">风色诗人 (温迪)</span>
          </div>

          <!-- 自定义上传 -->
          <label class="char-item upload-box" :class="{ active: currentType === 'custom' }">
            <input type="file" accept="image/*" class="file-input" @change="handleFileUpload" />
            <div class="char-avatar-box upload-avatar">
              <span v-if="!customImg" class="upload-icon">
                <AppIcon name="plus" :size="18" />
              </span>
              <img v-else :src="customImg" alt="自定义" class="char-thumb" draggable="false" />
            </div>
            <span class="char-name">自定义立绘</span>
          </label>
        </div>

        <!-- 2. 坚果云 WebDAV 云同步 -->
        <div class="section-title" style="margin-top: 18px;">
          <AppIcon name="cloud" :size="14" />
          <span>坚果云 WebDAV 跨端同步</span>
          <span v-if="syncConfig.lastSyncTime" class="sync-time-badge">
            上次: {{ syncConfig.lastSyncTime }}
          </span>
        </div>
        <div class="webdav-box">
          <div class="input-row">
            <span class="input-label">账号:</span>
            <input
              v-model="syncConfig.username"
              type="email"
              class="webdav-input"
              placeholder="坚果云注册邮箱"
              @change="handleSaveWebdavConfig"
            />
          </div>
          <div class="input-row">
            <span class="input-label">密码:</span>
            <input
              v-model="syncConfig.password"
              type="password"
              class="webdav-input"
              placeholder="第三方应用独立授权密码"
              @change="handleSaveWebdavConfig"
            />
          </div>
          <div class="sync-options-row">
            <label class="checkbox-label">
              <input
                v-model="syncConfig.autoSync"
                type="checkbox"
                @change="handleSaveWebdavConfig"
              />
              <span>打卡后自动同步</span>
            </label>
            <button class="test-btn" :disabled="testing" @click="handleTestConnection">
              {{ testing ? '检测中...' : '测试连接' }}
            </button>
          </div>
          <button
            class="action-btn sync-now-btn"
            :disabled="syncing"
            @click="handleTriggerSync"
          >
            <span class="sync-icon" :class="{ rotating: syncing }">
              <AppIcon name="refresh" :size="14" />
            </span>
            <span>{{ syncing ? '正在双向合并同步中...' : '立即与坚果云同步' }}</span>
          </button>
        </div>

        <!-- 3. 手机安装指南 -->
        <div class="section-title" style="margin-top: 18px;">
          <AppIcon name="desktop" :size="14" />
          <span>移动端与全屏安装</span>
        </div>
        <button class="action-btn install-guide-btn" @click="$emit('open-install-guide')">
          添加到桌面 (沉浸全屏运行)
        </button>

        <!-- 4. 本地数据备份与恢复 -->
        <div class="section-title" style="margin-top: 18px;">
          <AppIcon name="sparkles" :size="14" />
          <span>数据备份与管理</span>
        </div>
        <div class="btn-group">
          <button class="action-btn" @click="$emit('export')">
            导出备份 (JSON)
          </button>
          <label class="action-btn upload-btn">
            导入备份 (JSON)
            <input type="file" accept=".json" class="file-input" @change="handleImportFile" />
          </label>
        </div>

        <!-- 5. 危险区域 -->
        <div class="section-title danger-title" style="margin-top: 18px;">
          <AppIcon name="trash" :size="14" />
          <span>危险操作</span>
        </div>
        <button class="action-btn danger-btn" @click="handleClearClick">
          重置并清空所有本地数据
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { webdav } from '../utils/webdav'
import type { CharacterType } from '../types'
import AppIcon from './AppIcon.vue'

const props = withDefaults(
  defineProps<{
    show?: boolean
    currentType?: CharacterType
    customImg?: string
    currentTitle?: string
  }>(),
  {
    show: false,
    currentType: 'venti',
    customImg: '',
    currentTitle: '温迪'
  }
)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'select-char', payload: { type: CharacterType; title: string }): void
  (e: 'upload-char', dataUrl: string): void
  (e: 'export'): void
  (e: 'import', file: File): void
  (e: 'clear'): void
  (e: 'open-install-guide'): void
  (e: 'trigger-sync', callback: (success: boolean, message?: string) => void): void
  (e: 'toast', message: string): void
}>()

const baseUrl = import.meta.env.BASE_URL || './'
const aetherAvatar = `${baseUrl}avatar_aether.png`
const ventiAvatar = `${baseUrl}avatar_venti.png`

const syncConfig = reactive(webdav.getConfig())
const testing = ref(false)
const syncing = ref(false)

watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      Object.assign(syncConfig, webdav.getConfig())
    }
  }
)

function handleSaveWebdavConfig() {
  webdav.saveConfig(syncConfig)
}

async function handleTestConnection() {
  handleSaveWebdavConfig()
  testing.value = true
  try {
    const res = await webdav.testConnection()
    emit('toast', res.message)
  } finally {
    testing.value = false
  }
}

async function handleTriggerSync() {
  handleSaveWebdavConfig()
  syncing.value = true
  try {
    emit('trigger-sync', (success: boolean, message?: string) => {
      syncing.value = false
      if (success) {
        Object.assign(syncConfig, webdav.getConfig())
      }
      if (message) emit('toast', message)
    })
  } catch {
    syncing.value = false
  }
}

function selectChar(type: CharacterType, title: string) {
  emit('select-char', { type, title })
}

function handleFileUpload(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (event) => {
    if (event.target?.result) {
      emit('upload-char', event.target.result as string)
    }
  }
  reader.readAsDataURL(file)
}

function handleImportFile(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    emit('import', file)
  }
}

function handleClearClick() {
  if (window.confirm('确认清空所有打卡记录与待办任务吗？此操作不可撤销！')) {
    emit('clear')
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 16px;
}

.modal-card {
  width: 100%;
  max-width: 400px;
  background: #141b2d;
  border: 1px solid rgba(243, 216, 130, 0.35);
  border-radius: 20px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.7);
  overflow: hidden;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
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
  gap: 8px;
  color: #fff0bd;
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
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #ffffff;
}

.modal-body {
  padding: 16px 18px 20px;
  overflow-y: auto;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
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
  color: #f3d882;
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
  gap: 6px;
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

.install-guide-btn {
  width: 100%;
  background: linear-gradient(135deg, rgba(243, 216, 130, 0.2) 0%, rgba(200, 160, 60, 0.25) 100%);
  border-color: rgba(243, 216, 130, 0.5);
  color: #fff0bd;
  font-weight: 600;
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

.sync-time-badge {
  font-size: 10px;
  color: #94a3b8;
  font-weight: normal;
  margin-left: 6px;
}

.webdav-box {
  background: rgba(20, 28, 48, 0.6);
  border: 1px solid rgba(243, 216, 130, 0.25);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-label {
  font-size: 11px;
  color: #eed588;
  width: 36px;
  flex-shrink: 0;
}

.webdav-input {
  flex: 1;
  background: rgba(10, 15, 28, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  color: #f1f5f9;
  padding: 6px 10px;
  font-size: 12px;
  outline: none;
  transition: border-color 0.2s;
}

.webdav-input:focus {
  border-color: #f3d882;
}

.sync-options-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2px 2px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #cbd5e1;
  cursor: pointer;
}

.checkbox-label input {
  cursor: pointer;
  accent-color: #f3d882;
}

.test-btn {
  background: transparent;
  border: 1px solid rgba(243, 216, 130, 0.4);
  color: #eed588;
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.test-btn:hover:not(:disabled) {
  background: rgba(243, 216, 130, 0.15);
  border-color: #f3d882;
}

.sync-now-btn {
  width: 100%;
  margin-top: 4px;
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(59, 130, 246, 0.2) 100%);
  border-color: rgba(56, 189, 248, 0.5);
  color: #bae6fd;
}

.sync-now-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.3) 0%, rgba(59, 130, 246, 0.35) 100%);
  border-color: #38bdf8;
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.3);
}

.sync-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.sync-icon.rotating {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}
</style>
