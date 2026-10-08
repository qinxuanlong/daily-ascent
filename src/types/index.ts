/**
 * 每日攀升 (Daily Ascent) 领域模型类型定义
 * 全站严格遵循 TypeScript 强类型规范
 */

/** 待办打卡任务类型：每日习惯 (habit) | 当日临时待办 (once) */
export type TodoType = 'habit' | 'once'

/** 专注计时模式：25分番茄 | 45分深度 | 正向心流计时 */
export type FocusTimerMode = 'pomodoro25' | 'pomodoro45' | 'stopwatch'

/** 日志生成来源：真实专注 (focus) | 快捷补记备忘 (manual) */
export type LogSource = 'focus' | 'manual'

/** 待办打卡任务数据模型 */
export interface TodoItem {
  id: string
  title: string
  type: TodoType
  time?: string          // 计划时间，例如 "09:00"
  completed: boolean     // 今日是否已完成
  completedAt?: string   // 完成打卡的时间戳 ISO 格式
  note?: string          // 打卡心得选填
  streak?: number        // 习惯连续达成天数 (仅 habit 有效)
  order: number          // 排序权重 (升序排布)
  updatedAt: number      // 变更时间戳，供 WebDAV 细粒度同步合并去重
  deleted?: boolean      // 软删除标记
  deletedAt?: number     // 软删除时间戳
}

/** 成果资产与打卡记录流水模型 */
export interface CheckInLog {
  id: string
  date: string           // 业务归属日期 YYYY-MM-DD (基于 05:00 睡切日划分)
  time: string           // 打卡发生时刻 HH:mm:ss
  todoId?: string        // 关联的待办项 ID
  todoTitle?: string     // 关联的待办项标题快照
  exp: number            // 本次打卡赋予经验值 (+50/+100 等，manual 补记固定为 0)
  note: string           // 本次完成了什么 / 成果沉淀总结
  durationMinutes?: number // 真实专注时长 (分钟，manual 补记为 0)
  quantity?: string      // 产出计数 (选填，如 "2题" / "1000字")

  source: LogSource      // 核心标记：真实心流专注 (focus) 还是补记 (manual)
  startedAt?: string     // 专注开始时间 ISO 格式 (供跨日准确归属计算)
  endedAt?: string       // 专注结束时间 ISO 格式
  updatedAt: number      // 变更时间戳，供 WebDAV 细粒度合并
  deleted?: boolean      // 软删除标记
  deletedAt?: number     // 软删除时间戳
}

/** 应用全局本地存储与运行状态模型 */
export interface AppDataState {
  exp: number
  streak: number
  maxStreak: number
  selectedCharacter?: string
  characterCustomImg?: string
  characterTitle?: string
  todos: TodoItem[]
  logs: CheckInLog[]
  lastActiveDate: string // 上次活跃日期 (供跨日 05:00 自动重置计算)
}

/** 坚果云 WebDAV 连接与同步配置 */
export interface WebDavConfig {
  url: string
  username: string
  appPassword: string
  autoSync: boolean
}

/** 同步操作执行结果 */
export interface SyncResult {
  success: boolean
  message: string
  details?: string
}

/** 页面视图切换枚举 */
export type ActiveTab = 'checkin' | 'todos' | 'history'
