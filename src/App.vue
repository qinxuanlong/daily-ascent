<template>
  <div class="app-container">
    <!-- 顶部 Toast 消息通知 -->
    <ToastNotify ref="toastRef" />

    <!-- 顶部状态栏导航 -->
    <header class="app-top-bar">
      <div class="top-title-group">
        <span class="app-star-icon">✦</span>
        <div class="title-text-stack">
          <h1 class="app-title">每日打卡</h1>
          <div class="app-subtitle">● DAILY CHECK-IN</div>
        </div>
      </div>

      <div class="top-actions">
        <!-- 打卡历程历史弹窗快捷入口 -->
        <button class="top-icon-btn" title="查看打卡历程记录" @click="showLogsModal = true">
          <span class="icon">📜</span>
        </button>
        <!-- 切换全屏沉浸模式 -->
        <button class="top-icon-btn" :title="isFullscreen ? '退出全屏' : '全屏沉浸模式'" @click="handleToggleFullscreen">
          <span class="icon">{{ isFullscreen ? '🗗' : '⛶' }}</span>
        </button>
        <!-- 切换角色立绘快捷键 -->
        <button class="top-icon-btn" title="更换角色立绘" @click="showSettingsModal = true">
          <span class="icon">👤</span>
        </button>
        <!-- 设置与备份 -->
        <button class="top-icon-btn" title="设置与备份" @click="showSettingsModal = true">
          <span class="icon">⚙️</span>
        </button>
      </div>
    </header>

    <!-- 1. 顶部：角色全景水镜立绘与属性牌 -->
    <CharacterStandee
      :character-type="state.selectedCharacter"
      :custom-img="state.characterCustomImg"
      :title="state.characterTitle"
      :level="currentLevel"
      :is-checked-in="isCheckedInToday"
      @switch-character="showSettingsModal = true"
    />

    <!-- 2. 中部：极细金色经验等阶进度条 -->
    <ExpProgressBar :exp="state.exp" />

    <!-- 3. 中下部：核心命定星轨日冕打卡印章 -->
    <GoldenPunchButton
      :is-checked-in="isCheckedInToday"
      @checkin="handleStartCheckIn"
    />

    <!-- 4. 底部：周打卡原石星芒矩阵与连击追踪（集成历史记录查看入口） -->
    <WeeklyTracker
      :streak="currentStreak"
      :checked-dates="checkedDates"
      @open-history="showLogsModal = true"
    />

    <!-- 打卡备注弹窗（选填 / 回车直达） -->
    <CheckInNoteModal
      :show="showNoteModal"
      @confirm="handleConfirmCheckIn"
      @close="showNoteModal = false"
    />

    <!-- 打卡历史记录独立模态框（响应用户首页轻量化需求） -->
    <CheckInLogsModal
      :show="showLogsModal"
      :logs="state.logs"
      :streak="currentStreak"
      :max-streak="state.maxStreak || 0"
      @delete-log="handleDeleteLog"
      @close="showLogsModal = false"
    />

    <!-- 设置与数据管理弹窗 -->
    <SettingsModal
      :show="showSettingsModal"
      :current-type="state.selectedCharacter"
      :custom-img="state.characterCustomImg"
      :current-title="state.characterTitle"
      @select-char="handleSelectChar"
      @upload-char="handleUploadChar"
      @export="handleExport"
      @import="handleImport"
      @clear="handleClear"
      @open-install-guide="showInstallGuide = true"
      @close="showSettingsModal = false"
    />

    <!-- 手机全屏与安装指南弹窗 -->
    <InstallGuideModal
      :show="showInstallGuide"
      :has-install-prompt="!!deferredInstallPrompt"
      @trigger-install="handleTriggerInstall"
      @close="showInstallGuide = false"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { storage } from './stores/storage.js'
import { getGameDate, formatTime, calculateStreak } from './utils/date.js'

// 组件引入
import CharacterStandee from './components/CharacterStandee.vue'
import ExpProgressBar from './components/ExpProgressBar.vue'
import GoldenPunchButton from './components/GoldenPunchButton.vue'
import WeeklyTracker from './components/WeeklyTracker.vue'
import CheckInLogsModal from './components/CheckInLogsModal.vue'
import CheckInNoteModal from './components/CheckInNoteModal.vue'
import SettingsModal from './components/SettingsModal.vue'
import InstallGuideModal from './components/InstallGuideModal.vue'
import ToastNotify from './components/ToastNotify.vue'

// 响应式状态管理
const state = reactive(storage.get())
const toastRef = ref(null)
const showNoteModal = ref(false)
const showLogsModal = ref(false)
const showSettingsModal = ref(false)
const showInstallGuide = ref(false)
const deferredInstallPrompt = ref(null)
const isFullscreen = ref(false)

// 监听 PWA 安装事件
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredInstallPrompt.value = e
  })
}

// 触发自动安装或弹出指南
function handleTriggerInstall() {
  if (deferredInstallPrompt.value) {
    deferredInstallPrompt.value.prompt()
    deferredInstallPrompt.value.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        toastRef.value?.show('已接受安装请求 ✦')
      }
      deferredInstallPrompt.value = null
    })
    showInstallGuide.value = false
  } else {
    showInstallGuide.value = true
  }
}

