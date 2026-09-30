<template>
  <div class="app-container">
    <!-- 顶部轻量 Toast 通知 -->
    <ToastNotify ref="toastRef" />

    <!-- 顶部状态栏 -->
    <AppHeader
      ref="headerRef"
      :exp="state.exp"
      :streak="state.streak"
      :badge-count="state.badges.length"
    />

    <!-- 极简分段导航（4 个功能视图，告别冗长滚动） -->
    <div class="tab-nav">
      <button
        class="tab-btn"
        :class="{ active: currentTab === 'today' }"
        @click="currentTab = 'today'"
      >
        ⚡ 今日
      </button>
      <button
        class="tab-btn"
        :class="{ active: currentTab === 'stages' }"
        @click="currentTab = 'stages'"
      >
        🗺️ 路线
      </button>
      <button
        class="tab-btn"
        :class="{ active: currentTab === 'assets' }"
        @click="currentTab = 'assets'"
      >
        🏅 资产
      </button>
      <button
        class="tab-btn"
        :class="{ active: currentTab === 'settings' }"
        @click="currentTab = 'settings'"
      >
        ⚙️ 设置
      </button>
    </div>

    <!-- ===== TAB 1: 今日打卡 / Boss / 结算 ===== -->
    <div v-show="currentTab === 'today'">
      <!-- 周一未锁定主线时展示 -->
      <WeekLineSelect
        :show="needsWeekLineSelect"
        @select="handleSelectWeekLine"
      />

      <!-- 启动锚点：前一天打卡留下的微小动作 -->
      <div v-if="lastNextStep && !todayLog && effectiveMode === 'workday'" class="anchor-banner">
        <div class="anchor-icon">🚀</div>
        <div>
          <div class="anchor-title">今日启动锚点</div>
          <div class="anchor-val">{{ lastNextStep }}</div>
        </div>
      </div>

      <!-- 工作日：每日打卡卡片 -->
      <DailyCheckIn
        v-if="effectiveMode === 'workday'"
        :week-line="state.weekLine"
        :today-log="todayLog"
        @checkin="handleDailyCheckIn"
      />

      <!-- 周六：Boss 战与纯爽乐趣 -->
      <BossBattle
        v-if="effectiveMode === 'saturday'"
        :boss-defeated="isBossDefeatedToday"
        :boss-output-text="state.bossOutput"
        @kill="handleKillBoss"
        @fun="handleRecordFun"
      />

      <!-- 周日：成就结算 -->
      <WeeklySettle
        v-if="effectiveMode === 'sunday'"
        :week-stats="currentWeekStats"
        :settled="isWeekSettled"
        :settled-info="latestSettleInfo"
        @settle="handleWeeklySettle"
      />
    </div>

    <!-- ===== TAB 2: 关卡路线 ===== -->
    <div v-show="currentTab === 'stages'">
      <StageMap
        :line="state.weekLine"
        :progress="currentLineProgress"
        @complete-stage="handleCompleteStage"
      />
    </div>

    <!-- ===== TAB 3: 认知与成就资产 ===== -->
    <div v-show="currentTab === 'assets'">
      <BadgeList :badges="state.badges" />
      <SkillCards :logs="state.logs" />
      <RecentLogs :logs="state.logs" />
    </div>

    <!-- ===== TAB 4: 云同步与设置 ===== -->
    <div v-show="currentTab === 'settings'">
      <!-- 坚果云 WebDAV 同步 -->
      <SyncSettings
        :sync-config="state.syncConfig"
        :current-data="state"
        @update-config="handleUpdateSyncConfig"
        @sync-success="handleSyncSuccess"
        @toast="showToast"
      />

      <!-- 本地数据导入导出 -->
      <DataManager
        @export="handleExport"
        @import="handleImport"
        @clear="handleClear"
      />

      <!-- 模式预览测试（收纳于设置页） -->
      <div class="clean-card">
        <div class="card-header">
          <span class="card-title-text">🧪 场景模式预览</span>
        </div>
        <p style="font-size: 12px; color: var(--text-dim); margin-bottom: 12px;">
          默认跟随当前时钟（05:00 切日）。可临时切换预览周六 Boss 或周日结算。
        </p>
        <div class="btn-row">
          <button
            class="clean-btn"
            :style="viewMode === 'auto' ? 'border-color: #3b82f6; color: #fff;' : ''"
            @click="viewMode = 'auto'"
          >
            时钟自动
          </button>
          <button
            class="clean-btn"
            :style="viewMode === 'workday' ? 'border-color: #3b82f6; color: #fff;' : ''"
            @click="viewMode = 'workday'"
          >
            工作日
          </button>
          <button
            class="clean-btn"
            :style="viewMode === 'saturday' ? 'border-color: #3b82f6; color: #fff;' : ''"
            @click="viewMode = 'saturday'"
          >
            周六
          </button>
          <button
            class="clean-btn"
            :style="viewMode === 'sunday' ? 'border-color: #3b82f6; color: #fff;' : ''"
            @click="viewMode = 'sunday'"
          >
            周日
          </button>
        </div>
      </div>
    </div>

    <!-- 明日第一步弹窗 -->
    <NextStepModal
      :show="showNextModal"
      @confirm="handleConfirmNextStep"
      @skip="handleSkipNextStep"
    />
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import ToastNotify from './components/ToastNotify.vue'
import AppHeader from './components/AppHeader.vue'
import WeekLineSelect from './components/WeekLineSelect.vue'
import DailyCheckIn from './components/DailyCheckIn.vue'
import NextStepModal from './components/NextStepModal.vue'
import BossBattle from './components/BossBattle.vue'
import WeeklySettle from './components/WeeklySettle.vue'
import StageMap from './components/StageMap.vue'
import BadgeList from './components/BadgeList.vue'
import SkillCards from './components/SkillCards.vue'
import RecentLogs from './components/RecentLogs.vue'
import SyncSettings from './components/SyncSettings.vue'
import DataManager from './components/DataManager.vue'

