/**
 * 坚果云 WebDAV 同步服务模块 (TypeScript 强类型)
 * 负责本地打卡及待办数据与坚果云云端 (/daily-ascent/data.json) 的自动双向合并与持久化
 */
import type { AppDataState, CheckInLog, TodoItem } from '../types'

const WEBDAV_STORAGE_KEY = 'daily-ascent-webdav-config'

export interface WebDavStoredConfig {
  enabled: boolean
  username: string
  password: string
  serverUrl: string
  appDir: string
  autoSync: boolean
  lastSyncTime: string
}

export const defaultWebdavConfig: WebDavStoredConfig = {
  enabled: true,
  username: '',
  password: '',
  serverUrl: 'https://dav.jianguoyun.com/dav/',
  appDir: 'daily-ascent',
  autoSync: true,
  lastSyncTime: ''
}

export interface SyncResponse {
  success: boolean
  message: string
  data?: AppDataState
}

export const webdav = {
  // 获取配置
  getConfig(): WebDavStoredConfig {
    try {
      const raw = localStorage.getItem(WEBDAV_STORAGE_KEY)
      if (!raw) return { ...defaultWebdavConfig }
      return { ...defaultWebdavConfig, ...JSON.parse(raw) }
    } catch {
      return { ...defaultWebdavConfig }
    }
  },

  // 保存配置
  saveConfig(config: WebDavStoredConfig): void {
    try {
      localStorage.setItem(WEBDAV_STORAGE_KEY, JSON.stringify(config))
    } catch (e) {
      console.error('保存 WebDAV 配置失败:', e)
    }
  },

  // 计算请求基础 URL (开发环境下自动通过 Vite 代理绕过 CORS)
  getBaseUrl(): string {
    const cfg = this.getConfig()
    if (import.meta.env.DEV) {
      return '/api/dav/'
    }
    return cfg.serverUrl.endsWith('/') ? cfg.serverUrl : `${cfg.serverUrl}/`
  },

  // 获取云端文件与目录路径
  getUrls(): { dirUrl: string; fileUrl: string } {
    const base = this.getBaseUrl()
    const cfg = this.getConfig()
    const dir = cfg.appDir.replace(/^\/|\/$/g, '')
    const dirUrl = `${base}${dir}/`
    const fileUrl = `${dirUrl}data.json`
    return { dirUrl, fileUrl }
  },

  // 构造 Basic Auth 授权头
  getHeaders(): Record<string, string> {
    const cfg = this.getConfig()
    const credentials = btoa(unescape(encodeURIComponent(`${cfg.username}:${cfg.password}`)))
    return {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json; charset=utf-8'
    }
  },

  // 1. 测试连接并确保云端目录存在
  async testConnection(): Promise<{ success: boolean; message: string }> {
    const { dirUrl } = this.getUrls()
    const headers = this.getHeaders()

    try {
      // 尝试创建目录 MKCOL
      const res = await fetch(dirUrl, {
        method: 'MKCOL',
        headers
      })

      // 201(创建成功), 405(已存在), 200/204 均代表连通成功
      if (res.status === 201 || res.status === 405 || res.ok) {
        return { success: true, message: '坚果云连接正常，目录已就绪 ✦' }
      } else if (res.status === 401) {
        return { success: false, message: '坚果云账号或应用密码错误，请检查' }
      } else {
        return { success: false, message: `连接异常 (HTTP ${res.status})` }
      }
    } catch {
      return {
        success: false,
        message: '网络连接失败，若在浏览器生产静态页面请确认是否支持跨域/代理'
      }
    }
  },

  // 2. 从坚果云拉取数据
  async fetchCloudData(): Promise<AppDataState | null> {
    const { fileUrl } = this.getUrls()
    const headers = this.getHeaders()

    try {
      const res = await fetch(fileUrl, {
        method: 'GET',
        headers
      })

      if (res.status === 200) {
        return (await res.json()) as AppDataState
      } else if (res.status === 404) {
        return null
      }
      return null
    } catch (e) {
      console.warn('拉取云端数据失败:', e)
      return null
    }
  },

  // 3. 上传数据到坚果云
  async uploadData(data: AppDataState): Promise<boolean> {
    await this.testConnection()

    const { fileUrl } = this.getUrls()
    const headers = this.getHeaders()

    const payload = {
      ...data,
      version: 2,
      last_synced_at: new Date().toISOString()
    }

    try {
      const res = await fetch(fileUrl, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload, null, 2)
      })

      if (res.ok || res.status === 201 || res.status === 204) {
        const cfg = this.getConfig()
        cfg.lastSyncTime = new Date().toLocaleString('zh-CN', { hour12: false })
        this.saveConfig(cfg)
        return true
      }
      return false
    } catch {
      return false
    }
  },

  // 4. 双向智能合并（本地与云端）
  merge(localData: AppDataState, cloudData: AppDataState | null): AppDataState {
    if (!cloudData) return localData

    // 合并历史流水 logs（按 id 去重）
    const logMap = new Map<string, CheckInLog>()

    if (Array.isArray(cloudData.logs)) {
      cloudData.logs.forEach((item) => {
        if (item && item.id) logMap.set(String(item.id), item)
      })
    }

    if (Array.isArray(localData.logs)) {
      localData.logs.forEach((item) => {
        if (item && item.id) logMap.set(String(item.id), item)
      })
    }

    const mergedLogs = Array.from(logMap.values()).sort((a, b) => {
      const timeA = `${a.date} ${a.time || ''}`
      const timeB = `${b.date} ${b.time || ''}`
      return timeB.localeCompare(timeA)
    })

    // 合并待办项 todos (按 id 去重，采用 updatedAt 较新者优先)
    const todoMap = new Map<string, TodoItem>()
    if (Array.isArray(cloudData.todos)) {
      cloudData.todos.forEach((item) => {
        if (item && item.id) todoMap.set(String(item.id), item)
      })
    }
    if (Array.isArray(localData.todos)) {
      localData.todos.forEach((item) => {
        if (item && item.id) {
          const existing = todoMap.get(String(item.id))
          if (!existing || (item.updatedAt || 0) >= (existing.updatedAt || 0)) {
            todoMap.set(String(item.id), item)
          }
        }
      })
    }
    const mergedTodos = Array.from(todoMap.values()).sort((a, b) => a.order - b.order)

    // 经验值保底
    const calculatedExp = mergedLogs.reduce((acc, cur) => acc + (cur.exp || 50), 0)
    const finalExp = Math.max(localData.exp || 0, cloudData.exp || 0, calculatedExp)

    return {
      ...localData,
      exp: finalExp,
      selectedCharacter: localData.selectedCharacter || cloudData.selectedCharacter || 'venti',
      characterTitle: localData.characterTitle || cloudData.characterTitle || '温迪',
      characterCustomImg: localData.characterCustomImg || cloudData.characterCustomImg || '',
      maxStreak: Math.max(localData.maxStreak || 0, cloudData.maxStreak || 0),
      todos: mergedTodos,
      logs: mergedLogs,
      lastActiveDate: localData.lastActiveDate || cloudData.lastActiveDate || ''
    }
  },

  // 5. 执行一次完整的双向同步
  async sync(localData: AppDataState): Promise<SyncResponse> {
    const cfg = this.getConfig()
    if (!cfg.enabled || !cfg.username || !cfg.password) {
      return { success: false, message: '请先配置坚果云账号与应用密码' }
    }

    try {
      const cloudData = await this.fetchCloudData()
      const mergedData = this.merge(localData, cloudData)
      const uploaded = await this.uploadData(mergedData)

      if (uploaded) {
        return {
          success: true,
          data: mergedData,
          message: '坚果云双向同步成功 ✦'
        }
      } else {
        return { success: false, message: '上传到坚果云失败，请检查网络或授权' }
      }
    } catch (e: unknown) {
      const err = e as Error
      return { success: false, message: `同步异常: ${err?.message || String(e)}` }
    }
  }
}
