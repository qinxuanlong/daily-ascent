<template>
  <div v-if="show" class="modal-backdrop" @click.self="$emit('close')">
    <div class="guide-card">
      <div class="guide-header">
        <div class="header-left">
          <span class="guide-star">✦</span>
          <div>
            <h3 class="guide-title">手机全屏与安装指南</h3>
            <p class="guide-sub">彻底隐藏浏览器导航栏 · 像原生 App 一样全屏</p>
          </div>
        </div>
        <button class="guide-close" @click="$emit('close')">×</button>
      </div>

      <div class="guide-body">
        <!-- 标签页切换 -->
        <div class="platform-tabs">
          <button
            class="tab-btn"
            :class="{ active: currentTab === 'ios' }"
            @click="currentTab = 'ios'"
          >
            🍏 苹果 iPhone (Safari)
          </button>
          <button
            class="tab-btn"
            :class="{ active: currentTab === 'android' }"
            @click="currentTab = 'android'"
          >
            🤖 安卓手机 (Chrome)
          </button>
        </div>

        <!-- iOS 指南 -->
        <div v-if="currentTab === 'ios'" class="step-list">
          <div class="notice-tip">
            ⚠️ <strong>关键提示</strong>：必须在系统自带的 <strong>Safari 浏览器</strong> 中打开。微信或QQ内请先点右上角「···」选择「在 Safari 中打开」。
          </div>

          <div class="step-item">
            <span class="step-num">1</span>
            <div class="step-content">
              <div class="step-title">点击底部分享按钮</div>
              <div class="step-desc">在 Safari 底部正中间找到方框带箭头的图标 <span class="badge">📤 分享</span></div>
            </div>
          </div>

          <div class="step-item">
            <span class="step-num">2</span>
            <div class="step-content">
              <div class="step-title">选择「添加到主屏幕」</div>
              <div class="step-desc">在弹出的菜单中往下滑动，点击 <span class="badge">➕ 添加到主屏幕</span></div>
            </div>
          </div>

          <div class="step-item">
            <span class="step-num">3</span>
            <div class="step-content">
              <div class="step-title">确认并从桌面打开</div>
              <div class="step-desc">点击右上角「添加」，回到手机桌面点击「每日打卡」图标启动，<strong>所有浏览器导航栏即可彻底消失！</strong></div>
            </div>
          </div>
        </div>

        <!-- 安卓指南 -->
        <div v-else class="step-list">
          <div class="notice-tip" style="background: rgba(56, 189, 248, 0.12); border-color: rgba(56, 189, 248, 0.35); color: #bae6fd;">
            📦 <strong>原生 APK 安装包</strong>：亦可前往 GitHub Releases 下载 <strong>Daily-Ascent.apk</strong> 原生安装包，支持系统级离线定时通知提醒。
          </div>

          <div v-if="hasInstallPrompt" class="prompt-box">
            <p class="prompt-desc">检测到当前浏览器支持一键自动安装：</p>
            <button class="auto-install-btn" @click="$emit('trigger-install')">
              ✦ 立即一键安装到桌面 ✦
            </button>
          </div>

          <div class="step-item">
            <span class="step-num">1</span>
            <div class="step-content">
              <div class="step-title">打开浏览器菜单</div>
              <div class="step-desc">点击 Chrome 或自带浏览器右上角的 <span class="badge">⋮ 菜单</span></div>
            </div>
          </div>

          <div class="step-item">
            <span class="step-num">2</span>
            <div class="step-content">
              <div class="step-title">点击「安装应用」或「添加到主屏幕」</div>
              <div class="step-desc">选择 <span class="badge">📲 安装应用</span> 并确认添加</div>
            </div>
          </div>

          <div class="step-item">
            <span class="step-num">3</span>
            <div class="step-content">
              <div class="step-title">从桌面启动</div>
              <div class="step-desc">从手机桌面图标打开，即可获得与原生游戏 App 一致的 100% 沉浸全屏。</div>
            </div>
          </div>
        </div>
      </div>

      <div class="guide-footer">
        <button class="close-guide-btn" @click="$emit('close')">我知道了</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

withDefaults(
  defineProps<{
    show?: boolean
    hasInstallPrompt?: boolean
  }>(),
  {
    show: false,
    hasInstallPrompt: false
  }
)

defineEmits<{
  (e: 'close'): void
  (e: 'trigger-install'): void
}>()

// 自动检测系统，默认激活对应标签
const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent)
const currentTab = ref(isIOS ? 'ios' : 'android')
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(4, 9, 22, 0.78);
  backdrop-filter: blur(12px);
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  animation: fadeIn 0.25s ease-out;
}

.guide-card {
  width: 100%;
  max-width: 420px;
  background: linear-gradient(180deg, rgba(22, 34, 62, 0.98) 0%, rgba(12, 20, 42, 0.99) 100%);
  border: 1px solid rgba(243, 216, 130, 0.4);
  border-radius: 18px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.7), 0 0 20px rgba(243, 216, 130, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.guide-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 18px 12px;
  border-bottom: 1px solid rgba(243, 216, 130, 0.2);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.guide-star {
  color: #f3d882;
  font-size: 20px;
  filter: drop-shadow(0 0 8px rgba(243, 216, 130, 0.8));
}

.guide-title {
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
}

.guide-sub {
  font-size: 11px;
  color: #8fa7ca;
  margin-top: 2px;
}

.guide-close {
  background: transparent;
  border: none;
  color: #9cb0d0;
  font-size: 24px;
  cursor: pointer;
  padding: 4px;
}

.guide-body {
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.platform-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  background: rgba(10, 16, 32, 0.6);
  padding: 4px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.tab-btn {
  padding: 8px 10px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #8da2c0;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn.active {
  background: rgba(243, 216, 130, 0.18);
  color: #f3d882;
  border: 1px solid rgba(243, 216, 130, 0.4);
}

.notice-tip {
  font-size: 12px;
  color: #fcd34d;
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.3);
  padding: 8px 12px;
  border-radius: 10px;
  line-height: 1.5;
}

.step-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.step-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 10px 12px;
  background: rgba(24, 38, 70, 0.45);
  border: 1px solid rgba(243, 216, 130, 0.16);
  border-radius: 12px;
}

.step-num {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(243, 216, 130, 0.25);
  border: 1px solid #f3d882;
  color: #f3d882;
  font-size: 12px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.step-content {
  flex: 1;
}

.step-title {
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
}

.step-desc {
  font-size: 12px;
  color: #cbdcf7;
  margin-top: 3px;
  line-height: 1.5;
}

.badge {
  display: inline-block;
  background: rgba(255, 255, 255, 0.12);
  padding: 1px 6px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: #f3d882;
  font-weight: 600;
}

.prompt-box {
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.35);
  padding: 12px;
  border-radius: 12px;
  text-align: center;
}

.prompt-desc {
  font-size: 12px;
  color: #6ee7b7;
  margin-bottom: 8px;
}

.auto-install-btn {
  width: 100%;
  padding: 9px;
  background: linear-gradient(135deg, #ffd778 0%, #e6a836 100%);
  border: 1px solid rgba(255, 245, 210, 0.8);
  border-radius: 8px;
  color: #3b2203;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 0 12px rgba(243, 216, 130, 0.4);
}

.guide-footer {
  padding: 10px 18px 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  justify-content: flex-end;
}

.close-guide-btn {
  padding: 7px 20px;
  border-radius: 18px;
  background: rgba(243, 216, 130, 0.15);
  border: 1px solid rgba(243, 216, 130, 0.4);
  color: #f3d882;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleUp {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
