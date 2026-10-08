/**
 * 极简 Web Audio 纯合成音效模块
 * 采用浏览器原生 AudioContext 合成空灵清脆的磬铃提示音
 * 无需外挂音频文件，离线即时生效，0 网络开销
 */

let sharedAudioCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const AudioContextClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  if (!AudioContextClass) return null
  if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
    sharedAudioCtx = new AudioContextClass()
  }
  return sharedAudioCtx
}

/** 用户交互（如点击开启专注）时主动唤醒解锁 AudioContext */
export function resumeAudioContext(): void {
  try {
    const ctx = getAudioContext()
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }
  } catch {
    // 忽略异常
  }
}

/** 播放专注完成/打卡成功清脆磬铃音 */
export function playChimeSound(): void {
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }
    const now = ctx.currentTime

    // 主音 (528Hz 和平音)
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(528, now)
    osc1.frequency.exponentialRampToValueAtTime(792, now + 0.6)

    gain1.gain.setValueAtTime(0.25, now)
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.2)

    osc1.connect(gain1)
    gain1.connect(ctx.destination)

    // 泛音 (880Hz 高频银铃光泽)
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(880, now)

    gain2.gain.setValueAtTime(0.18, now)
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.6)

    osc2.connect(gain2)
    gain2.connect(ctx.destination)

    osc1.start(now)
    osc2.start(now)
    osc1.stop(now + 1.3)
    osc2.stop(now + 1.7)
  } catch {
    // 忽略自动播放受限异常
  }
}
