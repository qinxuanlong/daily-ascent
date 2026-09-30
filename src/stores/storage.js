/**
 * 本地存储服务层
 * 封装 localStorage，管理打卡记录、经验值、连续天数及立绘设置
 */

const STORAGE_KEY = 'daily-ascent-genshin-data'

// 默认初始数据
export const defaultData = {
  exp: 170, // 初始经验 (Lv.2 70/100 EXP)
  streak: 1, // 当前连续打卡天数
  maxStreak: 1, // 历史最高连击
  selectedCharacter: 'venti', // 默认立绘：venti | aether | custom
  characterCustomImg: '', // 用户自定义立绘 Base64
  characterTitle: '温迪', // 称号
  logs: [] // 打卡历史流水 [{ id, date, time, exp, note }]
}

export const storage = {
  // 获取本地数据（带默认值保底）
  get() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return JSON.parse(JSON.stringify(defaultData))
      const parsed = JSON.parse(raw)
      return {
        ...JSON.parse(JSON.stringify(defaultData)),
        ...parsed
      }
    } catch {
      return JSON.parse(JSON.stringify(defaultData))
    }
  },

  // 保存数据
  set(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (e) {
      console.error('保存本地数据失败:', e)
    }
  },

  // 清空数据重置为默认
  clear() {
    localStorage.removeItem(STORAGE_KEY)
  },

  // 导出 JSON 备份文件
  exportJSON() {
    const data = this.get()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `daily-checkin-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  },

  // 导入 JSON 备份文件
  async importJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result)
          const merged = { ...JSON.parse(JSON.stringify(defaultData)), ...data }
          this.set(merged)
          resolve(merged)
        } catch {
          reject(new Error('JSON 格式错误，无法解析'))
        }
      }
      reader.onerror = () => reject(new Error('文件读取失败'))
      reader.readAsText(file)
    })
  }
}
