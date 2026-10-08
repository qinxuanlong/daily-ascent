/**
 * 日期时间工具模块 (TypeScript 强类型)
 * 采用 05:00 睡到睡切日逻辑（05:00 前视为前一日，照顾深度学习与夜猫子复盘）
 */
import type { CheckInLog } from '../types'

export interface WeekDayInfo {
  name: string
  dayNum: number
  dateStr: string
}

/** 格式化 Date 为 YYYY-MM-DD */
export function formatDate(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** 格式化时间为 HH:mm 或 HH:mm:ss */
export function formatTime(d: Date = new Date(), withSeconds: boolean = false): string {
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  if (withSeconds) {
    const seconds = String(d.getSeconds()).padStart(2, '0')
    return `${hours}:${minutes}:${seconds}`
  }
  return `${hours}:${minutes}`
}

/** 获取游戏业务日 (05:00 切日) */
export function getGameDate(now: Date = new Date()): string {
  const d = new Date(now)
  if (d.getHours() < 5) {
    d.setDate(d.getDate() - 1)
  }
  return formatDate(d)
}

/** 获取当前周的周一至周日日期列表 */
export function getCurrentWeekDays(now: Date = new Date()): WeekDayInfo[] {
  const d = new Date(now)
  if (d.getHours() < 5) {
    d.setDate(d.getDate() - 1)
  }
  const dow = d.getDay() // 0=周日, 1=周一
  const diffToMonday = dow === 0 ? 6 : dow - 1

  const monday = new Date(d)
  monday.setDate(d.getDate() - diffToMonday)

  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const weekDays: WeekDayInfo[] = []

  for (let i = 0; i < 7; i++) {
    const itemDate = new Date(monday)
    itemDate.setDate(monday.getDate() + i)
    const dateStr = formatDate(itemDate)
    weekDays.push({
      name: labels[i],
      dayNum: itemDate.getDate(),
      dateStr: dateStr
    })
  }

  return weekDays
}

/** 计算连续打卡天数（Streak） */
export function calculateStreak(logs: CheckInLog[] = [], todayStr: string = getGameDate()): number {
  if (!logs || logs.length === 0) return 0

  // 提取去重的所有打卡日期（降序排列）
  const uniqueDates = Array.from(new Set(logs.map(log => log.date))).sort().reverse()
  if (uniqueDates.length === 0) return 0

  let streak = 0
  let checkDate = new Date(todayStr)

  // 如果今天未打卡，检查昨天是否打卡；若昨天也没打卡则连击归零
  if (!uniqueDates.includes(todayStr)) {
    const yesterday = new Date(checkDate)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = formatDate(yesterday)
    if (!uniqueDates.includes(yesterdayStr)) {
      return 0
    }
    // 从昨天开始计算
    checkDate = yesterday
  }

  // 逐日倒推连击
  while (true) {
    const currStr = formatDate(checkDate)
    if (uniqueDates.includes(currStr)) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}
