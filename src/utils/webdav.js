/**
 * 坚果云 WebDAV 同步服务
 * 基于 fetch API + Basic Auth 实现
 * 离线优先：本地 localStorage 为主，云端为备份/同步
 */

/**
 * 拼接 WebDAV 文件 URL
 */
function fileUri(config, filename) {
  let base = config.serverUrl.endsWith('/') ? config.serverUrl : config.serverUrl + '/'
  let dir = config.appDir.startsWith('/') ? config.appDir.substring(1) : config.appDir
  if (!dir.endsWith('/')) dir = dir + '/'
  return base + dir + filename
}

/**
 * 拼接目录 URL
 */
function dirUri(config) {
  let base = config.serverUrl.endsWith('/') ? config.serverUrl : config.serverUrl + '/'
  let dir = config.appDir.startsWith('/') ? config.appDir.substring(1) : config.appDir
  return base + dir
}

/**
 * 生成 Basic Auth 请求头
 */
function authHeaders(config) {
  const credentials = btoa(unescape(encodeURIComponent(config.username + ':' + config.password)))
  return {
    'Authorization': 'Basic ' + credentials
  }
}

/**
 * 1. 初始化云端目录（若不存在则自动创建 MKCOL）
 */
export async function ensureDirectoryExists(config) {
  const uri = dirUri(config)
  try {
    const response = await fetch(uri, {
      method: 'MKCOL',
      headers: authHeaders(config)
    })
    // 201 = 创建成功，405 = 已存在，都算正常
    return response.status === 201 || response.status === 405
  } catch (e) {
    console.warn('[WebDAV] 创建目录失败:', e.message)
    return false
  }
}

/**
 * 2. 上传数据文件到坚果云 (PUT)
 */
export async function uploadData(config, filename, data) {
  await ensureDirectoryExists(config)
  const uri = fileUri(config, filename)
  const jsonStr = JSON.stringify(data, null, 2)

  try {
    const response = await fetch(uri, {
      method: 'PUT',
      headers: {
        ...authHeaders(config),
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: jsonStr
    })
    return response.status === 200 || response.status === 201 || response.status === 204
  } catch (e) {
    console.warn('[WebDAV] 上传失败:', e.message)
    return false
  }
}

/**
 * 3. 从坚果云拉取数据文件 (GET)
 */
export async function downloadData(config, filename) {
  const uri = fileUri(config, filename)

  try {
    const response = await fetch(uri, {
      method: 'GET',
      headers: authHeaders(config)
    })

    if (response.status === 200) {
      return await response.json()
    } else if (response.status === 404) {
      // 云端尚无备份文件
      return null
    }
    return null
  } catch (e) {
    console.warn('[WebDAV] 下载失败:', e.message)
    return null
  }
}

/**
 * 4. 测试连接
 */
export async function testConnection(config) {
  try {
    const ok = await ensureDirectoryExists(config)
    return ok
  } catch {
    return false
  }
}

/**
 * 5. 双向合并策略
 * 基于日志的 date 字段去重合并（Union Merge）
 */
export function mergeData(localData, cloudData) {
  if (!cloudData) return localData
  if (!localData) return cloudData

  const merged = { ...localData }

  // 取较大的经验值和连击记录
  merged.exp = Math.max(localData.exp || 0, cloudData.exp || 0)
  merged.maxStreak = Math.max(localData.maxStreak || 0, cloudData.maxStreak || 0)

  // 合并打卡日志（按 date 去重，保留所有记录）
  const logMap = new Map()
  for (const log of (localData.logs || [])) {
    logMap.set(log.date, log)
  }
  for (const log of (cloudData.logs || [])) {
    if (!logMap.has(log.date)) {
      logMap.set(log.date, log)
    }
  }
  merged.logs = Array.from(logMap.values()).sort((a, b) => a.date.localeCompare(b.date))

  // 合并结算记录（按 date 去重）
  const settleMap = new Map()
  for (const s of (localData.settles || [])) {
    settleMap.set(s.date, s)
  }
  for (const s of (cloudData.settles || [])) {
    if (!settleMap.has(s.date)) {
      settleMap.set(s.date, s)
    }
  }
  merged.settles = Array.from(settleMap.values()).sort((a, b) => a.date.localeCompare(b.date))

  // 合并徽章（取并集）
  const badgeSet = new Set([...(localData.badges || []), ...(cloudData.badges || [])])
  merged.badges = Array.from(badgeSet)

  // 合并乐趣记录
  const funMap = new Map()
  for (const f of (localData.funLog || [])) {
    funMap.set(f.date, f)
  }
  for (const f of (cloudData.funLog || [])) {
    if (!funMap.has(f.date)) {
      funMap.set(f.date, f)
    }
  }
  merged.funLog = Array.from(funMap.values()).sort((a, b) => a.date.localeCompare(b.date))

  // 关卡进度取较大值
  merged.stages = { ...localData.stages }
  for (const [line, progress] of Object.entries(cloudData.stages || {})) {
    merged.stages[line] = Math.max(merged.stages[line] || 0, progress)
  }

  // 重新计算连击和 last（基于合并后的 logs）
  if (merged.logs.length > 0) {
    merged.last = merged.logs[merged.logs.length - 1].date
  }

  return merged
}

/**
 * 6. 执行完整同步流程：下载 → 合并 → 上传
 * @returns {{ success: boolean, message: string }}
 */
export async function syncData(config, localData) {
  const FILENAME = 'data.json'

  try {
    // 1. 从云端下载
    const cloudData = await downloadData(config, FILENAME)

    // 2. 合并
    const merged = mergeData(localData, cloudData)

    // 3. 上传合并后的数据
    const ok = await uploadData(config, FILENAME, merged)

    if (ok) {
      return { success: true, merged, message: '同步成功' }
    } else {
      return { success: false, merged: localData, message: '上传失败' }
    }
  } catch (e) {
    return { success: false, merged: localData, message: '同步失败: ' + e.message }
  }
}
