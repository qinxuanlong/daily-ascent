/**
 * 本地存储服务层 (TypeScript 强类型)
 * 封装 localStorage，管理打卡记录、经验值、待办任务集、连续天数及立绘设置
 * 内置 05:00 睡到睡切日跨日重置机制
 */
import type { AppDataState, TodoItem } from '../types'
import { getGameDate } from '../utils/date'

const STORAGE_KEY = 'daily-ascent-genshin-data'

export const defaultTodos: TodoItem[] = [
  {
    id: 'habit-1',
    title: '深度专注学习 45 分钟',
    type: 'habit',
    time: '09:30',
    completed: false,
    streak: 1,
    order: 1,
    updatedAt: Date.now()
  },
  {
    id: 'habit-2',
    title: '核心技能与算法精进',
    type: 'habit',
    time: '14:30',
    completed: false,
    streak: 1,
    order: 2,
    updatedAt: Date.now()
  },
  {
    id: 'habit-3',
    title: '晚间复盘与明日第一步',
    type: 'habit',
    time: '21:30',
    completed: false,
    streak: 1,
    order: 3,
    updatedAt: Date.now()
  }
]

// 默认初始数据
export const defaultData: AppDataState = {
  exp: 170, // 初始经验 (Lv.2 70/100 EXP)
  streak: 1, // 当前连续打卡天数
  maxStreak: 1, // 历史最高连击
  selectedCharacter: 'venti', // 默认立绘
  characterCustomImg: '', // 用户自定义立绘 Base64
  characterTitle: '温迪', // 称号
  todos: defaultTodos,
  logs: [], // 打卡历史流水
  lastActiveDate: getGameDate() // 上次业务日
}

export const storage = {
  // 获取本地数据（带默认值保底与跨日 05:00 自动重置）
  get(): AppDataState {
    const todayGameDate = getGameDate()
    let data: AppDataState

    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        data = JSON.parse(JSON.stringify(defaultData))
      } else {
        const parsed = JSON.parse(raw)
        data = {
          ...JSON.parse(JSON.stringify(defaultData)),
          ...parsed
        }
      }
    } catch {
      data = JSON.parse(JSON.stringify(defaultData))
    }

    // 确保 todos 存在
    if (!Array.isArray(data.todos) || data.todos.length === 0) {
      data.todos = JSON.parse(JSON.stringify(defaultTodos))
    }

    // 跨日检测：如果已进入新的游戏业务日 (05:00 切日)
    if (data.lastActiveDate !== todayGameDate) {
      // 1. 每日循环习惯自动重置为未打卡
      data.todos = data.todos
        .filter(todo => !(todo.type === 'once' && todo.completed)) // 清理昨日已完成的临时待办
        .map(todo => {
          if (todo.type === 'habit') {
            return {
              ...todo,
              completed: false,
              completedAt: undefined,
              note: undefined
            }
          }
          return todo
        })

      data.lastActiveDate = todayGameDate
      this.set(data)
    }

    return data
  },

  // 保存数据
  set(data: AppDataState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (e) {
      console.error('保存本地数据失败:', e)
    }
  },

  // 清空数据重置为默认
  clear(): void {
    localStorage.removeItem(STORAGE_KEY)
  },

  // 导出 JSON 备份文件
  exportJSON(): void {
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
  async importJSON(file: File): Promise<AppDataState> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const raw = e.target?.result as string
          const parsed = JSON.parse(raw)
          const merged: AppDataState = {
            ...JSON.parse(JSON.stringify(defaultData)),
            ...parsed
          }
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