import { storage, defaultData } from './stores/storage.js'
import {
  getGameDate,
  getGameDayOfWeek,
  isSaturday,
  isSunday,
  getWeekMonday,
  isConsecutiveWorkday
} from './utils/date.js'
import { checkBadges } from './utils/badges.js'
import { syncData } from './utils/webdav.js'

const toastRef = ref(null)
const headerRef = ref(null)

// 响应式数据
const state = reactive(storage.get())

// 当前标签页：'today' | 'stages' | 'assets' | 'settings'
const currentTab = ref('today')

// 模式控制：'auto' | 'workday' | 'saturday' | 'sunday'
const viewMode = ref('auto')

// 弹窗状态
const showNextModal = ref(false)

// 游戏日期与判定
const today = computed(() => getGameDate())

const effectiveMode = computed(() => {
  if (viewMode.value !== 'auto') return viewMode.value
  if (isSaturday()) return 'saturday'
  if (isSunday()) return 'sunday'
  return 'workday'
})

const needsWeekLineSelect = computed(() => !state.weekLine)

const todayLog = computed(() => {
  return state.logs.find(l => l.date === today.value) || null
})

const isBossDefeatedToday = computed(() => state.boss === today.value)

const currentLineProgress = computed(() => {
  if (!state.weekLine) return 0
  return state.stages[state.weekLine] || 0
})

const lastNextStep = computed(() => {
  if (!state.logs || state.logs.length === 0) return ''
  const prevLogs = state.logs.slice().reverse()
  const found = prevLogs.find(l => l.next && l.next.trim())
  return found ? found.next : ''
})

const latestSettleInfo = computed(() => {
  if (!state.settles || state.settles.length === 0) return null
  return state.settles[state.settles.length - 1]
})

const isWeekSettled = computed(() => {
  const currentWeekMonday = getWeekMonday()
  return state.settles.some(s => s.weekStart === currentWeekMonday || s.date === today.value)
})

const currentWeekStats = computed(() => {
  const currentWeekMonday = getWeekMonday()
  const weekLogs = state.logs.filter(l => l.date >= currentWeekMonday)
  return {
    checkIns: weekLogs.length,
    streak: state.streak,
    line: state.weekLine,
    stageProgress: currentLineProgress.value,
    newBadges: state.badges.slice(-2)
  }
})

function showToast(msg) {
  toastRef.value?.show(msg)
}

function persist() {
  storage.set(state)
}

async function triggerAutoSync() {
  if (!state.syncConfig?.enabled) return
  if (!state.syncConfig.serverUrl || !state.syncConfig.username || !state.syncConfig.password) return

  try {
    const res = await syncData(state.syncConfig, state)
    if (res.success) {
      state.syncConfig.lastSync = new Date().toISOString()
      Object.assign(state, res.merged)
      persist()
    }
  } catch (err) {
    console.warn('[AutoSync] 同步跳过:', err.message)
  }
}

