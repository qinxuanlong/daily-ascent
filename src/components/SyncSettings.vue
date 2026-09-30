<template>
  <div class="clean-card">
    <div class="card-header">
      <span class="card-title-text">☁️ 坚果云 WebDAV 同步</span>
      <span
        style="width: 8px; height: 8px; border-radius: 50%; display: inline-block;"
        :style="{ background: config.enabled ? '#10b981' : '#6b7280' }"
      ></span>
    </div>

    <div class="input-label">坚果云账号邮箱</div>
    <input
      v-model="config.username"
      class="input-box"
      placeholder="your_email@example.com"
      @change="saveConfig"
    />

    <div class="input-label">独立应用密码（16 位授权码）</div>
    <input
      v-model="config.password"
      type="password"
      class="input-box"
      placeholder="坚果云后台生成的应用密码"
      @change="saveConfig"
    />

    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
      <span style="font-size: 13px; color: var(--text-muted);">自动同步（打卡后后台同步）</span>
      <input
        type="checkbox"
        v-model="config.enabled"
        style="cursor: pointer; width: 16px; height: 16px;"
        @change="saveConfig"
      />
    </div>

    <div class="btn-row">
      <button class="clean-btn" :disabled="testing" @click="handleTest">
        {{ testing ? '测试中...' : '🔌 测试连接' }}
      </button>
      <button class="clean-btn" style="background: var(--primary); color: #fff; border-color: var(--primary);" :disabled="syncing || !isConfigValid" @click="handleSync">
        {{ syncing ? '同步中...' : '🔄 立即同步' }}
      </button>
    </div>

    <div style="font-size: 11px; color: var(--text-dim); margin-top: 10px; text-align: center;">
      上次同步：{{ lastSyncText }}
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

async function handleTest() {
  if (!isConfigValid.value) {
    emit('toast', '⚠️ 请先填写坚果云账号与应用密码')
    return
  }
  testing.value = true
  saveConfig()
  try {
    const ok = await testConnection(config.value)
    if (ok) {
      emit('toast', '✅ 坚果云连接成功！')
    } else {
      emit('toast', '❌ 连接失败，请核对账号与密码')
    }
  } catch (err) {
    emit('toast', '❌ 连接出错: ' + err.message)
  } finally {
    testing.value = false
  }
}

async function handleSync() {
  if (!isConfigValid.value) {
    emit('toast', '⚠️ 请先配置坚果云账号')
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
      emit('toast', '🎉 同步成功！')
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
