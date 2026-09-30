/**
 * 徽章规则引擎
 * 每次打卡后运行，检查是否解锁新徽章
 */

// 徽章定义
export const BADGE_DEFS = [
  { id: '首次产出', icon: '🏅', name: '首次产出', desc: '完成第 1 次打卡' },
  { id: '三日连击', icon: '🔥', name: '三日连击', desc: '连续打卡 3 个工作日' },
  { id: '七日连击', icon: '💎', name: '七日连击', desc: '连续打卡 7 个工作日' },
  { id: '第一单', icon: '💰', name: '第一单', desc: '闲鱼成交第一单' },
  { id: '第一章', icon: '📖', name: '第一章', desc: '网文发布到番茄' },
  { id: '第一片', icon: '🎬', name: '第一片', desc: '漫剧导出 mp4' },
  { id: '技能卡10行', icon: '📚', name: '技能满10', desc: '技能卡积累满 10 条' },
  { id: 'Boss击杀', icon: '👹', name: 'Boss击杀', desc: '完成周六闭环' },
  { id: '重新出发', icon: '🌅', name: '重新出发', desc: '断更后继续打卡' },
]

/**
 * 检查是否有新解锁的徽章
 * @param {Object} data - 游戏数据
 * @returns {string[]} 新解锁的徽章 id 列表
 */
export function checkBadges(data) {
  const newBadges = []
  const has = (id) => data.badges.includes(id)

  // 首次产出
  if (!has('首次产出') && data.logs.length >= 1) {
    newBadges.push('首次产出')
  }

  // 三日连击
  if (!has('三日连击') && data.streak >= 3) {
    newBadges.push('三日连击')
  }

  // 七日连击
  if (!has('七日连击') && data.streak >= 7) {
    newBadges.push('七日连击')
  }

  // 技能卡满 10 条
  if (!has('技能卡10行')) {
    const skillCount = data.logs.filter(l => l.skill && l.skill.trim()).length
    if (skillCount >= 10) {
      newBadges.push('技能卡10行')
    }
  }

  // Boss 击杀
  if (!has('Boss击杀') && data.boss) {
    newBadges.push('Boss击杀')
  }

  // 关卡成就徽章
  if (!has('第一单') && (data.stages?.['闲鱼'] || 0) >= 3) {
    newBadges.push('第一单')
  }
  if (!has('第一章') && (data.stages?.['网文'] || 0) >= 3) {
    newBadges.push('第一章')
  }
  if (!has('第一片') && (data.stages?.['漫剧'] || 0) >= 4) {
    newBadges.push('第一片')
  }

  // 重新出发（断更后第二天继续打卡）
  if (!has('重新出发') && data.hasRestarted) {
    newBadges.push('重新出发')
  }

  return newBadges
}

/**
 * 获取徽章定义信息
 */
export function getBadgeDef(id) {
  return BADGE_DEFS.find(b => b.id === id)
}
