<template>
  <div class="app-container" :class="{ 'dashboard-mode': isDesktopDashboard }">
    <!-- 顶部 Toast 消息通知 -->
    <ToastNotify ref="toastRef" />

    <!-- 顶部极简状态栏导航 -->
    <header class="app-top-bar">
      <div class="top-title-group" @click="activeTab = 'checkin'">
        <span class="app-star-icon">✦</span>
        <div class="title-text-stack">
          <h1 class="app-title">每日攀升</h1>
          <div class="app-subtitle">Lv.{{ currentLevel }} · {{ state.characterTitle }}</div>
        </div>
      </div>

      <div class="top-actions">
        <!-- 桌面端布局切换按钮（仅宽屏生效） -->
        <button
          v-if="isWideScreen"
          class="top-icon-btn"
          :title="isDesktopDashboard ? '切换为极简专注单栏' : '切换为全景双栏工作台'"
          @click="isDesktopDashboard = !isDesktopDashboard"
        >
          <AppIcon :name="isDesktopDashboard ? 'zen' : 'desktop'" :size="16" />
        </button>

        <!-- 坚果云快捷同步按钮 -->
        <button
          class="top-icon-btn"
          :class="{ 'syncing-btn': isSyncing }"
          title="坚果云数据同步"
          @click="handleManualSync"
        >
          <span :class="{ rotating: isSyncing }">
            <AppIcon name="cloud" :size="16" />
          </span>
        </button>

        <!-- 切换全屏沉浸模式 -->
        <button
          class="top-icon-btn"
          :title="isFullscreen ? '退出全屏' : '全屏沉浸模式'"
          @click="handleToggleFullscreen"
        >
          <AppIcon :name="isFullscreen ? 'minimize' : 'maximize'" :size="16" />
        </button>

        <!-- 设置与备份 -->
        <button
          class="top-icon-btn"
          title="系统设置与数据管理"
          @click="showSettingsModal = true"
        >
          <AppIcon name="settings" :size="16" />
        </button>
      </div>
    </header>

    <!-- 主展示区：桌面端双栏工作台模式 -->
    <main v-if="isDesktopDashboard && isWideScreen" class="dashboard-grid">
      <!-- 左栏：今日打卡极简专注核心 -->
      <section class="dash-left-column">
        <div class="column-header">
          <span class="column-tag">FOCUS DESK</span>
          <h2 class="column-heading">今日打卡专注</h2>
        </div>
        <TodayCheckInView
          :todos="state.todos"
          :exp="state.exp"
          :streak="currentStreak"
          @checkin="handleCheckIn"
          @open-add-todo="activeTab = 'todos'"
          @switch-tab="handleSwitchTab"
          @save-todo-note="handleSaveTodoNote"
        />
      </section>

      <!-- 右栏：待办清单全貌与历程统计 -->
      <section class="dash-right-column">
        <div class="dash-right-tabs">
          <button
            class="dash-sub-tab"
            :class="{ active: dashRightTab === 'todos' }"
            @click="dashRightTab = 'todos'"
          >
            <AppIcon name="list-todo" :size="15" />
            <span>待办清单 ({{ state.todos.length }})</span>
          </button>
          <button
            class="dash-sub-tab"
            :class="{ active: dashRightTab === 'history' }"
            @click="dashRightTab = 'history'"
          >
            <AppIcon name="history" :size="15" />
            <span>历程统计 ({{ state.logs.length }})</span>
          </button>
        </div>

        <div class="dash-right-content">
          <TodoListView
            v-if="dashRightTab === 'todos'"
            :todos="state.todos"
            @add-todo="handleAddTodo"
            @update-todo="handleUpdateTodo"
            @delete-todo="handleDeleteTodo"
            @toggle-todo="handleToggleTodo"
          />
          <HistoryView
            v-else
            :logs="state.logs"
            :streak="currentStreak"
            :max-streak="state.maxStreak || 0"
            @delete-log="handleDeleteLog"
          />
        </div>
      </section>
    </main>

    <!-- 主展示区：单栏/移动端/极简专注模式 -->
    <main v-else class="single-column-main">
      <transition name="view-fade" mode="out-in">
        <!-- 视图 1：今日打卡（首页核心） -->
        <TodayCheckInView
          v-if="activeTab === 'checkin'"
          :todos="state.todos"
          :exp="state.exp"
          :streak="currentStreak"
          @checkin="handleCheckIn"
          @open-add-todo="activeTab = 'todos'"
          @switch-tab="handleSwitchTab"
          @save-todo-note="handleSaveTodoNote"
        />

        <!-- 视图 2：待办清单（全部任务管理） -->
        <TodoListView
          v-else-if="activeTab === 'todos'"
          :todos="state.todos"
          @add-todo="handleAddTodo"
          @update-todo="handleUpdateTodo"
          @delete-todo="handleDeleteTodo"
          @toggle-todo="handleToggleTodo"
        />

        <!-- 视图 3：历程统计（历史记录与周矩阵） -->
        <HistoryView
          v-else-if="activeTab === 'history'"
          :logs="state.logs"
          :streak="currentStreak"
          :max-streak="state.maxStreak || 0"
          @delete-log="handleDeleteLog"
        />
      </transition>
    </main>

    <!-- 底部极简磨砂 Tab 导航栏（单栏模式常驻） -->
    <nav v-if="!isDesktopDashboard || !isWideScreen" class="bottom-tab-bar">
      <button
        class="tab-item"
        :class="{ active: activeTab === 'checkin' }"
        @click="activeTab = 'checkin'"
      >
        <div class="tab-icon-wrap">
          <AppIcon name="target" :size="18" />
          <span v-if="pendingCount > 0" class="badge-dot"></span>
        </div>
        <span class="tab-label">今日打卡</span>
      </button>

      <button
        class="tab-item"
        :class="{ active: activeTab === 'todos' }"
        @click="activeTab = 'todos'"
      >
        <div class="tab-icon-wrap">
          <AppIcon name="list-todo" :size="18" />
        </div>
        <span class="tab-label">待办清单</span>
      </button>

      <button
        class="tab-item"
        :class="{ active: activeTab === 'history' }"
        @click="activeTab = 'history'"
      >
        <div class="tab-icon-wrap">
          <AppIcon name="history" :size="18" />
        </div>
        <span class="tab-label">历程统计</span>
      </button>
    </nav>

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
      @trigger-sync="handleSyncFromModal"
      @toast="(msg: string) => toastRef?.show(msg)"
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

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import type { AppDataState, ActiveTab, TodoItem, CharacterType } from './types'
import { storage } from './stores/storage'
import { getGameDate, formatTime, calculateStreak } from './utils/date'
import { webdav } from './utils/webdav'

