<template>
  <div class="app-container">
    <!-- 顶部 Toast 消息通知 -->
    <ToastNotify ref="toastRef" />

    <!-- 顶部状态栏 -->
    <header class="app-top-bar">
      <div class="top-title-group">
        <span class="app-star-icon">✦</span>
        <h1 class="app-title">每日打卡</h1>
      </div>
      <div class="top-actions">
        <!-- 切换立绘快捷键 -->
        <button class="top-icon-btn" title="更换角色立绘" @click="showSettingsModal = true">
          <span class="icon">👤</span>
        </button>
        <!-- 设置与备份 -->
        <button class="top-icon-btn" title="设置与备份" @click="showSettingsModal = true">
          <span class="icon">⚙️</span>
        </button>
      </div>
    </header>

    <!-- 1. 顶部：角色立绘与召唤法阵（草图顶部框） -->
    <CharacterStandee
      :character-type="state.selectedCharacter"
      :custom-img="state.characterCustomImg"
      :title="state.characterTitle"
      :is-checked-in="isCheckedInToday"
      @switch-character="showSettingsModal = true"
    />

    <!-- 2. 中部：极简金色经验进度条（草图进度条） -->
    <ExpProgressBar :exp="state.exp" />

    <!-- 3. 中下部：核心金色日曜大圆打卡按钮（草图大圆） -->
    <GoldenPunchButton
      :is-checked-in="isCheckedInToday"
      @checkin="handleStartCheckIn"
    />

    <!-- 4. 底部：周签到状态与连击（草图底部椭圆区） -->
    <WeeklyTracker
      :streak="currentStreak"
      :checked-dates="checkedDates"
    />

    <!-- 5. 底部：最近打卡记录流 -->
    <CheckInLogs
      :logs="state.logs"
      @delete-log="handleDeleteLog"
    />

    <!-- 打卡备注弹窗（选填 / 回车直达） -->
    <CheckInNoteModal
      :show="showNoteModal"
      @confirm="handleConfirmCheckIn"
      @close="showNoteModal = false"
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
      @close="showSettingsModal = false"
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
import CheckInLogs from './components/CheckInLogs.vue'
import CheckInNoteModal from './components/CheckInNoteModal.vue'
import SettingsModal from './components/SettingsModal.vue'
import ToastNotify from './components/ToastNotify.vue'

// 响应式状态管理
const state = reactive(storage.get())
const toastRef = ref(null)
const showNoteModal = ref(false)
const showSettingsModal = ref(false)

// 当前游戏日（05:00 切日）
const todayStr = computed(() => getGameDate())

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
})
</script>

<style scoped>
.app-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 4px 14px;
}

.top-title-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.app-star-icon {
  color: #f3d882;
  font-size: 16px;
  filter: drop-shadow(0 0 6px rgba(243, 216, 130, 0.7));
}

.app-title {
  font-size: 18px;
  font-weight: 700;
  color: #f7f7f8;
  letter-spacing: 1px;
}

.top-actions {
  display: flex;
  gap: 8px;
}

.top-icon-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(25, 34, 58, 0.6);
  border: 1px solid rgba(243, 216, 130, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(8px);
}

.top-icon-btn:hover {
  background: rgba(40, 52, 85, 0.85);
  border-color: rgba(243, 216, 130, 0.6);
  transform: translateY(-1px);
}

.top-icon-btn .icon {
  font-size: 15px;
}
</style>
