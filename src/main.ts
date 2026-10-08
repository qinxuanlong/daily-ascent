import { createApp } from 'vue'
import App from './App.vue'
import './styles/main.css'

createApp(App).mount('#app')

// 注册 PWA Service Worker（满足 Android/Chrome 安装条件与离线能力）
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swPath = `${import.meta.env.BASE_URL || './'}sw.js`
    navigator.serviceWorker.register(swPath).catch((err: unknown) => {
      console.warn('ServiceWorker 注册失败:', err)
    })
  })
}
