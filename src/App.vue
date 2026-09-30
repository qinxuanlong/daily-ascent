<template>
  <div class="app-container">
    <!-- 顶部 Toast 提示 -->
    <ToastNotify ref="toastRef" />

    <!-- 顶部状态栏 -->
    <AppHeader
      ref="headerRef"
      :exp="state.exp"
      :streak="state.streak"
      :badge-count="state.badges.length"
    />

    <!-- 调试/预览模式切换条（仅在需要手动预览周六/周日体验时切换） -->
    <div style="display: flex; justify-content: center; gap: 8px; margin-bottom: 14px; font-size: 12px;">
      <button
        class="btn btn-ghost"
        style="padding: 4px 10px; font-size: 11px;"
        :class="{ 'btn-primary': viewMode === 'auto' }"
        @click="viewMode = 'auto'"
      >
        ⏰ 自动时钟 ({{ todayText }})
      </button>
      <button
        class="btn btn-ghost"
        style="padding: 4px 10px; font-size: 11px;"
        :class="{ 'btn-primary': viewMode === 'workday' }"
        @click="viewMode = 'workday'"
      >
        📋 工作日打卡
      </button>
      <button
        class="btn btn-ghost"
        style="padding: 4px 10px; font-size: 11px;"
        :class="{ 'btn-primary': viewMode === 'saturday' }"
        @click="viewMode = 'saturday'"
      >
        👹 周六 Boss
      </button>
      <button
        class="btn btn-ghost"
        style="padding: 4px 10px; font-size: 11px;"
        :class="{ 'btn-primary': viewMode === 'sunday' }"
        @click="viewMode = 'sunday'"
      >
        📊 周日结算
      </button>
    </div>

    <!-- 0. 周主线选择（若本周未选主线，则优先展示选择卡片） -->
    <WeekLineSelect
      :show="needsWeekLineSelect"
      @select="handleSelectWeekLine"
    />

    <!-- 1. 明日第一步启动锚点（上次打卡留下的行动提示） -->
    <div v-if="lastNextStep && !todayLog && effectiveMode === 'workday'" class="next-step-hint">
      <div class="hint-icon">🚀</div>
      <div class="hint-text">
        <span>今日启动锚点：</span>
        <span class="hint-content">{{ lastNextStep }}</span>
      </div>
    </div>

    <!-- 2. 工作日打卡模式 -->
    <DailyCheckIn
      v-if="effectiveMode === 'workday'"
      :week-line="state.weekLine"
      :today-log="todayLog"
      @checkin="handleDailyCheckIn"
    />

    <!-- 3. 周六 Boss 战模式 -->
    <BossBattle
      v-if="effectiveMode === 'saturday'"
      :boss-defeated="isBossDefeatedToday"
      :boss-output-text="state.bossOutput"
      @kill="handleKillBoss"
      @fun="handleRecordFun"
    />

    <!-- 4. 周日结算模式 -->
    <WeeklySettle
      v-if="effectiveMode === 'sunday'"
      :week-stats="currentWeekStats"
      :settled="isWeekSettled"
      :settled-info="latestSettleInfo"
      @settle="handleWeeklySettle"
    />

    <!-- 5. 关卡路线图 -->
    <StageMap
      :line="state.weekLine"
      :progress="currentLineProgress"
      @complete-stage="handleCompleteStage"
    />

    <!-- 6. 徽章墙 -->
    <BadgeList :badges="state.badges" />

    <!-- 7. 技能卡集 -->
    <SkillCards :logs="state.logs" />

    <!-- 8. 最近打卡记录 -->
    <RecentLogs :logs="state.logs" />

    <!-- 9. 坚果云 WebDAV 同步 -->
    <SyncSettings
      :sync-config="state.syncConfig"
      :current-data="state"
      @update-config="handleUpdateSyncConfig"
      @sync-success="handleSyncSuccess"
      @toast="showToast"
    />

    <!-- 10. 本地数据备份与管理 -->
    <DataManager
      @export="handleExport"
      @import="handleImport"
      @clear="handleClear"
    />

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
  isWorkday,
  isSaturday,
  isSunday,
  getWeekMonday,
  isConsecutiveWorkday
} from './utils/date.js'
import { checkBadges } from './utils/badges.js'
import { syncData } from './utils/webdav.js'

// 组件引用
const toastRef = ref(null)
const headerRef = ref(null)

// 响应式状态
const state = reactive(storage.get())

// 视图模式：'auto' 自动跟随时间，或手动强制 'workday' / 'saturday' / 'sunday'
const viewMode = ref('auto')

// 弹窗状态
const showNextModal = ref(false)