// 组件引入
import AppIcon from './components/AppIcon.vue'
import TodayCheckInView from './components/TodayCheckInView.vue'
import TodoListView from './components/TodoListView.vue'
import HistoryView from './components/HistoryView.vue'
import SettingsModal from './components/SettingsModal.vue'
import InstallGuideModal from './components/InstallGuideModal.vue'
import ToastNotify from './components/ToastNotify.vue'

// 响应式数据
const state = reactive<AppDataState>(storage.get())
const toastRef = ref<InstanceType<typeof ToastNotify> | null>(null)
const activeTab = ref<ActiveTab>('checkin')
const dashRightTab = ref<'todos' | 'history'>('todos')
const showSettingsModal = ref(false)
const showInstallGuide = ref(false)
const deferredInstallPrompt = ref<any>(null)
const isFullscreen = ref(false)
const isSyncing = ref(false)

// 屏幕宽度检测与桌面双栏自适应
const isWideScreen = ref(typeof window !== 'undefined' ? window.innerWidth >= 1024 : false)
const isDesktopDashboard = ref(typeof window !== 'undefined' ? window.innerWidth >= 1024 : false)

function handleResize() {
  isWideScreen.value = window.innerWidth >= 1024
}

// 监听 PWA 安装事件
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault()
    deferredInstallPrompt.value = e
  })
}