// 切换浏览器全屏
function handleToggleFullscreen() {
  const doc = document
  const el = doc.documentElement
  if (!doc.fullscreenElement && !doc.webkitFullscreenElement) {
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {})
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen()
    }
  } else {
    if (doc.exitFullscreen) {
      doc.exitFullscreen().catch(() => {})
    } else if (doc.webkitExitFullscreen) {
      doc.webkitExitFullscreen()
    }
  }
}

// 当前游戏日（05:00 切日）
const todayStr = computed(() => getGameDate())

// 当前等阶
const currentLevel = computed(() => Math.floor(state.exp / 100) + 1)

// 获取所有已打卡日期列表
const checkedDates = computed(() => {
  return Array.from(new Set(state.logs.map(l => l.date)))
})

// 今天是否已经打卡
const isCheckedInToday = computed(() => {
  return checkedDates.value.includes(todayStr.value)
})

// 动态连击天数计算
const currentStreak = computed(() => {
  return calculateStreak(state.logs, todayStr.value)
})

// 保存状态到本地
function saveState() {
  storage.set(state)
}

// 点击大圆按钮开始打卡
function handleStartCheckIn() {
  if (isCheckedInToday.value) {
    toastRef.value?.show('今日已经完成打卡啦 ✦')
    return
  }
  showNoteModal.value = true
}

// 确认完成打卡
function handleConfirmCheckIn(note) {
  showNoteModal.value = false

  const newLog = {
    id: Date.now().toString(),
    date: todayStr.value,
    time: formatTime(),
    exp: 50,
    note: note || '每日打卡达成 ✦ 获得原石与经验'
  }

  // 插入打卡流水头部
  state.logs.unshift(newLog)
  // 增加经验
  state.exp += 50
  // 更新连击天数
  state.streak = calculateStreak(state.logs, todayStr.value)
  state.maxStreak = Math.max(state.maxStreak || 0, state.streak)

  saveState()
  toastRef.value?.show('打卡成功！获得 50 EXP ✦')
}

// 删除记录
function handleDeleteLog(logId) {
  if (!confirm('确认删除该条打卡记录？')) return
  const target = state.logs.find(l => l.id === logId)
  if (target) {
    state.exp = Math.max(0, state.exp - (target.exp || 50))
    state.logs = state.logs.filter(l => l.id !== logId)
    state.streak = calculateStreak(state.logs, todayStr.value)
    saveState()
    toastRef.value?.show('已删除该条记录')
  }
}

// 切换角色立绘
function handleSelectChar({ type, title }) {
  state.selectedCharacter = type
  state.characterTitle = title
  saveState()
  toastRef.value?.show(`已切换为：${title}`)
}

// 上传自定义立绘
function handleUploadChar(base64Data) {
  state.selectedCharacter = 'custom'
  state.characterCustomImg = base64Data
  state.characterTitle = '自定义伙伴'
  saveState()
  toastRef.value?.show('自定义立绘更新成功！')
}

// 导出备份
function handleExport() {
  storage.exportJSON()
  toastRef.value?.show('打卡备份数据已导出')
}

// 导入备份
async function handleImport(file) {
  try {
    const imported = await storage.importJSON(file)
    Object.assign(state, imported)
    toastRef.value?.show('备份数据导入成功！')
    showSettingsModal.value = false
  } catch (e) {
    toastRef.value?.show(e.message || '导入失败')
  }
}

// 清空重置
function handleClear() {
  storage.clear()
  location.reload()
}

onMounted(() => {
  // 校验并同步最新连击
  state.streak = calculateStreak(state.logs, todayStr.value)
  saveState()

  // 监听全屏变动
  const updateFullscreenStatus = () => {
    isFullscreen.value = !!(document.fullscreenElement || document.webkitFullscreenElement)
  }
  document.addEventListener('fullscreenchange', updateFullscreenStatus)
  document.addEventListener('webkitfullscreenchange', updateFullscreenStatus)
})
</script>

<style scoped>
.app-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 4px 10px;
  user-select: none;
}

.top-title-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.app-star-icon {
  color: #ffffff;
  font-size: 22px;
  line-height: 1;
  filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.9)) drop-shadow(0 0 12px rgba(94, 234, 212, 0.6));
}

.title-text-stack {
  display: flex;
  flex-direction: column;
}

.app-title {
  font-size: 19px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 1px;
  line-height: 1.1;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  font-family: "Source Han Serif CN", Georgia, serif, sans-serif;
}

.app-subtitle {
  font-size: 9px;
  letter-spacing: 1.5px;
  color: rgba(255, 255, 255, 0.75);
  margin-top: 2px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
}

.top-actions {
  display: flex;
  gap: 8px;
}

.top-icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(20, 36, 72, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.top-icon-btn:hover {
  background: rgba(35, 60, 115, 0.75);
  border-color: rgba(243, 216, 130, 0.7);
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 16px rgba(243, 216, 130, 0.3);
}

.top-icon-btn .icon {
  font-size: 16px;
}
</style>