function inspectBadges() {
  const newOnes = checkBadges(state)
  if (newOnes.length > 0) {
    for (const b of newOnes) {
      if (!state.badges.includes(b)) {
        state.badges.push(b)
        showToast(`🏅 解锁新徽章：${b}`)
      }
    }
    persist()
  }
}

function handleSelectWeekLine(line) {
  state.weekLine = line
  state.weekStart = getWeekMonday()
  persist()
  showToast(`🎯 已锁定本周主线：${line}`)
  triggerAutoSync()
}

function handleDailyCheckIn({ output, skill, overload }) {
  const currentDate = today.value
  const lastCheckDate = state.last

  if (isConsecutiveWorkday(lastCheckDate, currentDate)) {
    state.streak += 1
  } else if (lastCheckDate === currentDate) {
    showToast('今天已经打过卡了')
    return
  } else {
    state.maxStreak = Math.max(state.maxStreak || 0, state.streak || 0)
    if (state.logs.length > 0) {
      state.hasRestarted = true
    }
    state.streak = 1
  }

  state.maxStreak = Math.max(state.maxStreak, state.streak)
  state.exp += 1
  state.last = currentDate

  const newLog = {
    date: currentDate,
    line: state.weekLine || '默认主线',
    output,
    skill,
    overload,
    next: ''
  }
  state.logs.push(newLog)

  headerRef.value?.triggerBounce('exp')
  headerRef.value?.triggerBounce('streak')

  if (overload) {
    showToast('💤 挂机通关 +1经验')
  } else {
    showToast('✅ 打卡成功 +1经验')
  }

  inspectBadges()
  persist()
  triggerAutoSync()

  showNextModal.value = true
}

function handleConfirmNextStep(step) {
  showNextModal.value = false
  if (step && state.logs.length > 0) {
    state.logs[state.logs.length - 1].next = step
    persist()
    showToast('🚀 已锁定明天第一步！')
    triggerAutoSync()
  }
}

function handleSkipNextStep() {
  showNextModal.value = false
}

function handleKillBoss(output) {
  state.exp += 2
  state.boss = today.value
  state.bossOutput = output
  headerRef.value?.triggerBounce('exp')

  showToast('👹 Boss 击杀成功！+2 经验')
  inspectBadges()
  persist()
  triggerAutoSync()
}

function handleRecordFun(content) {
  state.funLog.push({
    date: today.value,
    content
  })
  showToast('🎉 纯爽时刻已收录！')
  persist()
  triggerAutoSync()
}

function handleWeeklySettle({ nextLine, nextStep }) {
  const currentWeekMonday = getWeekMonday()
  const weekLogs = state.logs.filter(l => l.date >= currentWeekMonday)

  state.settles.push({
    date: today.value,
    weekStart: currentWeekMonday,
    total: weekLogs.length,
    line: state.weekLine,
    streak: state.streak,
    nextLine,
    nextStep
  })

  state.weekLine = nextLine
  state.weekStart = today.value

  showToast('📊 本周结算完成！已锚定下周主线')
  persist()
  triggerAutoSync()
}

function handleCompleteStage() {
  if (!state.weekLine) return
  if (!state.stages) state.stages = {}
  const cur = state.stages[state.weekLine] || 0
  if (cur < 6) {
    state.stages[state.weekLine] = cur + 1
    showToast(`🎯 通关！进度 ${cur + 1}/6`)
    inspectBadges()
    persist()
    triggerAutoSync()
  }
}

function handleUpdateSyncConfig(newConfig) {
  state.syncConfig = { ...newConfig }
  persist()
}

function handleSyncSuccess(mergedData) {
  Object.assign(state, mergedData)
  persist()
}

function handleExport() {
  storage.exportJSON()
  showToast('⬇️ 数据已导出 JSON')
}

async function handleImport(file) {
  try {
    const data = await storage.importJSON(file)
    Object.assign(state, data)
    showToast('⬆️ 数据恢复成功！')
  } catch (err) {
    showToast('❌ 导入失败：' + err.message)
  }
}

function handleClear() {
  storage.clear()
  Object.assign(state, JSON.parse(JSON.stringify(defaultData)))
  showToast('🗑️ 数据已全部清空')
}

onMounted(() => {
  if (state.syncConfig?.enabled) {
    triggerAutoSync()
  }
})
</script>
