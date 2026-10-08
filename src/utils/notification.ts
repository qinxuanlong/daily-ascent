import { LocalNotifications } from '@capacitor/local-notifications'
import { Capacitor } from '@capacitor/core'

/** 通知渠道与通知 ID 常量 */
const CHANNEL_ID = 'daily_reminder_channel'
const REMINDER_NOTIFICATION_ID = 1001
const TEST_NOTIFICATION_ID = 9999
const STORAGE_KEY = 'daily_ascent_notification_config'

/** 通知配置类型定义 */
export interface NotificationConfig {
  enabled: boolean
  time: string // "HH:mm"，如 "21:00"
  title: string
  body: string
}

/** 默认通知配置 */
export const DEFAULT_NOTIFICATION_CONFIG: NotificationConfig = {
  enabled: false,
  time: '21:00',
  title: '🎮 每日攀升打卡提醒',
  body: '今晚打卡了吗？有产出就是升级，哪怕一行也算通关 ⭐'
}

/** 读取当前本地保存的通知配置 */
export function getNotificationConfig(): NotificationConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_NOTIFICATION_CONFIG }
    const parsed = JSON.parse(raw)
    return {
      enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : DEFAULT_NOTIFICATION_CONFIG.enabled,
      time: typeof parsed.time === 'string' && /^\d{2}:\d{2}$/.test(parsed.time) ? parsed.time : DEFAULT_NOTIFICATION_CONFIG.time,
      title: parsed.title || DEFAULT_NOTIFICATION_CONFIG.title,
      body: parsed.body || DEFAULT_NOTIFICATION_CONFIG.body
    }
  } catch {
    return { ...DEFAULT_NOTIFICATION_CONFIG }
  }
}

/** 保存通知配置到本地 */
export function saveNotificationConfig(config: NotificationConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  } catch (err) {
    console.error('保存通知配置失败:', err)
  }
}

/** 确保通知渠道在 Android 端已创建 */
async function ensureAndroidChannel(): Promise<void> {
  if (Capacitor.getPlatform() !== 'android') return
  try {
    await LocalNotifications.createChannel({
      id: CHANNEL_ID,
      name: '每日打卡提醒',
      description: '在指定时间提醒完成今日目标与专注打卡',
      importance: 4, // HIGH 优先级
      visibility: 1, // PUBLIC 锁屏可见
      vibration: true
    })
  } catch (err) {
    console.warn('创建通知渠道失败 (若非原生环境可忽略):', err)
  }
}

/** 请求通知权限 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (Capacitor.isNativePlatform()) {
    try {
      const status = await LocalNotifications.requestPermissions()
      return status.display === 'granted'
    } catch (err) {
      console.error('请求原生通知权限失败:', err)
      return false
    }
  }

  // 网页浏览器降级兼容
  if (typeof window !== 'undefined' && 'Notification' in window) {
    try {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    } catch {
      return false
    }
  }

  return false
}

/** 检查是否已拥有通知权限 */
export async function checkNotificationPermission(): Promise<boolean> {
  if (Capacitor.isNativePlatform()) {
    try {
      const status = await LocalNotifications.checkPermissions()
      return status.display === 'granted'
    } catch {
      return false
    }
  }

  if (typeof window !== 'undefined' && 'Notification' in window) {
    return Notification.permission === 'granted'
  }

  return false
}

/** 配置并注册每日定时打卡提醒 */
export async function setupDailyReminder(config: NotificationConfig): Promise<boolean> {
  // 保存新配置
  saveNotificationConfig(config)

  if (!config.enabled) {
    await cancelDailyReminder()
    return true
  }

  // 检查/申请权限
  const hasPermission = await requestNotificationPermission()
  if (!hasPermission) {
    // 权限被拒绝，重置开启状态
    saveNotificationConfig({ ...config, enabled: false })
    return false
  }

  const [hourStr, minuteStr] = config.time.split(':')
  const hour = parseInt(hourStr, 10) || 21
  const minute = parseInt(minuteStr, 10) || 0

  if (Capacitor.isNativePlatform()) {
    try {
      await ensureAndroidChannel()
      // 先取消旧的定时提醒
      await LocalNotifications.cancel({
        notifications: [{ id: REMINDER_NOTIFICATION_ID }]
      })

      // 注册每日定时提醒
      await LocalNotifications.schedule({
        notifications: [
          {
            id: REMINDER_NOTIFICATION_ID,
            title: config.title || DEFAULT_NOTIFICATION_CONFIG.title,
            body: config.body || DEFAULT_NOTIFICATION_CONFIG.body,
            schedule: {
              on: {
                hour,
                minute
              },
              allowWhileIdle: true
            },
            channelId: CHANNEL_ID,
            smallIcon: 'ic_launcher_round'
          }
        ]
      })
      return true
    } catch (err) {
      console.error('设置原生定时通知失败:', err)
      return false
    }
  }

  return true
}

/** 取消每日定时提醒 */
export async function cancelDailyReminder(): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    try {
      await LocalNotifications.cancel({
        notifications: [{ id: REMINDER_NOTIFICATION_ID }]
      })
    } catch (err) {
      console.warn('取消通知失败:', err)
    }
  }
}

/** 发送即时测试通知 */
export async function sendTestNotification(): Promise<boolean> {
  const hasPermission = await requestNotificationPermission()
  if (!hasPermission) {
    return false
  }

  const config = getNotificationConfig()

  if (Capacitor.isNativePlatform()) {
    try {
      await ensureAndroidChannel()
      await LocalNotifications.schedule({
        notifications: [
          {
            id: TEST_NOTIFICATION_ID,
            title: '🎮 每日攀升 - 通知测试',
            body: config.body || DEFAULT_NOTIFICATION_CONFIG.body,
            schedule: {
              at: new Date(Date.now() + 1000) // 1 秒后触发
            },
            channelId: CHANNEL_ID,
            smallIcon: 'ic_launcher_round'
          }
        ]
      })
      return true
    } catch (err) {
      console.error('发送原生测试通知失败:', err)
      return false
    }
  }

  // Web 端测试通知
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    new Notification('🎮 每日攀升 - 通知测试', {
      body: config.body || DEFAULT_NOTIFICATION_CONFIG.body,
      icon: './pwa-192x192.png'
    })
    return true
  }

  return false
}