function handleTriggerInstall() {
  if (deferredInstallPrompt.value) {
    deferredInstallPrompt.value.prompt()
    deferredInstallPrompt.value.userChoice.then((choiceResult: { outcome: string }) => {
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

// 切换全屏
function handleToggleFullscreen() {
  const doc = document as any
  const el = doc.documentElement
  if (!doc.fullscreenElement && !doc.webkitFullscreenElement) {
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {})
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen()
    }
    isFullscreen.value = true
  } else {
    if (doc.exitFullscreen) {
      doc.exitFullscreen().catch(() => {})
    } else if (doc.webkitExitFullscreen) {
      doc.webkitExitFullscreen()
    }
    isFullscreen.value = false
  }
}

// 业务日期
const todayStr = computed(() => getGameDate())
const currentLevel = computed(() => Math.floor(state.exp / 100) + 1)
const currentStreak = computed(() => calculateStreak(state.logs, todayStr.value))
const pendingCount = computed(() => state.todos.filter((t) => !t.completed).length)

function saveState() {
  storage.set(state)
}

// 今日打卡核心触发
function handleCheckIn(payload: { todoId: string; note: string }) {
  const targetTodo = state.todos.find((t) => t.id === payload.todoId)
  if (!targetTodo) return

  targetTodo.completed = true
  targetTodo.completedAt = new Date().toISOString()
  if (payload.note) targetTodo.note = payload.note
  if (targetTodo.type === 'habit') {
    targetTodo.streak = (targetTodo.streak || 0) + 1
  }
  targetTodo.updatedAt = Date.now()

  // 记录流水
  const newLog = {
    id: Date.now().toString(),
    date: todayStr.value,
    time: formatTime(),
    todoId: targetTodo.id,
    todoTitle: targetTodo.title,
    exp: 50,
    note: payload.note || `${targetTodo.title} 打卡达成 ✦`
  }

  state.logs.unshift(newLog)
  state.exp += 50
  state.streak = calculateStreak(state.logs, todayStr.value)
  state.maxStreak = Math.max(state.maxStreak || 0, state.streak)

  saveState()
  toastRef.value?.show(`打卡成功！获得 50 EXP ✦`)

  // 自动同步
  const syncCfg = webdav.getConfig()
  if (syncCfg.enabled && syncCfg.autoSync) {
    performSync(true)
  }
}

// 补充待办心得
function handleSaveTodoNote(payload: { todoId: string; note: string }) {
  const target = state.todos.find((t) => t.id === payload.todoId)
  if (target) {
    target.note = payload.note
    target.updatedAt = Date.now()
    saveState()
    toastRef.value?.show('心得备注已更新 ✦')
  }
}

// 待办管理事件
function handleAddTodo(todo: Omit<TodoItem, 'id' | 'order' | 'updatedAt' | 'completed'>) {
  const newTodo: TodoItem = {
    ...todo,
    id: `todo-${Date.now()}`,
    completed: false,
    order: state.todos.length + 1,
    updatedAt: Date.now()
  }
  state.todos.push(newTodo)
  saveState()
  toastRef.value?.show('已添加新待办 ✦')

  if (webdav.getConfig().autoSync) performSync(true)
}

function handleUpdateTodo(id: string, updates: Partial<TodoItem>) {
  const target = state.todos.find((t) => t.id === id)
  if (target) {
    Object.assign(target, updates)
    target.updatedAt = Date.now()
    saveState()
    toastRef.value?.show('待办已更新')
    if (webdav.getConfig().autoSync) performSync(true)
  }
}

function handleDeleteTodo(id: string) {
  state.todos = state.todos.filter((t) => t.id !== id)
  saveState()
  toastRef.value?.show('已删除待办项')
  if (webdav.getConfig().autoSync) performSync(true)
}

function handleToggleTodo(todo: TodoItem) {
  if (todo.completed) {
    todo.completed = false
    todo.completedAt = undefined
    todo.updatedAt = Date.now()
    saveState()
    toastRef.value?.show('已撤销打卡状态')
  } else {
    handleCheckIn({ todoId: todo.id, note: todo.note || '' })
  }
}

// 删除单条流水记录
function handleDeleteLog(logId: string) {
  const target = state.logs.find((l) => l.id === logId)
  if (target) {
    state.exp = Math.max(0, state.exp - (target.exp || 50))
    state.logs = state.logs.filter((l) => l.id !== logId)
    state.streak = calculateStreak(state.logs, todayStr.value)
    saveState()
    toastRef.value?.show('已删除该条记录')
    if (webdav.getConfig().autoSync) performSync(true)
  }
}

function handleSwitchTab(tab: ActiveTab) {
  activeTab.value = tab
}

// 同步逻辑
async function performSync(silent: boolean = false, callback?: (success: boolean, message?: string) => void) {
  if (isSyncing.value) return
  isSyncing.value = true
  try {
    const res = await webdav.sync(state)
    if (res.success && res.data) {
      Object.assign(state, res.data)
      saveState()
      if (!silent) toastRef.value?.show(res.message || '坚果云同步成功 ✦')
      callback?.(true, res.message)
    } else {
      if (!silent) toastRef.value?.show(res.message || '同步未完成')
      callback?.(false, res.message)
    }
  } catch (e: unknown) {
    const err = e as Error
    if (!silent) toastRef.value?.show('同步出错，请检查网络')
    callback?.(false, err?.message)
  } finally {
    isSyncing.value = false
  }
}

function handleManualSync() {
  performSync(false)
}

function handleSyncFromModal(callback: (success: boolean, message?: string) => void) {
  performSync(false, callback)
}

function handleSelectChar(payload: { type: CharacterType; title: string }) {
  state.selectedCharacter = payload.type
  state.characterTitle = payload.title
  saveState()
  toastRef.value?.show(`已切换为：${payload.title}`)
}

function handleUploadChar(base64Data: string) {
  state.selectedCharacter = 'custom'
  state.characterCustomImg = base64Data
  state.characterTitle = '自定义伙伴'
  saveState()
  toastRef.value?.show('自定义立绘更新成功！')
}

function handleExport() {
  storage.exportJSON()
  toastRef.value?.show('打卡备份数据已导出')
}

async function handleImport(file: File) {
  try {
    const imported = await storage.importJSON(file)
    Object.assign(state, imported)
    toastRef.value?.show('备份数据导入成功！')
    showSettingsModal.value = false
  } catch (e: unknown) {
    const err = e as Error
    toastRef.value?.show(err?.message || '导入失败')
  }
}

function handleClear() {
  storage.clear()
  location.reload()
}

// 键盘快捷键支持 (桌面端)
function handleKeyDown(e: KeyboardEvent) {
  // 避免在输入框中触发快捷键
  const tag = (e.target as HTMLElement)?.tagName?.toLowerCase()
  if (tag === 'input' || tag === 'textarea') return

  if (e.code === 'Space') {
    e.preventDefault()
    // 触发当前未完成项打卡
    const pending = state.todos.find((t) => !t.completed)
    if (pending) {
      handleCheckIn({ todoId: pending.id, note: pending.note || '' })
    }
  } else if (e.key === '1') {
    activeTab.value = 'checkin'
  } else if (e.key === '2') {
    activeTab.value = 'todos'
  } else if (e.key === '3') {
    activeTab.value = 'history'
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  window.addEventListener('keydown', handleKeyDown)

  state.streak = calculateStreak(state.logs, todayStr.value)
  saveState()

  const cfg = webdav.getConfig()
  if (cfg.enabled && cfg.username && cfg.password) {
    performSync(true)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
/* 顶部状态栏 */
.app-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0 16px;
  position: relative;
  z-index: 10;
}

.top-title-group {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.app-star-icon {
  font-size: 20px;
  color: #f3d882;
  filter: drop-shadow(0 0 8px rgba(243, 216, 130, 0.8));
}

.title-text-stack {
  display: flex;
  flex-direction: column;
}

.app-title {
  font-size: 17px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: 0.5px;
  line-height: 1.2;
}

.app-subtitle {
  font-size: 11px;
  color: #5eead4;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.top-icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(14, 25, 52, 0.7);
  border: 1px solid rgba(243, 216, 130, 0.25);
  color: #9ab2d5;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(8px);
}

.top-icon-btn:hover {
  background: rgba(243, 216, 130, 0.2);
  color: #fff0bd;
  border-color: rgba(243, 216, 130, 0.6);
  transform: translateY(-2px);
}

.rotating {
  display: inline-flex;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}

/* 单栏模式主体 */
.single-column-main {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 桌面端双栏网格 */
.dashboard-grid {
  width: 100%;
  flex: 1;
  display: grid;
  grid-template-columns: 460px 1fr;
  gap: 28px;
  align-items: start;
}

.dash-left-column {
  background: rgba(10, 19, 42, 0.5);
  border: 1px solid rgba(243, 216, 130, 0.2);
  border-radius: 24px;
  padding: 20px;
  backdrop-filter: blur(14px);
}

.column-header {
  margin-bottom: 16px;
}

.column-tag {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #5eead4;
  background: rgba(94, 234, 212, 0.12);
  padding: 2px 8px;
  border-radius: 6px;
}

.column-heading {
  font-size: 18px;
  font-weight: 800;
  color: #ffffff;
  margin-top: 4px;
}

.dash-right-column {
  background: rgba(10, 19, 42, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 20px;
  backdrop-filter: blur(14px);
  min-height: 520px;
}

.dash-right-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 12px;
}

.dash-sub-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #9ab2d5;
  font-size: 13px;
  font-weight: 600;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dash-sub-tab.active {
  background: rgba(243, 216, 130, 0.18);
  border-color: rgba(243, 216, 130, 0.5);
  color: #fff0bd;
}

.dash-right-content {
  width: 100%;
}

/* 底部磨砂 Tab 栏 (移动端 / 单栏常驻) */
.bottom-tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: max(60px, calc(60px + env(safe-area-inset-bottom)));
  background: rgba(10, 18, 38, 0.88);
  backdrop-filter: blur(16px);
  border-top: 1px solid rgba(243, 216, 130, 0.25);
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 100;
  box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.5);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  background: transparent;
  border: none;
  color: #657b9e;
  cursor: pointer;
  padding: 8px 0;
  transition: all 0.2s ease;
}

.tab-item.active {
  color: #f3d882;
}

.tab-icon-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.badge-dot {
  position: absolute;
  top: -2px;
  right: -4px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #f87171;
  box-shadow: 0 0 6px #f87171;
}

.tab-label {
  font-size: 11px;
  font-weight: 600;
}

/* 页面切换动效 */
.view-fade-enter-active,
.view-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.view-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.view-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