// 今日游戏日期（05:00 切换）
const today = computed(() => getGameDate())
const todayDow = computed(() => getGameDayOfWeek())
const todayText = computed(() => {
  const dows = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${today.value} ${dows[todayDow.value]}`
})

// 判定生效的业务模式
const effectiveMode = computed(() => {
  if (viewMode.value !== 'auto') return viewMode.value
  if (isSaturday()) return 'saturday'
  if (isSunday()) return 'sunday'
  return 'workday'
})

// 是否需要选择本周主线（未选择主线）
const needsWeekLineSelect = computed(() => {
  return !state.weekLine
})

// 今日打卡记录
const todayLog = computed(() => {
  return state.logs.find(l => l.date === today.value) || null
})

// 今日 Boss 是否已击杀
const isBossDefeatedToday = computed(() => {
  return state.boss === today.value
})

// 当前主线的关卡进度
const currentLineProgress = computed(() => {
  if (!state.weekLine) return 0
  return state.stages[state.weekLine] || 0
})

// 上次打卡留下的“明日第一步”提示
const lastNextStep = computed(() => {
  if (!state.logs || state.logs.length === 0) return ''
  const prevLogs = state.logs.slice().reverse()
  const found = prevLogs.find(l => l.next && l.next.trim())
  return found ? found.next : ''
})

// 本周结算情况
const latestSettleInfo = computed(() => {
  if (!state.settles || state.settles.length === 0) return null
  return state.settles[state.settles.length - 1]
})

const isWeekSettled = computed(() => {
  const currentWeekMonday = getWeekMonday()
  return state.settles.some(s => s.weekStart === currentWeekMonday || s.date === today.value)
})

// 本周数据汇总
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

// Toast 辅助方法
function showToast(msg) {
  toastRef.value?.show(msg)
}

// 保存数据至 localStorage
function persist() {
  storage.set(state)
}

// 自动后台同步（若启用了坚果云 WebDAV）
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
    console.warn('[AutoSync] 自动同步跳过:', err.message)
  }
}

// 检查并解锁新徽章
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

// 选择周主线
function handleSelectWeekLine(line) {
  state.weekLine = line
  state.weekStart = getWeekMonday()
  persist()
  showToast(`🎯 已锁定本周主线：${line}`)
  triggerAutoSync()
}

// 每日打卡核心逻辑
function handleDailyCheckIn({ output, skill, overload }) {
  const currentDate = today.value

  // 1. 连击计算：断更不清零，记录历史最高
  const lastCheckDate = state.last
  if (isConsecutiveWorkday(lastCheckDate, currentDate)) {
    // 连续工作日打卡
    state.streak += 1
  } else if (lastCheckDate === currentDate) {
    showToast('今天已经打过卡了')
    return
  } else {
    // 断更后重新开始
    state.maxStreak = Math.max(state.maxStreak || 0, state.streak || 0)
    if (state.logs.length > 0) {
      state.hasRestarted = true
    }
    state.streak = 1
  }

  state.maxStreak = Math.max(state.maxStreak, state.streak)
  state.exp += 1
  state.last = currentDate

  // 写入日志
  const newLog = {
    date: currentDate,
    line: state.weekLine || '默认主线',
    output,
    skill,
    overload,
    next: ''
  }
  state.logs.push(newLog)

  // 触发动效
  headerRef.value?.triggerBounce('exp')
  headerRef.value?.triggerBounce('streak')

  if (overload) {
    showToast('💤 挂机模式打卡成功 +1经验')
  } else {
    showToast('✅ 打卡成功 +1经验')
  }

  // 检查徽章
  inspectBadges()

  // 持久化与同步
  persist()
  triggerAutoSync()

  // 弹出“明日第一步”输入弹窗
  showNextModal.value = true
}

// 明日第一步确认
function handleConfirmNextStep(step) {
  showNextModal.value = false
  if (step && state.logs.length > 0) {
    state.logs[state.logs.length - 1].next = step
    persist()
    showToast('🚀 已锁定明天第一步！')
    triggerAutoSync()
  }
}

// 跳过明日第一步
function handleSkipNextStep() {
  showNextModal.value = false
}

// 周六击杀 Boss
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

// 记录纯爽乐趣
function handleRecordFun(content) {
  state.funLog.push({
    date: today.value,
    content
  })
  showToast('🎉 乐趣时刻已收录！')
  persist()
  triggerAutoSync()
}

// 周日完成结算
function handleWeeklySettle({ nextLine, nextStep }) {
  const currentWeekMonday = getWeekMonday()
  const weekLogs = state.logs.filter(l => l.date >= currentWeekMonday)

  const settleRecord = {
    date: today.value,
    weekStart: currentWeekMonday,
    total: weekLogs.length,
    line: state.weekLine,
    streak: state.streak,
    nextLine,
    nextStep
  }
  state.settles.push(settleRecord)

  // 切换为下周主线
  state.weekLine = nextLine
  state.weekStart = today.value

  showToast('📊 本周结算圆满完成！已锁定下周主线')
  persist()
  triggerAutoSync()
}

// 手动推进关卡
function handleCompleteStage() {
  if (!state.weekLine) return
  if (!state.stages) state.stages = {}
  const cur = state.stages[state.weekLine] || 0
  if (cur < 6) {
    state.stages[state.weekLine] = cur + 1
    showToast(`🎯 顺利通关！进度达到 ${cur + 1}/6`)
    inspectBadges()
    persist()
    triggerAutoSync()
  }
}

// 更新同步配置
function handleUpdateSyncConfig(newConfig) {
  state.syncConfig = { ...newConfig }
  persist()
}

// 同步成功后合并状态
function handleSyncSuccess(mergedData) {
  Object.assign(state, mergedData)
  persist()
}

// 导出 JSON
function handleExport() {
  storage.exportJSON()
  showToast('⬇️ 数据已成功导出为 JSON')
}

// 导入 JSON
async function handleImport(file) {
  try {
    const data = await storage.importJSON(file)
    Object.assign(state, data)
    showToast('⬆️ 数据导入成功！')
  } catch (err) {
    showToast('❌ 导入失败：' + err.message)
  }
}

// 清空本地数据
function handleClear() {
  storage.clear()
  Object.assign(state, JSON.parse(JSON.stringify(defaultData)))
  showToast('🗑️ 本地数据已全部清空')
}

// 挂载时尝试一次静默同步
onMounted(() => {
  if (state.syncConfig?.enabled) {
    triggerAutoSync()
  }
})
</script>
