/**
 * 存储抽象层
 * 当前使用 localStorage，后续可切换到 Supabase / Tauri fs
 */

const STORAGE_KEY = 'daily-ascent-data'

// 默认数据结构
const defaultData = {
  exp: 0,
  streak: 0,
  maxStreak: 0,
  last: null,
  badges: [],
  boss: null,
  bossOutput: null,
  logs: [],
  settles: [],
  weekLine: null,
  weekStart: null,
  stages: {
    '闲鱼': 0,
    '网文': 0,
    '漫剧': 0
  },
  funLog: [],
  // 坚果云 WebDAV 同步配置
  syncConfig: {
    enabled: false,
    serverUrl: 'https://dav.jianguoyun.com/dav/',
    username: '',
    password: '',
    appDir: '/daily-ascent/',
    lastSync: null
  }
}

export const storage = {
  get() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return JSON.parse(JSON.stringify(defaultData))
      const data = JSON.parse(raw)
      // 合并默认值（防止旧数据缺字段）
      return {
        ...JSON.parse(JSON.stringify(defaultData)),
        ...data,
        stages: { ...defaultData.stages, ...(data.stages || {}) },
        syncConfig: { ...defaultData.syncConfig, ...(data.syncConfig || {}) }
      }
    } catch {
      return JSON.parse(JSON.stringify(defaultData))
    }
  },

  set(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  },

  clear() {
    localStorage.removeItem(STORAGE_KEY)
  },

  exportJSON() {
    const data = this.get()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `daily-ascent-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  },

  async importJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result)
          this.set({ ...JSON.parse(JSON.stringify(defaultData)), ...data })
          resolve(data)
        } catch {
          reject(new Error('JSON 格式错误'))
        }
      }
      reader.onerror = () => reject(new Error('文件读取失败'))
      reader.readAsText(file)
    })
  }
}

export { defaultData }
