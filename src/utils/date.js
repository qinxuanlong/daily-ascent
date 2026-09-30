/**
 * 日期工具
 * 使用 05:00 作为一天的切分点（"睡到睡"周期）
 */

// 获取"游戏日"：05:00 前算前一天
export function getGameDate(now = new Date()) {
  const d = new Date(now)
  if (d.getHours() < 5) {
    d.setDate(d.getDate() - 1)
  }
  return formatDate(d)
}

// 格式化日期为 YYYY-MM-DD
export function formatDate(d) {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 获取游戏日的星期几（0=周日, 1=周一, ...6=周六）
export function getGameDayOfWeek(now = new Date()) {
  const d = new Date(now)
  if (d.getHours() < 5) {
    d.setDate(d.getDate() - 1)
  }
  return d.getDay()
}

// 判断是否工作日（周一到周五）
export function isWorkday(now = new Date()) {
  const dow = getGameDayOfWeek(now)
  return dow >= 1 && dow <= 5
}

// 判断是否周六
export function isSaturday(now = new Date()) {
  return getGameDayOfWeek(now) === 6
}

// 判断是否周日
export function isSunday(now = new Date()) {
  return getGameDayOfWeek(now) === 0
}

// 获取本周一的日期
export function getWeekMonday(now = new Date()) {
  const d = new Date(now)
  if (d.getHours() < 5) {
    d.setDate(d.getDate() - 1)
  }
  const dow = d.getDay()
  const diff = dow === 0 ? 6 : dow - 1
  d.setDate(d.getDate() - diff)
  return formatDate(d)
}

// 获取上一个工作日
export function getPreviousWorkday(dateStr) {
  const d = new Date(dateStr)
  do {
    d.setDate(d.getDate() - 1)
  } while (d.getDay() === 0 || d.getDay() === 6)
  return formatDate(d)
}

// 判断两个日期是否是连续工作日
export function isConsecutiveWorkday(lastDate, todayDate) {
  if (!lastDate) return false
  const prev = getPreviousWorkday(todayDate)
  return lastDate === prev
}

// 短日期显示：01-10
export function shortDate(dateStr) {
  if (!dateStr) return ''
  return dateStr.slice(5)
}
