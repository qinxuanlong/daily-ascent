/**
 * 版本检测与自动更新服务模块
 * 基于 GitHub Releases REST API 实现
 */

export const APP_VERSION: string = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.0.0'
export const GITHUB_REPO = 'qinxuanlong/daily-ascent'

export interface UpdateCheckResult {
  hasUpdate: boolean
  currentVersion: string
  latestVersion: string
  releaseName: string
  releaseNotes: string
  downloadUrl: string
  releaseUrl: string
  publishedAt?: string
}

/**
 * 语义化版本号比较 (例如 '1.0.1' vs '1.0.0')
 * 返回 1 表示 v1 > v2, -1 表示 v1 < v2, 0 表示相等
 */
export function compareVersions(v1: string, v2: string): number {
  const clean1 = v1.replace(/^v/, '').trim()
  const clean2 = v2.replace(/^v/, '').trim()

  const parts1 = clean1.split('.').map((n) => parseInt(n, 10) || 0)
  const parts2 = clean2.split('.').map((n) => parseInt(n, 10) || 0)

  const maxLength = Math.max(parts1.length, parts2.length)
  for (let i = 0; i < maxLength; i++) {
    const num1 = parts1[i] || 0
    const num2 = parts2[i] || 0
    if (num1 > num2) return 1
    if (num1 < num2) return -1
  }
  return 0
}

/**
 * 检查 GitHub Releases 是否有新版本
 */
export async function checkForUpdate(currentVer: string = APP_VERSION): Promise<UpdateCheckResult> {
  const defaultResult: UpdateCheckResult = {
    hasUpdate: false,
    currentVersion: currentVer,
    latestVersion: currentVer,
    releaseName: '',
    releaseNotes: '',
    downloadUrl: `https://github.com/${GITHUB_REPO}/releases`,
    releaseUrl: `https://github.com/${GITHUB_REPO}/releases`
  }

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 6000)

    const resp = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`, {
      signal: controller.signal,
      headers: {
        Accept: 'application/vnd.github.v3+json'
      }
    })
    clearTimeout(timer)

    if (!resp.ok) {
      // 常见情况如 404 (暂无 release)
      return defaultResult
    }

    const data = await resp.json()
    const rawTag = (data.tag_name || '').trim()
    const latestVersion = rawTag.replace(/^v/, '')
    if (!latestVersion) return defaultResult

    const hasUpdate = compareVersions(latestVersion, currentVer) > 0

    // 查找挂载的 APK 安装包直接下载链接
    let apkDownloadUrl = ''
    if (Array.isArray(data.assets) && data.assets.length > 0) {
      const apkAsset = data.assets.find(
        (item: { name?: string; browser_download_url?: string }) =>
          typeof item.name === 'string' && item.name.toLowerCase().endsWith('.apk')
      )
      if (apkAsset && apkAsset.browser_download_url) {
        apkDownloadUrl = apkAsset.browser_download_url
      }
    }

    return {
      hasUpdate,
      currentVersion: currentVer,
      latestVersion,
      releaseName: data.name || `每日攀升 v${latestVersion}`,
      releaseNotes: data.body || '',
      downloadUrl: apkDownloadUrl || data.html_url || defaultResult.downloadUrl,
      releaseUrl: data.html_url || defaultResult.releaseUrl,
      publishedAt: data.published_at
    }
  } catch (err) {
    console.warn('检查更新失败 (可能处于离线或网络受限状态):', err)
    return defaultResult
  }
}
