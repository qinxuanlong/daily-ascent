import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: './',
  plugins: [vue()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api/dav': {
        target: 'https://dav.jianguoyun.com/dav',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api\/dav/, ''),
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            // 移除坚果云返回的 WWW-Authenticate 头，避免浏览器弹出原生 HTTP Basic 认证弹窗
            delete proxyRes.headers['www-authenticate']
          })
        }
      }
    }
  }
})
