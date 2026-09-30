<template>
  <div class="card">
    <div class="card-title">
      <span>☁️ 坚果云 WebDAV 同步</span>
      <span
        class="sync-dot"
        :class="config.enabled && isOnline ? 'connected' : 'disconnected'"
        :title="config.enabled ? '已启用云同步' : '未启用'"
      ></span>
    </div>

    <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 12px;">
      本地优先存储，通过坚果云免费 WebDAV 跨设备同步与自动备份。
    </p>

    <div class="form-group">
      <label>WebDAV 服务器地址</label>
      <input
        v-model="config.serverUrl"
        class="form-input"
        placeholder="https://dav.jianguoyun.com/dav/"
      />
    </div>

    <div class="form-group">
      <label>坚果云账号（邮箱）</label>
      <input
        v-model="config.username"
        class="form-input"
        placeholder="your_email@example.com"
      />
    </div>

    <div class="form-group">
      <label>应用授权独立密码（非登录密码）</label>
      <input
        v-model="config.password"
        type="password"
        class="form-input"
        placeholder="坚果云后台生成的 16 位独立应用密码"
      />
    </div>

    <div class="form-group">
      <label>云端目录</label>
      <input
        v-model="config.appDir"
        class="form-input"
        placeholder="/daily-ascent/"
      />
    </div>

    <div class="form-group" style="display: flex; align-items: center; justify-content: space-between; margin-top: 14px;">
      <label style="margin-bottom: 0; cursor: pointer;" for="sync-toggle">
        启用自动同步（打卡后自动同步）
      </label>
      <input
        id="sync-toggle"
        v-model="config.enabled"
        type="checkbox"
        style="width: 18px; height: 18px; cursor: pointer;"
        @change="saveConfig"
      />
    </div>

    <div class="btn-group">
      <button class="btn btn-ghost" @click="handleTest" :disabled="testing">
        {{ testing ? '测试中...' : '🔌 测试连接' }}
      </button>
      <button class="btn btn-primary" @click="handleSync" :disabled="syncing || !isConfigValid">
        {{ syncing ? '同步中...' : '🔄 立即双向同步' }}
      </button>
    </div>

    <div class="sync-status">
      <span>上次同步：{{ lastSyncText }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { testConnection, syncData } from '../utils/webdav.js'

const props = defineProps({
  syncConfig: {
    type: Object,
    default: () => ({
      enabled: false,
      serverUrl: 'https://dav.jianguoyun.com/dav/',
      username: '',
      password: '',
      appDir: '/daily-ascent/',
      lastSync: null
    })
  },
  currentData: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update-config', 'sync-success', 'toast'])

const config = ref({ ...props.syncConfig })
const testing = ref(false)
const syncing = ref(false)
const isOnline = ref(true)

const isConfigValid = computed(() => {
  return config.value.serverUrl && config.value.username && config.value.password
})

const lastSyncText = computed(() => {
  if (!config.value.lastSync) return '从未同步'
  const d = new Date(config.value.lastSync)
  return d.toLocaleString()
})

function saveConfig() {
  emit('update-config', { ...config.value })
}

// 测试连接
async function handleTest() {
  if (!isConfigValid.value) {
    emit('toast', '⚠️ 请先完整填写账号和应用授权密码')
    return
  }
  testing.value = true
  saveConfig()
  try {
    const ok = await testConnection(config.value)
    if (ok) {
      isOnline.value = true
      emit('toast', '✅ 坚果云 WebDAV 连接成功！')
    } else {
      isOnline.value = false
      emit('toast', '❌ 连接失败，请检查账号和应用独立密码')
    }
  } catch (err) {
    emit('toast', '❌ 网络连接错误: ' + err.message)
  } finally {
    testing.value = false
  }
}

// 立即双向同步
async function handleSync() {
  if (!isConfigValid.value) {
    emit('toast', '⚠️ 请先配置坚果云账号信息')
    return
  }
  syncing.value = true
  saveConfig()
  try {
    const res = await syncData(config.value, props.currentData)
    if (res.success) {
      config.value.lastSync = new Date().toISOString()
      saveConfig()
      emit('sync-success', res.merged)
      emit('toast', '🎉 同步成功！本地与云端已保持最新')
    } else {
      emit('toast', '⚠️ ' + res.message)
    }
  } catch (err) {
    emit('toast', '❌ 同步异常: ' + err.message)
  } finally {
    syncing.value = false
  }
}
</script>
